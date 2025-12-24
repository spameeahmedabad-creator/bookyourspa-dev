import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyPaymentSignature, fetchPayment } from "@/lib/razorpay";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import Spa from "@/models/Spa";
import Coupon from "@/models/Coupon";
import {
  sendWhatsAppBookingConfirmation,
  sendWhatsAppSpaOwnerNotification,
} from "@/lib/fast2sms";
import {
  sendBookingConfirmationEmail,
  sendBookingNotificationToOwner,
} from "@/lib/email";
import { format } from "date-fns";

/**
 * Verify Razorpay payment and confirm booking
 * POST /api/payments/verify
 */
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
    } = data;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      console.error("Invalid payment signature", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      // Update booking and payment status to failed
      await Booking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "failed",
          status: "cancelled",
        }
      );

      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: "failed",
          errorCode: "SIGNATURE_VERIFICATION_FAILED",
          errorDescription: "Payment signature verification failed",
        }
      );

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await Booking.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is already paid
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        booking,
      });
    }

    // Fetch payment details from Razorpay
    let paymentDetails;
    try {
      paymentDetails = await fetchPayment(razorpay_payment_id);
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
    }

    // Update booking with payment details
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paymentStatus = "paid";
    booking.paymentMethod = "razorpay";
    booking.status = "confirmed";
    booking.paidAt = new Date();
    await booking.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "captured",
        paidAt: new Date(),
        method: paymentDetails?.method || null,
        bank: paymentDetails?.bank || null,
        wallet: paymentDetails?.wallet || null,
        vpa: paymentDetails?.vpa || null,
        cardDetails: paymentDetails?.card
          ? {
              last4: paymentDetails.card.last4,
              network: paymentDetails.card.network,
              type: paymentDetails.card.type,
              issuer: paymentDetails.card.issuer,
            }
          : null,
      }
    );

    // Increment coupon usage if applied
    if (booking.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: booking.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Get spa details for notifications
    const spa = await Spa.findById(booking.spaId).populate(
      "ownerId",
      "name phone email"
    );

    // Format date and time for messages
    const formattedDateTime = `${format(
      new Date(booking.date),
      "MMMM dd, yyyy"
    )} at ${booking.time}`;
    const location =
      spa?.location?.address || spa?.location?.region || "Location not specified";

    // Send WhatsApp confirmation to customer
    try {
      await sendWhatsAppBookingConfirmation(
        booking.customerPhone,
        booking.customerName,
        spa?.title || booking.snapshot?.spaName,
        booking.service,
        location,
        formattedDateTime
      );
    } catch (err) {
      console.error("Failed to send WhatsApp confirmation:", err);
    }

    // Send email confirmation to customer
    const customerEmail = booking.customerEmail;
    if (customerEmail) {
      try {
        await sendBookingConfirmationEmail(
          customerEmail,
          booking.customerName,
          spa?.title || booking.snapshot?.spaName,
          booking.service,
          location,
          formattedDateTime
        );
      } catch (err) {
        console.error("Failed to send email confirmation:", err);
      }
    }

    // Send WhatsApp notification to spa owner
    if (spa?.ownerId?.phone) {
      try {
        await sendWhatsAppSpaOwnerNotification(
          spa.ownerId.phone,
          spa.ownerId.name,
          spa.title,
          booking.customerName,
          booking.customerPhone,
          booking.service,
          formattedDateTime
        );
      } catch (err) {
        console.error("Failed to send owner WhatsApp notification:", err);
      }
    }

    // Send email notification to spa owner
    if (spa?.ownerId?.email) {
      try {
        await sendBookingNotificationToOwner(
          spa.ownerId.email,
          spa.ownerId.name,
          spa.title,
          booking.customerName,
          booking.customerPhone,
          booking.service,
          formattedDateTime
        );
      } catch (err) {
        console.error("Failed to send owner email notification:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        finalAmount: booking.finalAmount,
        spaName: spa?.title || booking.snapshot?.spaName,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}


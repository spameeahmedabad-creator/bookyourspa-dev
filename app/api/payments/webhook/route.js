import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyWebhookSignature, fetchPayment } from "@/lib/razorpay";
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
 * Handle Razorpay webhook events
 * POST /api/payments/webhook
 * 
 * Events handled:
 * - payment.captured: Payment was successful
 * - payment.failed: Payment failed
 * - refund.created: Refund was initiated
 */
export async function POST(request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    await dbConnect();
    const event = JSON.parse(rawBody);
    const { event: eventType, payload } = event;

    console.log(`Received Razorpay webhook: ${eventType}`);

    switch (eventType) {
      case "payment.captured":
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity);
        break;

      case "refund.created":
        await handleRefundCreated(payload.refund.entity);
        break;

      case "order.paid":
        // Order paid event - can be used for additional verification
        console.log("Order paid:", payload.order.entity.id);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payment) {
  const { id: paymentId, order_id: orderId, method, bank, wallet, vpa, card } = payment;

  // Find and update payment record
  const paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
  if (!paymentRecord) {
    console.error("Payment record not found for order:", orderId);
    return;
  }

  // Check if already processed
  if (paymentRecord.status === "captured") {
    console.log("Payment already captured:", paymentId);
    return;
  }

  // Update payment record
  paymentRecord.razorpayPaymentId = paymentId;
  paymentRecord.status = "captured";
  paymentRecord.paidAt = new Date();
  paymentRecord.method = method;
  paymentRecord.bank = bank;
  paymentRecord.wallet = wallet;
  paymentRecord.vpa = vpa;
  if (card) {
    paymentRecord.cardDetails = {
      last4: card.last4,
      network: card.network,
      type: card.type,
      issuer: card.issuer,
    };
  }
  await paymentRecord.save();

  // Find and update booking
  const booking = await Booking.findOne({ razorpayOrderId: orderId });
  if (!booking) {
    console.error("Booking not found for order:", orderId);
    return;
  }

  // Check if already confirmed
  if (booking.paymentStatus === "paid") {
    console.log("Booking already paid:", booking._id);
    return;
  }

  // Update booking
  booking.razorpayPaymentId = paymentId;
  booking.paymentStatus = "paid";
  booking.paymentMethod = "razorpay";
  booking.status = "confirmed";
  booking.paidAt = new Date();
  await booking.save();

  // Increment coupon usage if applied
  if (booking.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: booking.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // Send notifications
  await sendBookingNotifications(booking);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payment) {
  const {
    order_id: orderId,
    error_code: errorCode,
    error_description: errorDescription,
  } = payment;

  // Update payment record
  await Payment.findOneAndUpdate(
    { razorpayOrderId: orderId },
    {
      status: "failed",
      errorCode,
      errorDescription,
    }
  );

  // Update booking
  await Booking.findOneAndUpdate(
    { razorpayOrderId: orderId },
    {
      paymentStatus: "failed",
      status: "cancelled",
    }
  );

  console.log(`Payment failed for order ${orderId}: ${errorDescription}`);
}

/**
 * Handle refund created
 */
async function handleRefundCreated(refund) {
  const { payment_id: paymentId, id: refundId, amount } = refund;

  // Update payment record
  await Payment.findOneAndUpdate(
    { razorpayPaymentId: paymentId },
    {
      status: "refunded",
      refundId,
      refundAmount: amount / 100, // Convert from paise
      refundedAt: new Date(),
    }
  );

  // Update booking
  await Booking.findOneAndUpdate(
    { razorpayPaymentId: paymentId },
    {
      paymentStatus: "refunded",
      status: "cancelled",
    }
  );

  console.log(`Refund created for payment ${paymentId}: ₹${amount / 100}`);
}

/**
 * Send booking confirmation notifications
 */
async function sendBookingNotifications(booking) {
  try {
    const spa = await Spa.findById(booking.spaId).populate(
      "ownerId",
      "name phone email"
    );

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
      console.error("Webhook: Failed to send WhatsApp confirmation:", err);
    }

    // Send email confirmation to customer
    if (booking.customerEmail) {
      try {
        await sendBookingConfirmationEmail(
          booking.customerEmail,
          booking.customerName,
          spa?.title || booking.snapshot?.spaName,
          booking.service,
          location,
          formattedDateTime
        );
      } catch (err) {
        console.error("Webhook: Failed to send email confirmation:", err);
      }
    }

    // Send notifications to spa owner
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
        console.error("Webhook: Failed to send owner WhatsApp:", err);
      }
    }

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
        console.error("Webhook: Failed to send owner email:", err);
      }
    }
  } catch (error) {
    console.error("Failed to send booking notifications:", error);
  }
}


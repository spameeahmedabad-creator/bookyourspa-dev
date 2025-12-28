import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { createOrder } from "@/lib/razorpay";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import Spa from "@/models/Spa";
import Coupon from "@/models/Coupon";
import { verifyToken } from "@/lib/jwt";

// GST rate for spa services (18%)
const GST_RATE = 0.18;
// Fixed booking fee amount (in paise for Razorpay)
const BOOKING_FEE = 199 * 100; // Rs.199

/**
 * Create a Razorpay order for booking payment
 * POST /api/payments/create-order
 */
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      spaId,
      service,
      date,
      time,
      couponCode,
      paymentType = "full", // "full" or "booking_only"
    } = data;

    // Validate required fields
    if (
      !customerName ||
      !customerPhone ||
      !spaId ||
      !service ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get spa details
    const spa = await Spa.findById(spaId).populate(
      "ownerId",
      "name phone email"
    );
    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    // Validate booking time against store hours
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    if (dayOfWeek === 0 && spa.storeHours?.sundayClosed) {
      return NextResponse.json(
        { error: "This spa is closed on Sundays. Please select another day." },
        { status: 400 }
      );
    }

    // Validate booking time is within store hours
    if (
      spa.storeHours?.openingTime &&
      spa.storeHours?.closingTime &&
      !spa.storeHours?.is24Hours
    ) {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const openingMinutes = timeToMinutes(spa.storeHours.openingTime);
      const closingMinutes = timeToMinutes(spa.storeHours.closingTime);
      const bookingMinutes = timeToMinutes(time);

      if (bookingMinutes < openingMinutes || bookingMinutes >= closingMinutes) {
        return NextResponse.json(
          {
            error: `Booking time must be between ${spa.storeHours.openingTime} and ${spa.storeHours.closingTime}.`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user is logged in
    const token = request.cookies.get("token")?.value;
    let userId = null;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // Calculate order amount from service price
    let originalAmount = 0;
    const servicePricing = spa.pricing?.find((p) => p.title === service);
    if (servicePricing && servicePricing.price) {
      originalAmount = servicePricing.price;
    }

    if (originalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid service or price not found" },
        { status: 400 }
      );
    }

    // Prepare service snapshot
    const serviceSnapshot = servicePricing
      ? {
          title: servicePricing.title,
          description: servicePricing.description || null,
          price: servicePricing.price,
          duration: servicePricing.multiplier || null,
        }
      : {
          title: service,
          description: null,
          price: originalAmount,
          duration: null,
        };

    // Validate and apply coupon if provided
    let couponCodeToUse = null;
    let discountAmount = 0;
    let couponSnapshot = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        $or: [{ scope: "global" }, { scope: "spa", spaId }],
      });

      if (coupon) {
        const now = new Date();
        if (
          now >= coupon.startDate &&
          now <= coupon.endDate &&
          (coupon.usageLimit === null ||
            coupon.usedCount < coupon.usageLimit) &&
          originalAmount >= coupon.minOrderAmount
        ) {
          let canUse = true;
          if (userId) {
            const userUsageCount = await Booking.countDocuments({
              userId,
              couponCode: couponCode.toUpperCase(),
              paymentStatus: "paid",
            });
            if (userUsageCount >= coupon.perUserLimit) {
              canUse = false;
            }
          }

          if (canUse) {
            couponCodeToUse = coupon.code;
            discountAmount = coupon.calculateDiscount(originalAmount);
            couponSnapshot = {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
            };
          }
        }
      }
    }

    // Calculate GST and final amount
    const amountAfterDiscount = Math.max(0, originalAmount - discountAmount);
    // GST is included in the price, so we calculate the base amount
    const baseAmount =
      Math.round((amountAfterDiscount / (1 + GST_RATE)) * 100) / 100;
    const gstAmount =
      Math.round((amountAfterDiscount - baseAmount) * 100) / 100;
    const finalAmount = amountAfterDiscount;

    // Determine payment amounts based on payment type
    // Note: createOrder expects amount in rupees, it will convert to paise internally
    let paymentAmount = finalAmount; // Amount to charge via Razorpay (in rupees)
    let paidAmount = finalAmount; // Amount paid (in rupees)
    let pendingAmount = 0; // Amount pending (to be paid at spa, in rupees)

    if (paymentType === "booking_only") {
      paymentAmount = BOOKING_FEE / 100; // Rs.199 (convert from paise to rupees)
      paidAmount = BOOKING_FEE / 100; // Rs.199
      pendingAmount = finalAmount - paidAmount; // Remaining amount
    }

    // Create pending booking
    const booking = await Booking.create({
      userId,
      spaId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      service,
      date: new Date(date),
      time,
      status: "pending", // Will be confirmed after payment
      paymentStatus: "pending",
      paymentType: paymentType,
      paidAmount: paidAmount,
      pendingAmount: pendingAmount,
      couponCode: couponCodeToUse,
      discountAmount,
      originalAmount,
      finalAmount,
      baseAmount,
      gstAmount,
      snapshot: {
        spaName: spa.title,
        spaLocation: {
          address: spa.location?.address || null,
          region: spa.location?.region || null,
        },
        spaPhone: spa.contact?.phone || spa.ownerId?.phone || null,
        serviceDetails: serviceSnapshot,
        couponDetails: couponSnapshot,
      },
    });

    // Generate unique receipt ID
    const receipt = `BYS_${booking._id.toString().slice(-8)}_${Date.now()}`;

    // Create Razorpay order with appropriate amount (in rupees)
    const razorpayOrder = await createOrder({
      amount: paymentAmount, // Amount in rupees (createOrder will convert to paise)
      currency: "INR",
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        spaName: spa.title,
        service,
        customerName,
        customerPhone,
        paymentType: paymentType,
      },
    });

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    // Create payment record
    const bookingFeeAmount = BOOKING_FEE / 100; // Convert paise to rupees
    await Payment.create({
      bookingId: booking._id,
      userId,
      razorpayOrderId: razorpayOrder.id,
      amount: paymentAmount, // Already in rupees
      baseAmount:
        paymentType === "booking_only" ? bookingFeeAmount : baseAmount,
      gstAmount: paymentType === "booking_only" ? 0 : gstAmount, // Booking fee is flat, no GST breakdown
      currency: "INR",
      paymentType: paymentType,
      status: "created",
      customerDetails: {
        name: customerName,
        email: customerEmail || null,
        phone: customerPhone,
      },
      metadata: {
        spaId,
        spaName: spa.title,
        service,
        date,
        time,
        couponCode: couponCodeToUse,
        discountAmount,
        finalAmount,
        pendingAmount: paymentType === "booking_only" ? pendingAmount : 0,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      booking: {
        id: booking._id,
        originalAmount,
        discountAmount,
        baseAmount,
        gstAmount,
        finalAmount,
        paymentType: paymentType,
        paidAmount: paidAmount,
        pendingAmount: pendingAmount,
      },
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefill: {
        name: customerName,
        email: customerEmail || "",
        contact: customerPhone,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/jwt";

// POST validate and apply coupon
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { code, spaId, orderAmount } = data;

    if (!code || !spaId || orderAmount === undefined) {
      return NextResponse.json(
        { error: "Code, spaId, and orderAmount are required" },
        { status: 400 }
      );
    }

    // Find coupon (check both global and spa-specific)
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      $or: [{ scope: "global" }, { scope: "spa", spaId }],
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, reason: "Invalid coupon code" },
        { status: 200 }
      );
    }

    // Check if coupon is valid (dates, usage limits)
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json(
        { valid: false, reason: "Coupon has expired or not yet active" },
        { status: 200 }
      );
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, reason: "Coupon usage limit reached" },
        { status: 200 }
      );
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          valid: false,
          reason: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
        },
        { status: 200 }
      );
    }

    // Check per-user limit if user is logged in
    const token = request.cookies.get("token")?.value;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded && decoded.userId) {
        const userUsageCount = await Booking.countDocuments({
          userId: decoded.userId,
          couponCode: code.toUpperCase(),
        });

        if (userUsageCount >= coupon.perUserLimit) {
          return NextResponse.json(
            {
              valid: false,
              reason: `You have already used this coupon ${coupon.perUserLimit} time(s)`,
            },
            { status: 200 }
          );
        }
      }
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discountAmount,
      originalAmount: orderAmount,
      finalAmount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

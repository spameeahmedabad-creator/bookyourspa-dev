import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Spa from "@/models/Spa";
import { verifyToken } from "@/lib/jwt";

// PUT update coupon (Admin or Spa Owner)
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Check authorization
    if (decoded.role === "spa_owner") {
      if (coupon.scope === "global") {
        return NextResponse.json(
          { error: "Spa owners cannot modify global coupons" },
          { status: 403 }
        );
      }
      if (coupon.scope === "spa") {
        const spa = await Spa.findById(coupon.spaId);
        if (!spa || spa.ownerId.toString() !== decoded.userId) {
          return NextResponse.json(
            { error: "You can only modify coupons for your own spas" },
            { status: 403 }
          );
        }
      }
    } else if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    const {
      isActive,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      minOrderAmount,
      showBanner,
      bannerText,
      bannerColor,
    } = data;

    // Update allowed fields
    if (isActive !== undefined) coupon.isActive = isActive;
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (perUserLimit !== undefined) coupon.perUserLimit = perUserLimit;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    // Banner settings
    if (showBanner !== undefined) coupon.showBanner = showBanner;
    if (bannerText !== undefined) coupon.bannerText = bannerText;
    if (bannerColor !== undefined) coupon.bannerColor = bannerColor;

    await coupon.save();

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate("spaId", "title")
      .populate("createdBy", "name email");

    return NextResponse.json({ success: true, coupon: populatedCoupon });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE coupon (Admin only)
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Spa from "@/models/Spa";
import { verifyToken } from "@/lib/jwt";

// GET coupons (filtered by scope and spa)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope"); // "global" or "spa"
    const spaId = searchParams.get("spaId");
    const code = searchParams.get("code"); // For validation

    // If code is provided, return single coupon for validation
    if (code) {
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ coupon });
    }

    // Build query
    const query = {};
    if (scope) {
      query.scope = scope;
    }
    if (spaId) {
      query.spaId = spaId;
    }

    // Check authentication for listing coupons
    const token = request.cookies.get("token")?.value;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        // If user is spa owner, only show their spa's coupons
        if (decoded.role === "spa_owner") {
          const ownedSpas = await Spa.find({ ownerId: decoded.userId }).select(
            "_id"
          );
          const spaIds = ownedSpas.map((spa) => spa._id);
          query.$or = [{ scope: "global" }, { spaId: { $in: spaIds } }];
        }
        // Admin can see all coupons
      }
    } else {
      // Public: only show active global coupons
      query.scope = "global";
      query.isActive = true;
    }

    const coupons = await Coupon.find(query)
      .populate("spaId", "title")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST create coupon (Admin or Spa Owner)
export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only admin and spa_owner can create coupons
    if (decoded.role !== "admin" && decoded.role !== "spa_owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const data = await request.json();
    const {
      code,
      type,
      value,
      scope,
      spaId,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      minOrderAmount,
      showBanner,
      bannerText,
      bannerColor,
    } = data;

    // Validation
    if (!code || !type || value === undefined || !scope) {
      return NextResponse.json(
        { error: "Code, type, value, and scope are required" },
        { status: 400 }
      );
    }

    if (type === "percent" && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percent discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (type === "fixed" && value < 0) {
      return NextResponse.json(
        { error: "Fixed discount must be positive" },
        { status: 400 }
      );
    }

    if (scope === "spa" && !spaId) {
      return NextResponse.json(
        { error: "spaId is required for spa-scoped coupons" },
        { status: 400 }
      );
    }

    if (scope === "global" && spaId) {
      return NextResponse.json(
        { error: "spaId should not be provided for global coupons" },
        { status: 400 }
      );
    }

    // If spa owner, verify they own the spa
    if (scope === "spa" && decoded.role === "spa_owner") {
      const spa = await Spa.findById(spaId);
      if (!spa) {
        return NextResponse.json({ error: "Spa not found" }, { status: 404 });
      }
      if (spa.ownerId.toString() !== decoded.userId) {
        return NextResponse.json(
          { error: "You can only create coupons for your own spas" },
          { status: 403 }
        );
      }
    }

    // Check for duplicate code in same scope/spa
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
      scope,
      spaId: scope === "spa" ? spaId : null,
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists for this scope/spa" },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      scope,
      spaId: scope === "spa" ? spaId : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      minOrderAmount: minOrderAmount || 0,
      createdBy: decoded.userId,
      // Banner settings
      showBanner: showBanner || false,
      bannerText: bannerText || "",
      bannerColor: bannerColor || "emerald",
    });

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate("spaId", "title")
      .populate("createdBy", "name email");

    return NextResponse.json(
      { success: true, coupon: populatedCoupon },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create coupon error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

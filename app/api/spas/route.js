import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Spa from "@/models/Spa";
import Coupon from "@/models/Coupon";
import User from "@/models/User"; // Import User model to ensure it's registered for populate
import { verifyToken } from "@/lib/jwt";

// GET all spas with pagination
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 6;
    const skip = (page - 1) * limit;
    const ownerId = searchParams.get("ownerId");

    // Build query
    const query = {};
    if (ownerId) {
      query.ownerId = ownerId;
    }

    let spas;
    try {
      // Try to populate ownerId, but gracefully handle if it fails
      spas = await Spa.find(query)
        .populate("ownerId", "name email role")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    } catch (populateError) {
      // If populate fails, fetch spas without populating
      console.warn(
        "Populate failed, fetching spas without owner data:",
        populateError.message,
      );
      spas = await Spa.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const total = await Spa.countDocuments(query);

    // Attach best active coupon per spa (single query, no N+1)
    const spaIds = spas.map((s) => s._id);
    const now = new Date();
    const activeCoupons = await Coupon.find({
      spaId: { $in: spaIds },
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    }).select("spaId type value code");

    // Map spaId → best coupon (highest value)
    const bestCouponBySpa = {};
    for (const coupon of activeCoupons) {
      const key = String(coupon.spaId);
      if (!bestCouponBySpa[key] || coupon.value > bestCouponBySpa[key].value) {
        bestCouponBySpa[key] = coupon;
      }
    }

    const spasWithCoupons = spas.map((spa) => {
      const plain = spa.toObject ? spa.toObject() : { ...spa };
      plain.activeCoupon = bestCouponBySpa[String(spa._id)] || null;
      return plain;
    });

    return NextResponse.json({
      spas: spasWithCoupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get spas error:", error);
    return NextResponse.json(
      { error: "Failed to fetch spas", details: error.message },
      { status: 500 },
    );
  }
}

// POST create new spa (Admin/Owner only)
export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (
      !decoded ||
      (decoded.role !== "admin" && decoded.role !== "spa_owner")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const data = await request.json();

    const spa = await Spa.create({
      ...data,
      ownerId: decoded.userId,
    });

    return NextResponse.json({ success: true, spa }, { status: 201 });
  } catch (error) {
    console.error("Create spa error:", error);
    return NextResponse.json(
      { error: "Failed to create spa" },
      { status: 500 },
    );
  }
}

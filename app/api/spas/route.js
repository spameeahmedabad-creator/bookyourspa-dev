import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Spa from "@/models/Spa";
import { verifyToken } from "@/lib/jwt";

// GET all spas with pagination
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 6;
    const skip = (page - 1) * limit;

    const spas = await Spa.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Spa.countDocuments();

    return NextResponse.json({
      spas,
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
      { error: "Failed to fetch spas" },
      { status: 500 }
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
      { status: 500 }
    );
  }
}

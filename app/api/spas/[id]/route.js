import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Spa from "@/models/Spa";
import { verifyToken } from "@/lib/jwt";

// GET single spa
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const spa = await Spa.findById(id);

    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    return NextResponse.json({ spa });
  } catch (error) {
    console.error("Get spa error:", error);
    return NextResponse.json({ error: "Failed to fetch spa" }, { status: 500 });
  }
}

// PUT update spa (Owner only)
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
    const spa = await Spa.findById(id);

    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    // Check if user is owner or admin
    if (decoded.role !== "admin" && spa.ownerId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    Object.assign(spa, data);
    await spa.save();

    return NextResponse.json({ success: true, spa });
  } catch (error) {
    console.error("Update spa error:", error);
    return NextResponse.json(
      { error: "Failed to update spa" },
      { status: 500 }
    );
  }
}

// DELETE spa (Admin only)
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
    const spa = await Spa.findByIdAndDelete(id);

    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Spa deleted" });
  } catch (error) {
    console.error("Delete spa error:", error);
    return NextResponse.json(
      { error: "Failed to delete spa" },
      { status: 500 }
    );
  }
}

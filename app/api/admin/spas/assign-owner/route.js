import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import Spa from "@/models/Spa";
import User from "@/models/User";

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { spaId, ownerId } = await request.json();

    if (!spaId || !ownerId) {
      return NextResponse.json(
        { error: "spaId and ownerId are required" },
        { status: 400 }
      );
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return NextResponse.json({ error: "Owner user not found" }, { status: 404 });
    }

    if (owner.role !== "spa_owner") {
      return NextResponse.json(
        { error: "Selected user is not a spa owner" },
        { status: 400 }
      );
    }

    const spa = await Spa.findById(spaId);
    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    spa.ownerId = owner._id;
    await spa.save();

    return NextResponse.json(
      { success: true, message: "Spa owner updated successfully", spa },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assign spa owner error:", error);
    return NextResponse.json(
      { error: "Failed to assign spa owner" },
      { status: 500 }
    );
  }
}



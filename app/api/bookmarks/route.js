import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Spa from "@/models/Spa";
import { verifyToken } from "@/lib/jwt";

// POST - Add bookmark
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

    const { spaId } = await request.json();
    if (!spaId) {
      return NextResponse.json({ error: "Spa ID required" }, { status: 400 });
    }

    await dbConnect();

    // Verify spa exists
    const spa = await Spa.findById(spaId);
    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    // Add bookmark if not already bookmarked
    const user = await User.findById(decoded.userId);
    if (user.bookmarks.includes(spaId)) {
      return NextResponse.json({ message: "Already bookmarked" });
    }

    user.bookmarks.push(spaId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Bookmark added",
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to add bookmark" },
      { status: 500 }
    );
  }
}

// DELETE - Remove bookmark
export async function DELETE(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spaId = searchParams.get("spaId");

    if (!spaId) {
      return NextResponse.json({ error: "Spa ID required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    user.bookmarks = user.bookmarks.filter((id) => id.toString() !== spaId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Bookmark removed",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}

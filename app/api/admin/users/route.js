import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Spa from "@/models/Spa";

// GET all users (Admin only)
export async function GET(request) {
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
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    const userQuery = {};
    if (roleFilter) {
      userQuery.role = roleFilter;
    }

    const users = await User.find(userQuery)
      .select("name email phone role googleId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Attach spa counts for spa owners
    const userIds = users.map((u) => u._id);
    const spaCounts = await Spa.aggregate([
      { $match: { ownerId: { $in: userIds } } },
      { $group: { _id: "$ownerId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(spaCounts.map((sc) => [String(sc._id), sc.count]));

    const enrichedUsers = users.map((u) => ({
      ...u,
      spasOwned: countMap.get(String(u._id)) || 0,
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create new user with specific role (Admin only)
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
    const { name, phone, role } = await request.json();

    // Validation
    if (!name || !phone || !role) {
      return NextResponse.json(
        { error: "Name, phone, and role are required" },
        { status: 400 }
      );
    }

    if (!["customer", "spa_owner", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      phone,
      role,
      bookmarks: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        message: "No token found",
        cookie: null,
        user: null,
      });
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({
        authenticated: false,
        message: "Invalid token",
        cookie: "exists but invalid",
        user: null,
      });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select("-__v");

    return NextResponse.json({
      authenticated: true,
      message: "Authenticated successfully",
      cookie: "valid",
      tokenData: {
        userId: decoded.userId,
        phone: decoded.phone,
        name: decoded.name,
        role: decoded.role,
      },
      databaseUser: user
        ? {
            id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

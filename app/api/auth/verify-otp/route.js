import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTPSession from "@/models/OTPSession";
import { signToken } from "@/lib/jwt";
import { validatePhone } from "@/lib/phone-validation";

export async function POST(request) {
  try {
    await dbConnect();
    const { phone, otp, name } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    const phoneValidation = validatePhone(phone, "IN");
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error || "Invalid phone number" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be a 6-digit number" },
        { status: 400 }
      );
    }

    const formattedPhone = phoneValidation.formatted;

    // Find OTP session
    const otpSession = await OTPSession.findOne({
      phone: formattedPhone,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpSession) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      user = await User.create({
        phone: formattedPhone,
        name: name?.trim(),
        role: "customer",
      });
    } else if (name && user.name !== name.trim()) {
      user.name = name.trim();
      await user.save();
    }

    // Delete OTP session
    await OTPSession.deleteOne({ _id: otpSession._id });

    // Generate JWT token
    const token = await signToken({
      userId: user._id.toString(),
      phone: user.phone,
      name: user.name,
      role: user.role,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

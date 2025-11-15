import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import OTPSession from "@/models/OTPSession";
import { sendOTP } from "@/lib/twilio";

export async function POST(request) {
  try {
    await dbConnect();
    const { phone, name } = await request.json();

    if (!phone || !name) {
      return NextResponse.json(
        { error: "Phone and name are required" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP sessions for this phone
    await OTPSession.deleteMany({ phone });

    // Create new OTP session
    await OTPSession.create({ phone, otp, expiresAt });

    // Send OTP via Twilio
    // const result = await sendOTP(phone, otp);

    return NextResponse.json({
      success: true,
      // message: result.message,
      message: "We are in development mode so we can afford OTP cost",
      otp,
      // In development, return OTP for testing (remove in production)
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import OTPSession from "@/models/OTPSession";
import { sendOTP } from "@/lib/twilio";
import { validatePhone } from "@/lib/phone-validation";

export async function POST(request) {
  try {
    await dbConnect();
    const { phone, name } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
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

    const formattedPhone = phoneValidation.formatted;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP sessions for this phone
    await OTPSession.deleteMany({ phone: formattedPhone });

    // Create new OTP session
    await OTPSession.create({ phone: formattedPhone, otp, expiresAt });

    // Send OTP via Twilio
    const result = await sendOTP(formattedPhone, otp);

    return NextResponse.json({
      success: true,
      message: result.message || "OTP sent successfully",
      // In development, return OTP for testing (remove in production)
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

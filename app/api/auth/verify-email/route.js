import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import EmailVerificationToken from "@/models/EmailVerificationToken";
import { signToken } from "@/lib/jwt";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?error=missing_token", request.url)
      );
    }

    // Find verification token
    const verificationToken = await EmailVerificationToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid_or_expired", request.url)
      );
    }

    // Find user by email
    const user = await User.findOne({ email: verificationToken.email });

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=user_not_found", request.url)
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    await user.save();

    // Delete verification token
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Auto-login user by generating token
    const jwtToken = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    });

    // Redirect to home with token in cookie
    const response = NextResponse.redirect(new URL("/?verified=true", request.url));
    response.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Email Verification Error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=verification_failed", request.url)
    );
  }
}


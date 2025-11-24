import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { validateEmail } from "@/lib/form-validation";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(
      `forgot-password:${clientIP}`,
      3,
      60 * 60 * 1000
    ); // 3 attempts per hour

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many password reset requests. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    await dbConnect();
    const { email } = await request.json();

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error || "Invalid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user (include password field to check if user has password)
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    // Don't reveal if user exists or not (security best practice)
    // But we'll still send a success message
    if (!user) {
      // Return success even if user doesn't exist (prevent email enumeration)
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Check if user has password (not Google-only account)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Delete any existing reset tokens for this email
    await PasswordResetToken.deleteMany({ email: normalizedEmail });

    // Generate reset token
    const token = PasswordResetToken.generateToken();
    await PasswordResetToken.create({
      email: normalizedEmail,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    });

    // Send password reset email
    await sendPasswordResetEmail(normalizedEmail, user.name, token);

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}

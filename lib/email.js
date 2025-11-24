import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // true for 465, false for other ports
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const EMAIL_ENABLED =
  SMTP_HOST && SMTP_USER && SMTP_PASSWORD && SMTP_HOST.trim() !== "";

const FROM_EMAIL =
  process.env.FROM_EMAIL || "BookYourSpa <noreply@bookyourspa.com>";
const BASE_URL =
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

// Create transporter if email is enabled
const transporter = EMAIL_ENABLED
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      // Optional: Add TLS options for better security
      tls: {
        rejectUnauthorized: false, // Set to true in production with valid certificates
      },
    })
  : null;

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @param {string} token - Verification token
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function sendVerificationEmail(email, name, token) {
  if (!EMAIL_ENABLED) {
    console.log(`[MOCKED] Verification email to ${email}:`, {
      name,
      token,
      verificationUrl: `${BASE_URL}/api/auth/verify-email?token=${token}`,
    });
    return {
      success: true,
      message: "Verification email sent (mocked)",
    };
  }

  try {
    const verificationUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your BookYourSpa account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">BookYourSpa</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-top: 0;">Hello ${name}!</h2>
              <p style="color: #4b5563;">Thank you for signing up for BookYourSpa. Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Verify Email Address</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #10b981; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} BookYourSpa. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(
      "[Email] Verification email sent successfully:",
      info.messageId
    );
    return {
      success: true,
      message: "Verification email sent successfully",
      emailId: info.messageId,
    };
  } catch (error) {
    console.error("[Email] Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email",
      error: error.message,
    };
  }
}

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @param {string} token - Reset token
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function sendPasswordResetEmail(email, name, token) {
  if (!EMAIL_ENABLED) {
    console.log(`[MOCKED] Password reset email to ${email}:`, {
      name,
      token,
      resetUrl: `${BASE_URL}/reset-password?token=${token}`,
    });
    return {
      success: true,
      message: "Password reset email sent (mocked)",
    };
  }

  try {
    const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your BookYourSpa password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">BookYourSpa</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-top: 0;">Hello ${name}!</h2>
              <p style="color: #4b5563;">We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #10b981; font-size: 12px; word-break: break-all;">${resetUrl}</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} BookYourSpa. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(
      "[Email] Password reset email sent successfully:",
      info.messageId
    );
    return {
      success: true,
      message: "Password reset email sent successfully",
      emailId: info.messageId,
    };
  } catch (error) {
    console.error("[Email] Error sending password reset email:", error);
    return {
      success: false,
      message: "Failed to send password reset email",
      error: error.message,
    };
  }
}

/**
 * Send welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function sendWelcomeEmail(email, name) {
  if (!EMAIL_ENABLED) {
    console.log(`[MOCKED] Welcome email to ${email}:`, { name });
    return {
      success: true,
      message: "Welcome email sent (mocked)",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to BookYourSpa!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to BookYourSpa</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">BookYourSpa</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-top: 0;">Welcome, ${name}!</h2>
              <p style="color: #4b5563;">Your email has been verified and your account is now active. You can start booking your favorite spa services!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Explore Spas</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Thank you for choosing BookYourSpa!</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} BookYourSpa. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
      emailId: info.messageId,
    };
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    return {
      success: false,
      message: "Failed to send welcome email",
      error: error.message,
    };
  }
}

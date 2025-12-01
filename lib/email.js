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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dipakparmar1041@gmail.com";
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
              <p style="margin-top: 8px;">
                Created by{" "}
                <a href="https://www.thitainfo.com/" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: none;">
                  ThitaInfo
                </a>{" "}
                with ❤️
              </p>
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
              <p style="margin-top: 8px;">
                Created by{" "}
                <a href="https://www.thitainfo.com/" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: none;">
                  ThitaInfo
                </a>{" "}
                with ❤️
              </p>
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
              <p style="margin-top: 8px;">
                Created by{" "}
                <a href="https://www.thitainfo.com/" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: none;">
                  ThitaInfo
                </a>{" "}
                with ❤️
              </p>
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

/**
 * Send booking confirmation email to customer
 * @param {string} email - Customer email
 * @param {string} customerName - Customer name
 * @param {string} spaTitle - Spa name
 * @param {string} service - Service name
 * @param {string} location - Spa location
 * @param {string} formattedDateTime - Formatted date and time
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function sendBookingConfirmationEmail(
  email,
  customerName,
  spaTitle,
  service,
  location,
  formattedDateTime
) {
  if (!EMAIL_ENABLED) {
    console.log(`[MOCKED] Booking confirmation email to ${email}:`, {
      customerName,
      spaTitle,
      service,
      location,
      formattedDateTime,
    });
    return {
      success: true,
      message: "Booking confirmation email sent (mocked)",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Booking Confirmed - ${spaTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-top: 0;">Hello ${customerName}!</h2>
              <p style="color: #4b5563;">Your booking has been confirmed. We're excited to serve you!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #111827; margin-top: 0;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Spa:</td>
                    <td style="padding: 8px 0; color: #111827;">${spaTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Service:</td>
                    <td style="padding: 8px 0; color: #111827;">${service}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #111827;">${formattedDateTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #111827;">${location}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #4b5563;">Please arrive on time for your appointment. If you need to make any changes, please contact the spa directly.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}/dashboard/bookings" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View My Bookings</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Thank you for choosing BookYourSpa!</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} BookYourSpa. All rights reserved.</p>
              <p style="margin-top: 8px;">
                Created by{" "}
                <a href="https://www.thitainfo.com/" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: none;">
                  ThitaInfo
                </a>{" "}
                with ❤️
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(
      "[Email] Booking confirmation email sent successfully:",
      info.messageId
    );
    return {
      success: true,
      message: "Booking confirmation email sent successfully",
      emailId: info.messageId,
    };
  } catch (error) {
    console.error("[Email] Error sending booking confirmation email:", error);
    return {
      success: false,
      message: "Failed to send booking confirmation email",
      error: error.message,
    };
  }
}

/**
 * Send booking notification email to spa owner
 * @param {string} email - Spa owner email
 * @param {string} ownerName - Spa owner name
 * @param {string} spaTitle - Spa name
 * @param {string} customerName - Customer name
 * @param {string} customerPhone - Customer phone
 * @param {string} service - Service name
 * @param {string} formattedDateTime - Formatted date and time
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function sendBookingNotificationToOwner(
  email,
  ownerName,
  spaTitle,
  customerName,
  customerPhone,
  service,
  formattedDateTime
) {
  if (!EMAIL_ENABLED) {
    console.log(`[MOCKED] Booking notification email to owner ${email}:`, {
      ownerName,
      spaTitle,
      customerName,
      customerPhone,
      service,
      formattedDateTime,
    });
    return {
      success: true,
      message: "Booking notification email sent (mocked)",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `New Booking - ${spaTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Booking Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Booking Received!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-top: 0;">Hello ${ownerName}!</h2>
              <p style="color: #4b5563;">You have received a new booking for your spa. Please review the details below:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #111827; margin-top: 0;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Spa:</td>
                    <td style="padding: 8px 0; color: #111827;">${spaTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Customer Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Customer Phone:</td>
                    <td style="padding: 8px 0; color: #111827;">${customerPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Service:</td>
                    <td style="padding: 8px 0; color: #111827;">${service}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #111827;">${formattedDateTime}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #4b5563;">Please ensure you're prepared for this appointment. You can manage all your bookings from your dashboard.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}/dashboard/bookings" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View All Bookings</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Thank you for using BookYourSpa!</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} BookYourSpa. All rights reserved.</p>
              <p style="margin-top: 8px;">
                Created by{" "}
                <a href="https://www.thitainfo.com/" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: none;">
                  ThitaInfo
                </a>{" "}
                with ❤️
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(
      "[Email] Booking notification email sent to owner successfully:",
      info.messageId
    );
    return {
      success: true,
      message: "Booking notification email sent successfully",
      emailId: info.messageId,
    };
  } catch (error) {
    console.error("[Email] Error sending booking notification email:", error);
    return {
      success: false,
      message: "Failed to send booking notification email",
      error: error.message,
    };
  }
}

/**
 * Send contact form submission notification to admin
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone
 * @param {string} subject - Contact subject
 * @param {string} message - Contact message
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function sendContactFormNotificationToAdmin(
  name,
  email,
  phone,
  subject,
  message
) {
  if (!EMAIL_ENABLED) {
    console.log(
      `[MOCKED] Contact form notification email to admin ${ADMIN_EMAIL}:`,
      {
        name,
        email,
        phone,
        subject,
        message,
      }
    );
    return {
      success: true,
      message: "Contact form notification email sent (mocked)",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <p style="color: #4b5563;">You have received a new contact form submission on BookYourSpa. Please review the details below:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #111827; margin-top: 0;">Contact Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0; color: #111827;">
                      <a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  ${
                    phone
                      ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #111827;">
                      <a href="tel:${phone}" style="color: #10b981; text-decoration: none;">${phone}</a>
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject:</td>
                    <td style="padding: 8px 0; color: #111827;">${subject}</td>
                  </tr>
                </table>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6;">
                <h3 style="color: #111827; margin-top: 0;">Message</h3>
                <p style="color: #4b5563; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reply to ${name}</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This is an automated notification from BookYourSpa contact form.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} BookYourSpa. All rights reserved.</p>
              <p style="margin-top: 8px;">
                Created by{" "}
                <a href="https://www.thitainfo.com/" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: none;">
                  ThitaInfo
                </a>{" "}
                with ❤️
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(
      "[Email] Contact form notification email sent to admin successfully:",
      info.messageId
    );
    return {
      success: true,
      message: "Contact form notification email sent successfully",
      emailId: info.messageId,
    };
  } catch (error) {
    console.error(
      "[Email] Error sending contact form notification email:",
      error
    );
    return {
      success: false,
      message: "Failed to send contact form notification email",
      error: error.message,
    };
  }
}

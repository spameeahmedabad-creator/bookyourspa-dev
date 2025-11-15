// Twilio Integration for Next.js 15
// Supports both SMS and WhatsApp messaging
// Add your Twilio credentials in .env.local to enable real SMS/WhatsApp

import twilio from "twilio";

// Check if Twilio is properly configured
const TWILIO_ENABLED =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID !== "your_twilio_account_sid" &&
  process.env.TWILIO_ACCOUNT_SID.trim() !== "";

// Initialize Twilio client only if credentials are provided
let twilioClient = null;

if (TWILIO_ENABLED) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log("[Twilio] Client initialized successfully");
  } catch (error) {
    console.error("[Twilio] Failed to initialize client:", error.message);
    twilioClient = null;
  }
} else {
  console.log(
    "[Twilio] Running in mock mode. Add credentials to .env.local to enable real messaging."
  );
}

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number in E.164 format (e.g., +1234567890)
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{success: boolean, message: string, sid?: string}>}
 */
export async function sendOTP(phone, otp) {
  // Normalize phone number (ensure it starts with +)
  const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

  if (!TWILIO_ENABLED || !twilioClient) {
    console.log(`[MOCKED] Sending OTP ${otp} to ${normalizedPhone}`);
    return { success: true, message: "OTP sent (mocked)", sid: "mock-sid" };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.error("[Twilio] TWILIO_PHONE_NUMBER not configured");
    return { success: false, message: "Twilio phone number not configured" };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your BookYourSpa OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    console.log(`[Twilio] OTP sent successfully. SID: ${message.sid}`);
    return {
      success: true,
      message: "OTP sent successfully",
      sid: message.sid,
    };
  } catch (error) {
    console.error("[Twilio] SMS Error:", error);
    return {
      success: false,
      message: error.message || "Failed to send OTP",
      error: error.code || "UNKNOWN_ERROR",
    };
  }
}

/**
 * Send WhatsApp booking confirmation to customer
 * @param {string} phone - Phone number in E.164 format
 * @param {string} customerName - Customer's name
 * @param {string} spaName - Spa name
 * @param {string} service - Service name
 * @param {string} location - Location address
 * @param {string} dateTime - Formatted date and time
 * @returns {Promise<{success: boolean, message: string, sid?: string}>}
 */
export async function sendWhatsAppBookingConfirmation(
  phone,
  customerName,
  spaName,
  service,
  location,
  dateTime
) {
  const message = `Hi ${customerName}\n\nYour spa booking has been confirmed by ${spaName}\n\nService: ${service}\nLocation: ${location}\nDate and Time: ${dateTime}`;

  // Normalize phone number
  const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

  if (!TWILIO_ENABLED || !twilioClient) {
    console.log(`[MOCKED] Sending WhatsApp to ${normalizedPhone}:`, message);
    return {
      success: true,
      message: "WhatsApp sent (mocked)",
      sid: "mock-sid",
    };
  }

  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    console.error("[Twilio] TWILIO_WHATSAPP_NUMBER not configured");
    return { success: false, message: "Twilio WhatsApp number not configured" };
  }

  try {
    const whatsappMessage = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${normalizedPhone}`,
    });

    console.log(
      `[Twilio] WhatsApp sent successfully. SID: ${whatsappMessage.sid}`
    );
    return {
      success: true,
      message: "WhatsApp sent successfully",
      sid: whatsappMessage.sid,
    };
  } catch (error) {
    console.error("[Twilio] WhatsApp Error:", error);
    return {
      success: false,
      message: error.message || "Failed to send WhatsApp",
      error: error.code || "UNKNOWN_ERROR",
    };
  }
}

/**
 * Send WhatsApp notification to spa owner about new booking
 * @param {string} phone - Spa owner's phone number in E.164 format
 * @param {string} spaOwnerName - Spa owner's name
 * @param {string} spaName - Spa name
 * @param {string} customerName - Customer's name
 * @param {string} customerPhone - Customer's phone number
 * @param {string} service - Service name
 * @param {string} dateTime - Formatted date and time
 * @returns {Promise<{success: boolean, message: string, sid?: string}>}
 */
export async function sendWhatsAppSpaOwnerNotification(
  phone,
  spaOwnerName,
  spaName,
  customerName,
  customerPhone,
  service,
  dateTime
) {
  const message = `Hello ${spaOwnerName}\n\nA new spa booking has been confirmed.\n\nSpa name: ${spaName}\nCustomer name: ${customerName}\nCustomer's phone no: ${customerPhone}\nService: ${service}\nDate and Time: ${dateTime}`;

  // Normalize phone number
  const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

  if (!TWILIO_ENABLED || !twilioClient) {
    console.log(
      `[MOCKED] Sending WhatsApp to spa owner ${normalizedPhone}:`,
      message
    );
    return {
      success: true,
      message: "WhatsApp sent (mocked)",
      sid: "mock-sid",
    };
  }

  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    console.error("[Twilio] TWILIO_WHATSAPP_NUMBER not configured");
    return { success: false, message: "Twilio WhatsApp number not configured" };
  }

  try {
    const whatsappMessage = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${normalizedPhone}`,
    });

    console.log(
      `[Twilio] WhatsApp sent successfully. SID: ${whatsappMessage.sid}`
    );
    return {
      success: true,
      message: "WhatsApp sent successfully",
      sid: whatsappMessage.sid,
    };
  } catch (error) {
    console.error("[Twilio] WhatsApp Error:", error);
    return {
      success: false,
      message: error.message || "Failed to send WhatsApp",
      error: error.code || "UNKNOWN_ERROR",
    };
  }
}

/**
 * Send SMS message (generic function)
 * @param {string} phone - Phone number in E.164 format
 * @param {string} message - Message body
 * @returns {Promise<{success: boolean, message: string, sid?: string}>}
 */
export async function sendSMS(phone, message) {
  const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

  if (!TWILIO_ENABLED || !twilioClient) {
    console.log(`[MOCKED] Sending SMS to ${normalizedPhone}:`, message);
    return { success: true, message: "SMS sent (mocked)", sid: "mock-sid" };
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.error("[Twilio] TWILIO_PHONE_NUMBER not configured");
    return { success: false, message: "Twilio phone number not configured" };
  }

  try {
    const smsMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    console.log(`[Twilio] SMS sent successfully. SID: ${smsMessage.sid}`);
    return {
      success: true,
      message: "SMS sent successfully",
      sid: smsMessage.sid,
    };
  } catch (error) {
    console.error("[Twilio] SMS Error:", error);
    return {
      success: false,
      message: error.message || "Failed to send SMS",
      error: error.code || "UNKNOWN_ERROR",
    };
  }
}

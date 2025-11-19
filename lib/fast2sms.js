// Fast2SMS Integration for Next.js 15
// Supports SMS messaging for Indian phone numbers
// Add your Fast2SMS API key in .env.local to enable real SMS

// Check if Fast2SMS is properly configured
const FAST2SMS_ENABLED =
  process.env.FAST2SMS_API_KEY &&
  process.env.FAST2SMS_API_KEY !== "your_fast2sms_api_key" &&
  process.env.FAST2SMS_API_KEY.trim() !== "";

/**
 * Convert phone number from E.164 format to Indian format (10 digits)
 * @param {string} phone - Phone number in E.164 format (e.g., +919876543210)
 * @returns {string} - 10-digit Indian phone number (e.g., 9876543210)
 */
function convertToIndianFormat(phone) {
  if (!phone) return null;

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If starts with 91 (India country code), remove it
  if (digits.startsWith("91") && digits.length === 12) {
    return digits.substring(2);
  }

  // If already 10 digits, return as is
  if (digits.length === 10) {
    return digits;
  }

  // If starts with +91, remove +91
  if (phone.startsWith("+91")) {
    return phone.replace("+91", "").replace(/\D/g, "");
  }

  // Return last 10 digits if longer
  if (digits.length > 10) {
    return digits.substring(digits.length - 10);
  }

  return digits;
}

/**
 * Send SMS via Fast2SMS API
 * @param {string} phone - Phone number (will be converted to Indian format)
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
 */
async function sendSMSViaFast2SMS(phone, message) {
  const indianPhone = convertToIndianFormat(phone);

  if (!indianPhone || indianPhone.length !== 10) {
    return {
      success: false,
      message: "Invalid Indian phone number. Must be 10 digits.",
    };
  }

  if (!FAST2SMS_ENABLED) {
    console.log(`[MOCKED] Sending SMS to ${indianPhone}:`, message);
    return {
      success: true,
      message: "SMS sent (mocked)",
      requestId: "mock-request-id",
    };
  }

  try {
    const url = "https://www.fast2sms.com/dev/bulkV2";
    const params = new URLSearchParams({
      authorization: process.env.FAST2SMS_API_KEY,
      message: message,
      language: "english",
      route: "q", // Quick route for transactional messages
      numbers: indianPhone,
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        "cache-control": "no-cache",
      },
    });

    const data = await response.json();

    if (data.return === true) {
      console.log(
        `[Fast2SMS] SMS sent successfully. Request ID: ${data.request_id}`
      );
      return {
        success: true,
        message: "SMS sent successfully",
        requestId: data.request_id,
      };
    } else {
      console.error("[Fast2SMS] API Error:", data.message || "Unknown error");
      return {
        success: false,
        message: data.message || "Failed to send SMS",
        error: data.message,
      };
    }
  } catch (error) {
    console.error("[Fast2SMS] Network Error:", error);
    return {
      success: false,
      message: error.message || "Failed to send SMS",
      error: "NETWORK_ERROR",
    };
  }
}

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number in E.164 format (e.g., +919876543210)
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
 */
export async function sendOTP(phone, otp) {
  const message = `Your BookYourSpa OTP is: ${otp}. Valid for 10 minutes.`;
  return await sendSMSViaFast2SMS(phone, message);
}

/**
 * Send SMS booking confirmation to customer
 * Note: Fast2SMS doesn't support WhatsApp, so this sends SMS instead
 * @param {string} phone - Phone number in E.164 format
 * @param {string} customerName - Customer's name
 * @param {string} spaName - Spa name
 * @param {string} service - Service name
 * @param {string} location - Location address
 * @param {string} dateTime - Formatted date and time
 * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
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
  return await sendSMSViaFast2SMS(phone, message);
}

/**
 * Send SMS notification to spa owner about new booking
 * Note: Fast2SMS doesn't support WhatsApp, so this sends SMS instead
 * @param {string} phone - Spa owner's phone number in E.164 format
 * @param {string} spaOwnerName - Spa owner's name
 * @param {string} spaName - Spa name
 * @param {string} customerName - Customer's name
 * @param {string} customerPhone - Customer's phone number
 * @param {string} service - Service name
 * @param {string} dateTime - Formatted date and time
 * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
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
  return await sendSMSViaFast2SMS(phone, message);
}

/**
 * Send SMS message (generic function)
 * @param {string} phone - Phone number in E.164 format
 * @param {string} message - Message body
 * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
 */
export async function sendSMS(phone, message) {
  return await sendSMSViaFast2SMS(phone, message);
}

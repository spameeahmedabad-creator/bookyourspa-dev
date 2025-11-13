// Twilio Integration - Mocked for now
// Add your Twilio credentials in .env.local to enable real SMS/WhatsApp

const TWILIO_ENABLED = process.env.TWILIO_ACCOUNT_SID && 
                       process.env.TWILIO_AUTH_TOKEN && 
                       process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid';

let twilioClient = null;

if (TWILIO_ENABLED) {
  const twilio = require('twilio');
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export async function sendOTP(phone, otp) {
  if (!TWILIO_ENABLED) {
    console.log(`[MOCKED] Sending OTP ${otp} to ${phone}`);
    return { success: true, message: 'OTP sent (mocked)', sid: 'mock-sid' };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your BookYourSpa OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return { success: true, message: 'OTP sent', sid: message.sid };
  } catch (error) {
    console.error('Twilio SMS Error:', error);
    return { success: false, message: error.message };
  }
}

export async function sendWhatsAppBookingConfirmation(phone, customerName, spaName, service, location, dateTime) {
  const message = `Hi ${customerName}\n\nYour spa booking has been confirmed by ${spaName}\n\nService: ${service}\nLocation: ${location}\nDate and Time: ${dateTime}`;

  if (!TWILIO_ENABLED) {
    console.log(`[MOCKED] Sending WhatsApp to ${phone}:`, message);
    return { success: true, message: 'WhatsApp sent (mocked)' };
  }

  try {
    const whatsappMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`
    });
    return { success: true, message: 'WhatsApp sent', sid: whatsappMessage.sid };
  } catch (error) {
    console.error('Twilio WhatsApp Error:', error);
    return { success: false, message: error.message };
  }
}

export async function sendWhatsAppSpaOwnerNotification(phone, spaOwnerName, spaName, customerName, customerPhone, service, dateTime) {
  const message = `Hello ${spaOwnerName}\n\nA new spa booking has been confirmed.\n\nSpa name: ${spaName}\nCustomer name: ${customerName}\nCustomer's phone no: ${customerPhone}\nService: ${service}\nDate and Time: ${dateTime}`;

  if (!TWILIO_ENABLED) {
    console.log(`[MOCKED] Sending WhatsApp to spa owner ${phone}:`, message);
    return { success: true, message: 'WhatsApp sent (mocked)' };
  }

  try {
    const whatsappMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`
    });
    return { success: true, message: 'WhatsApp sent', sid: whatsappMessage.sid };
  } catch (error) {
    console.error('Twilio WhatsApp Error:', error);
    return { success: false, message: error.message };
  }
}

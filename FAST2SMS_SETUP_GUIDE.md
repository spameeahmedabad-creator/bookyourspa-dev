# Fast2SMS Setup Guide for Next.js 15

This guide will help you configure Fast2SMS for SMS messaging in your Next.js 15 application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Fast2SMS Account Setup](#fast2sms-account-setup)
3. [Environment Variables](#environment-variables)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Fast2SMS account ([Sign up here](https://www.fast2sms.com/))
- Node.js and npm/yarn installed
- Next.js 15 application set up

---

## Fast2SMS Account Setup

### Step 1: Create a Fast2SMS Account

1. Go to [Fast2SMS Sign Up](https://www.fast2sms.com/)
2. Create a new account or log in if you already have one
3. Complete the registration process

### Step 2: Get Your API Key

1. Log in to your [Fast2SMS Dashboard](https://www.fast2sms.com/dev/)
2. Navigate to **Dev API** section
3. Copy your **API Authorization Key**
4. Keep this key secure - you'll need it for the `.env.local` file

### Step 3: Verify Your Account

- Fast2SMS may require account verification
- Check your email for verification instructions
- Some plans may require KYC verification for production use

---

## Environment Variables

Add the following environment variable to your `.env.local` file:

```env
# Fast2SMS API Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key_here
```

### Example `.env.local`:

```env
# Fast2SMS API Key
FAST2SMS_API_KEY=ABC123XYZ789DEF456GHI012JKL345MNO678PQR901STU234VWX567

# Other environment variables...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

---

## How It Works

### Phone Number Format

Fast2SMS works with **Indian phone numbers** (10 digits). The system automatically:

- Converts E.164 format (`+919876543210`) to Indian format (`9876543210`)
- Validates that the phone number is 10 digits
- Handles various input formats

### Supported Features

✅ **SMS OTP**: Sends 6-digit OTP codes for login  
✅ **Booking Confirmations**: Sends SMS to customers  
✅ **Spa Owner Notifications**: Sends SMS to spa owners about new bookings  
✅ **Generic SMS**: Send any SMS message

### Note on WhatsApp

Fast2SMS **does not support WhatsApp**. The functions named `sendWhatsAppBookingConfirmation` and `sendWhatsAppSpaOwnerNotification` actually send **SMS messages** instead. This maintains API compatibility while using SMS.

---

## Testing

### 1. Test OTP Sending

1. Start your development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Go to the login page and enter a valid Indian phone number
3. Click "Send OTP"
4. Check the console logs for Fast2SMS responses
5. You should receive an SMS with the OTP code

### 2. Test Booking Notifications

1. Create a booking through the booking modal
2. Check console logs for SMS sending status
3. Customer and spa owner should receive SMS notifications

### 3. Mock Mode

If `FAST2SMS_API_KEY` is not set or is set to `your_fast2sms_api_key`, the system runs in **mock mode**:

- All SMS operations are logged to console
- No actual SMS messages are sent
- Useful for development and testing

---

## Troubleshooting

### Issue: "Invalid Indian phone number. Must be 10 digits."

**Solution**:

- Ensure the phone number is a valid Indian mobile number (10 digits)
- The number should start with 6, 7, 8, or 9
- Country code (+91) is automatically removed if present

### Issue: "Failed to send SMS" or API errors

**Possible Causes**:

1. Invalid API key
2. Insufficient balance in Fast2SMS account
3. Account not verified
4. Rate limiting

**Solutions**:

1. Verify `FAST2SMS_API_KEY` is correct in `.env.local`
2. Check your Fast2SMS dashboard for account balance
3. Verify your account status
4. Check Fast2SMS dashboard for any restrictions

### Issue: SMS not received

**Possible Causes**:

1. Phone number format incorrect
2. DND (Do Not Disturb) registered number
3. Network issues
4. Fast2SMS service issues

**Solutions**:

1. Verify phone number format (should be 10 digits)
2. Check if the number is registered on DND
3. Check Fast2SMS dashboard for delivery status
4. Contact Fast2SMS support if issues persist

### Issue: "FAST2SMS_API_KEY not configured"

**Solution**: Make sure `FAST2SMS_API_KEY` is set in `.env.local` and restart your development server.

---

## API Response Format

The Fast2SMS API returns responses in this format:

**Success Response:**

```json
{
  "return": true,
  "request_id": "abc123xyz",
  "message": ["SMS sent successfully"]
}
```

**Error Response:**

```json
{
  "return": false,
  "message": "Error message here"
}
```

---

## Rate Limits and Pricing

- Check [Fast2SMS Pricing](https://www.fast2sms.com/pricing) for current rates
- Free tier may have limitations
- Production use may require a paid plan
- Monitor your usage in the Fast2SMS dashboard

---

## Migration from Twilio

If you were previously using Twilio:

1. ✅ **Code Updated**: All Twilio imports now use Fast2SMS
2. ✅ **Backward Compatible**: Old `@/lib/twilio` imports still work (re-exported)
3. ⚠️ **Environment Variables**: Replace Twilio env vars with `FAST2SMS_API_KEY`
4. ⚠️ **WhatsApp**: WhatsApp functions now send SMS instead
5. ⚠️ **Phone Format**: Now optimized for Indian phone numbers

### Remove Twilio Package (Optional)

If you want to remove the Twilio package:

```bash
npm uninstall twilio
# or
yarn remove twilio
```

---

## Additional Resources

- [Fast2SMS Documentation](https://www.fast2sms.com/docs)
- [Fast2SMS Dashboard](https://www.fast2sms.com/dev/)
- [Fast2SMS Support](https://www.fast2sms.com/support)

---

## Checklist

- [ ] Created Fast2SMS account
- [ ] Obtained API key
- [ ] Added `FAST2SMS_API_KEY` to `.env.local`
- [ ] Tested OTP sending
- [ ] Tested booking notifications
- [ ] Verified SMS delivery
- [ ] (Optional) Removed Twilio package

---

## Support

If you encounter issues:

1. Check Fast2SMS dashboard for account status
2. Review console logs for error messages
3. Verify all environment variables are set correctly
4. Check Fast2SMS documentation
5. Contact Fast2SMS support if needed

---

**Fast2SMS Integration**: ✅ Complete  
**Last Updated**: 2024

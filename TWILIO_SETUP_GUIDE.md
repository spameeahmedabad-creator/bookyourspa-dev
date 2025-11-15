# Twilio Setup Guide for Next.js 15

This guide will help you configure Twilio for SMS and WhatsApp messaging in your Next.js 15 application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Twilio Account Setup](#twilio-account-setup)
3. [SMS Configuration](#sms-configuration)
4. [WhatsApp Configuration](#whatsapp-configuration)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Twilio account ([Sign up here](https://www.twilio.com/try-twilio))
- Node.js 18+ and Next.js 15
- Twilio SDK already installed (`npm install twilio` or `yarn add twilio`)

---

## Twilio Account Setup

### Step 1: Create a Twilio Account

1. Go to [Twilio Sign Up](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your email and phone number

### Step 2: Get Your Credentials

1. Log in to your [Twilio Console](https://console.twilio.com/)
2. Navigate to **Account** → **API Keys & Tokens**
3. You'll find:
   - **Account SID**: Your unique account identifier
   - **Auth Token**: Your authentication token (keep this secret!)

---

## SMS Configuration

### Step 1: Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a number:
   - **Trial accounts**: You'll get a free number (limited to verified numbers)
   - **Paid accounts**: Buy a number in your preferred country
3. Note the phone number (e.g., `+1234567890`)

### Step 2: Configure SMS

Your SMS is already configured! The `sendOTP()` function uses:

- `TWILIO_PHONE_NUMBER` - Your Twilio phone number

**Note**: Trial accounts can only send SMS to verified phone numbers. Add verified numbers in **Phone Numbers** → **Verified Caller IDs**.

---

## WhatsApp Configuration

### Step 1: Enable WhatsApp Sandbox

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a sandbox number like: `whatsapp:+14155238886`
3. To join the sandbox, send a WhatsApp message to this number with the join code (e.g., `join <code>`)
4. Once joined, you can receive WhatsApp messages from the sandbox

### Step 2: Get Your WhatsApp Number

For **Sandbox (Testing)**:

- Use: `+14155238886` (Twilio's sandbox number)
- Format: `whatsapp:+14155238886`

For **Production**:

1. Go to **Messaging** → **Senders** → **WhatsApp Senders**
2. Request approval for your WhatsApp Business Account
3. Once approved, you'll get a WhatsApp-enabled number

### Step 3: Configure WhatsApp

Set the environment variable:

```env
TWILIO_WHATSAPP_NUMBER=+14155238886
```

**Important**:

- Sandbox numbers can only message users who have joined the sandbox
- For production, you need WhatsApp Business API approval

---

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# ============================================
# MongoDB Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017/bookyourspa

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your-secret-key-change-this-in-production

# ============================================
# Twilio Account Credentials
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# ============================================
# SMS Configuration
# ============================================
# Your Twilio phone number for SMS (E.164 format)
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# WhatsApp Configuration
# ============================================
# Sandbox (Testing) - Use this for development
TWILIO_WHATSAPP_NUMBER=+14155238886

# Production WhatsApp (after approval) - Uncomment and use this
# TWILIO_WHATSAPP_NUMBER=+1234567890

# ============================================
# Next.js Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Environment Variable Details

| Variable                 | Description                                  | Example                              |
| ------------------------ | -------------------------------------------- | ------------------------------------ |
| `TWILIO_ACCOUNT_SID`     | Your Twilio Account SID                      | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN`      | Your Twilio Auth Token                       | `your_auth_token_here`               |
| `TWILIO_PHONE_NUMBER`    | Your Twilio phone number for SMS             | `+1234567890`                        |
| `TWILIO_WHATSAPP_NUMBER` | Your WhatsApp number (sandbox or production) | `+14155238886`                       |

---

## Testing

### Test SMS (OTP)

1. Make sure your phone number is verified in Twilio Console
2. Start your Next.js app: `npm run dev`
3. Try logging in - the OTP will be sent via SMS
4. Check your phone for the OTP message

### Test WhatsApp

1. Join the WhatsApp sandbox:
   - Send `join <code>` to `whatsapp:+14155238886`
   - You'll receive a confirmation message
2. Create a booking in your app
3. Check WhatsApp for the booking confirmation

### Check Logs

The application logs all Twilio operations:

- `[Twilio] Client initialized successfully` - Twilio is configured
- `[MOCKED]` - Running without credentials (mock mode)
- `[Twilio] OTP sent successfully` - SMS sent
- `[Twilio] WhatsApp sent successfully` - WhatsApp sent

---

## Phone Number Format

**Important**: All phone numbers must be in **E.164 format**:

- Format: `+[country code][number]`
- Examples:
  - US: `+1234567890`
  - India: `+919876543210`
  - UK: `+441234567890`

The code automatically normalizes phone numbers, but it's best to store them in E.164 format.

---

## Features Available

### 1. SMS OTP (`sendOTP`)

- Sends 6-digit OTP codes via SMS
- Used for user authentication
- Auto-normalizes phone numbers

### 2. WhatsApp Booking Confirmation (`sendWhatsAppBookingConfirmation`)

- Sends booking confirmations to customers
- Includes service, location, and date/time details

### 3. WhatsApp Spa Owner Notification (`sendWhatsAppSpaOwnerNotification`)

- Notifies spa owners of new bookings
- Includes customer and booking details

### 4. Generic SMS (`sendSMS`)

- Generic function for sending any SMS message
- Can be used for custom notifications

---

## Troubleshooting

### Issue: "Twilio phone number not configured"

**Solution**: Make sure `TWILIO_PHONE_NUMBER` is set in `.env.local`

### Issue: "Twilio WhatsApp number not configured"

**Solution**: Make sure `TWILIO_WHATSAPP_NUMBER` is set in `.env.local`

### Issue: SMS not sending (Trial Account)

**Solution**:

- Verify the recipient phone number in Twilio Console
- Trial accounts can only send to verified numbers
- Upgrade to a paid account for production use

### Issue: WhatsApp messages not received

**Solution**:

- Make sure you've joined the WhatsApp sandbox
- Check that you're using the correct sandbox number
- For production, ensure WhatsApp Business API is approved

### Issue: "Invalid phone number format"

**Solution**:

- Use E.164 format: `+[country code][number]`
- Example: `+1234567890` (not `1234567890` or `(123) 456-7890`)

### Issue: "Authentication failed"

**Solution**:

- Double-check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Make sure there are no extra spaces in `.env.local`
- Restart your Next.js dev server after changing `.env.local`

### Issue: Still seeing "[MOCKED]" messages

**Solution**:

1. Check that `.env.local` exists in project root
2. Verify all Twilio variables are set
3. Restart the dev server: `npm run dev`
4. Check console for initialization message

---

## Production Considerations

### 1. Upgrade Your Twilio Account

- Trial accounts have limitations
- Upgrade to a paid account for production
- Set up billing and payment method

### 2. WhatsApp Business API

- Request WhatsApp Business API approval
- Complete business verification
- Get a dedicated WhatsApp number

### 3. Error Handling

The code includes error handling, but consider:

- Logging errors to a monitoring service
- Retry logic for failed messages
- Fallback mechanisms

### 4. Rate Limits

- Be aware of Twilio rate limits
- Implement queuing for high-volume messaging
- Monitor usage in Twilio Console

### 5. Security

- Never commit `.env.local` to git
- Use environment variables in production (Vercel, Netlify, etc.)
- Rotate auth tokens regularly

---

## Cost Estimation

### SMS Pricing (Approximate)

- US/Canada: ~$0.0075 per SMS
- India: ~$0.005 per SMS
- Other countries vary

### WhatsApp Pricing (Approximate)

- Session messages: ~$0.005 per message
- Template messages: ~$0.01-0.02 per message

**Note**: Check [Twilio Pricing](https://www.twilio.com/pricing) for current rates.

---

## Additional Resources

- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [WhatsApp Business API Guide](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://console.twilio.com/)

---

## Quick Start Checklist

- [ ] Created Twilio account
- [ ] Got Account SID and Auth Token
- [ ] Purchased/obtained phone number for SMS
- [ ] Set up WhatsApp sandbox (or production)
- [ ] Created `.env.local` with all variables
- [ ] Verified phone numbers (for trial account)
- [ ] Tested SMS OTP sending
- [ ] Tested WhatsApp messaging
- [ ] Checked logs for successful initialization

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Twilio Console logs
3. Check Next.js server logs
4. Consult [Twilio Support](https://support.twilio.com/)

---

**Last Updated**: 2024
**Next.js Version**: 15.x
**Twilio SDK Version**: 5.x

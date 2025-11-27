# Authentication Migration Guide

## Overview

This application has been migrated from SMS-based OTP authentication to email + password authentication with optional Google social login. This eliminates SMS costs and provides better scalability.

## What Changed

### Authentication Methods

**Before:**

- Phone number + OTP via SMS (Fast2SMS)
- Automatic registration on first login

**After:**

- Email + Password (primary)
- Google OAuth (optional)
- Email verification required
- Password reset functionality

### User Model Changes

The User model now includes:

- `email` (required for new users, optional for existing)
- `password` (hashed with bcrypt)
- `googleId` (for Google OAuth users)
- `emailVerified` (boolean flag)
- `phone` (now optional, kept for backward compatibility)

### API Endpoints

**New Endpoints:**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email + password login
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

**Deprecated Endpoints (still work for backward compatibility):**

- `POST /api/auth/send-otp` - Still functional but not recommended
- `POST /api/auth/verify-otp` - Still functional but not recommended

**Updated Endpoints:**

- `GET /api/auth/me` - Now returns email and emailVerified status

## Environment Variables

Add these to your `.env.local` file:

```env
# Email Service (Nodemailer - SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=BookYourSpa <noreply@bookyourspa.com>

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base URL (for email links)
NEXTAUTH_URL=http://localhost:3000
# Or in production:
# NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# JWT Secret (should already exist)
JWT_SECRET=your_jwt_secret
```

## Setup Instructions

### 1. Email Service (Nodemailer with SMTP)

Nodemailer works with any SMTP provider. Here are common options:

#### Option A: Gmail (Quick Setup)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Create a new app password for "Mail"
   - Copy the 16-character password
4. Add to `.env.local`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   FROM_EMAIL=BookYourSpa <your-email@gmail.com>
   ```

#### Option B: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
FROM_EMAIL=BookYourSpa <your-email@outlook.com>
```

#### Option C: Custom SMTP (SendGrid, Mailgun, etc.)

For SendGrid:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=BookYourSpa <noreply@yourdomain.com>
```

For Mailgun:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
FROM_EMAIL=BookYourSpa <noreply@yourdomain.com>
```

#### Option D: AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-ses-smtp-username
SMTP_PASSWORD=your-aws-ses-smtp-password
FROM_EMAIL=BookYourSpa <noreply@yourdomain.com>
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback` (dev) and `https://yourdomain.com/api/auth/google/callback` (prod)
5. Copy Client ID and Client Secret to `.env.local`

### 3. Database Migration

Existing users with phone numbers will continue to work, but you should migrate them to email:

```bash
# List all users without email
node scripts/migrate-users-to-email.js list

# Add email to a specific user
node scripts/migrate-users-to-email.js add <userId> <email>
```

## User Flows

### Registration Flow

1. User visits `/register`
2. Fills in: name, email, password, confirm password, phone (optional)
3. System creates account with `emailVerified: false`
4. Verification email sent
5. User clicks link in email
6. Email verified, user auto-logged in

### Login Flow

1. User visits `/login`
2. Enters email + password
3. System validates credentials
4. JWT token generated and set as cookie
5. User redirected to home/dashboard

### Google Login Flow

1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. User grants permissions
4. Google redirects back with code
5. System exchanges code for user info
6. User created/logged in automatically
7. JWT token set as cookie

### Password Reset Flow

1. User clicks "Forgot password" on login page
2. Enters email address
3. Reset email sent (if account exists)
4. User clicks link in email
5. User enters new password
6. Password updated, user can login

## Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **Rate Limiting**:
  - Login: 5 attempts per 15 minutes per IP
  - Register: 3 attempts per hour per IP
  - Forgot Password: 3 attempts per hour per IP
- **Email Verification**: Required for new accounts
- **JWT Tokens**: HTTP-only cookies, 7-day expiration
- **Password Requirements**: Minimum 8 characters, must contain letter and number

## Testing

### Test Registration

1. Visit `/register`
2. Fill in form with valid email
3. Check email inbox for verification link
4. Click link to verify
5. Should be auto-logged in

### Test Login

1. Visit `/login`
2. Enter registered email + password
3. Should redirect to home page

### Test Google Login

1. Visit `/login`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Should be logged in automatically

### Test Password Reset

1. Visit `/forgot-password`
2. Enter registered email
3. Check email for reset link
4. Click link and set new password
5. Login with new password

## Troubleshooting

### Emails Not Sending

- Check all SMTP environment variables are set correctly
- Verify SMTP credentials (username/password)
- Test SMTP connection with a simple email client
- Check SMTP server logs for errors
- For Gmail: Ensure you're using an App Password, not your regular password
- For custom SMTP: Verify the host, port, and security settings
- In development without SMTP config, emails are mocked (check console logs)

### Google OAuth Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check redirect URI matches exactly in Google Console
- Ensure Google+ API is enabled
- Check browser console for errors

### Existing Users Can't Login

- Existing phone-based users need to register with email
- Or use migration script to add email to existing accounts
- Old OTP endpoints still work for backward compatibility

## Migration Checklist

- [ ] Set up SMTP email service (Gmail, SendGrid, Mailgun, etc.)
- [ ] Add SMTP credentials to `.env.local`
- [ ] Set up Google OAuth credentials
- [ ] Add all environment variables
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test Google OAuth
- [ ] Test password reset
- [ ] Migrate existing users (optional)
- [ ] Update any documentation referencing phone-based auth
- [ ] Monitor email delivery rates
- [ ] Set up email templates customization (optional)

## Notes

- Fast2SMS integration is still available for booking notifications (not removed)
- Phone field is optional but recommended for booking confirmations
- Email verification is required but login is still allowed (with warning)
- Rate limiting is in-memory (consider Redis for production scale)

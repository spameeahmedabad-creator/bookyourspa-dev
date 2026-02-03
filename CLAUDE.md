# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookYourSpa is a full-stack spa booking platform built with Next.js 15 (App Router). It connects customers with spa/wellness centers, supporting multi-role users (Customer, Spa Owner, Admin) with features for booking, listing management, and payment processing.

## Development Commands

```bash
yarn dev              # Start development server on port 3000
yarn build            # Production build
yarn start            # Run production server
yarn lint             # Run ESLint
yarn type-check       # TypeScript type checking (tsc --noEmit)
yarn clean            # Clear .next and cache
yarn clean:install    # Full clean reinstall
```

### Database Scripts

```bash
node scripts/migrate-users-to-email.js   # Run migrations
node scripts/seed.js                      # Seed sample data
```

## Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API routes, MongoDB/Mongoose
- **Auth**: NextAuth.js (Google OAuth), JWT (Jose), phone OTP (Fast2SMS)
- **Payments**: Razorpay with webhook verification
- **Images**: Cloudinary
- **Email**: Nodemailer with React Email templates

### Directory Structure

```
app/
├── api/                    # Backend API routes
│   ├── auth/               # Authentication (login, register, OAuth, OTP, password reset)
│   ├── bookings/           # Booking management
│   ├── payments/           # Razorpay (create-order, verify, webhook)
│   ├── spas/               # Spa listings CRUD and search
│   ├── coupons/            # Coupon system
│   └── admin/              # Admin endpoints (users, spa assignment)
├── dashboard/              # Authenticated user pages
│   ├── bookings/           # View/manage bookings
│   ├── add-listing/        # Spa owner: create spa
│   ├── spas/               # Spa owner: manage spas
│   └── admin/              # Admin panel
└── spa/                    # Public spa detail pages ([id])

components/                 # React components
├── ui/                     # Reusable UI (Radix UI-based)
├── BookingModal.jsx        # Main booking form
├── CloudinaryUpload.jsx    # Single image upload
├── CloudinaryMultiUpload.jsx # Gallery upload
└── SpaCard.jsx             # Spa listing card

models/                     # Mongoose schemas
├── User.js                 # Auth, roles, bookmarks
├── Spa.js                  # Listings, services, pricing
├── Booking.js              # Orders with payment status
├── Payment.js              # Razorpay records
└── Coupon.js               # Discount codes

lib/                        # Utilities
├── mongodb.js              # DB connection with caching
├── jwt.js                  # Token sign/verify (Jose)
├── email.js                # Email sending
├── razorpay.js             # Payment utilities
└── fast2sms.js             # SMS OTP service
```

### Key Patterns

**API Route Pattern:**

```javascript
import dbConnect from "@/lib/mongodb";
export async function POST(request) {
  await dbConnect();
  // ... handler logic
}
```

**Model Export Pattern:**

```javascript
export default mongoose.models.User || mongoose.model("User", userSchema);
```

**Auth Flow:**

- JWT tokens stored in `token` cookie
- `middleware.js` protects `/dashboard/*` routes
- `lib/jwt.js` handles token creation/verification with Jose library

**Payment Flow:**

1. `/api/payments/create-order` - Creates Razorpay order
2. Frontend processes payment
3. `/api/payments/verify` - Verifies signature
4. `/api/payments/webhook` - Handles async payment updates

### User Roles

- **customer**: Browse, book, manage own bookings
- **spa_owner**: All customer features + create/manage spa listings
- **admin**: Full system access, user management

## Environment Variables

Key variables needed (see `.env.example`):

- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - Token signing
- `NEXTAUTH_SECRET` - NextAuth
- `GOOGLE_CLIENT_ID/SECRET` - OAuth
- `CLOUDINARY_*` - Image uploads
- `RAZORPAY_KEY_ID/SECRET` - Payments
- `RAZORPAY_WEBHOOK_SECRET` - Webhook verification
- `FAST2SMS_API_KEY` - SMS OTP
- `SMTP_*` - Email configuration

## Important Notes

- GST is calculated at 18% on bookings
- Supports partial payment option (booking amount vs full amount)
- No test framework configured - only ESLint and TypeScript checking available
- Path alias `@/*` maps to project root

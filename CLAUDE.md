# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookYourSpa is a full-stack spa booking platform built with Next.js 15 (App Router). It connects customers with spa/wellness centers, supporting multi-role users (Customer, Spa Owner, Admin) with features for booking, listing management, and payment processing.

## Development Commands

```bash
yarn dev              # Start development server on port 3000
yarn build            # Production build
yarn start            # Run production server (port 3000)
yarn lint             # Run ESLint
yarn type-check       # TypeScript type checking (tsc --noEmit)
yarn clean            # Clear .next and node_modules/.cache
yarn clean:build      # Clear .next out dist
yarn clean:cache      # Clear .next/cache and node_modules/.cache
yarn clean:all        # Clear all build artifacts
yarn clean:install    # Full clean reinstall (removes node_modules + yarn.lock)
```

### Database Scripts

```bash
node scripts/migrate-users-to-email.js   # Run migrations
node scripts/seed.js                      # Seed sample data
```

## Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Lucide icons, Sonner (toasts)
- **Backend**: Next.js API routes, MongoDB/Mongoose
- **Auth**: Custom JWT (Jose) for primary auth + NextAuth.js v5 beta (Google OAuth only)
- **OTP**: phone OTP via Fast2SMS
- **Payments**: Razorpay with webhook verification
- **Images**: Cloudinary (`lib/cloudinary.js` server-side, `next-cloudinary` client)
- **Email**: Nodemailer with React Email templates

### Dual Auth System (Important)

The project runs **two auth systems in parallel**:

1. **Custom JWT** (`lib/jwt.js` + Jose library): Primary auth for login, register, OTP, password reset. Token stored in `token` cookie. Used throughout the app.
2. **NextAuth v5 beta** (`app/api/auth/[...nextauth]/route.js`): Handles Google OAuth only. After OAuth callback, a custom JWT token is issued and set in the `token` cookie to unify both flows.

API routes that need authentication manually verify the `token` cookie using `lib/jwt.js` — they are **not** protected by middleware (middleware skips `/api/*` entirely).

### Middleware

`middleware.js` protects `/dashboard/*` page routes only. It explicitly skips all `/api/*` routes. Role-based access within the dashboard (e.g., admin-only pages) is enforced in the page components themselves, not in middleware.

### Directory Structure

```
app/
├── api/
│   ├── auth/               # login, register, OTP, password reset, email verify, OAuth
│   ├── bookings/           # Booking CRUD
│   ├── payments/           # Razorpay (create-order, verify, webhook)
│   ├── spas/               # Spa listings CRUD and search
│   ├── coupons/            # Coupon CRUD and validate
│   ├── promotions/         # Promotions endpoint
│   ├── bookmarks/          # User bookmark management
│   ├── contact/            # Contact form
│   ├── upload/github/      # GitHub-based image upload alternative
│   └── admin/              # Admin: user management, spa assignment
├── dashboard/
│   ├── bookings/           # View/manage bookings
│   ├── add-listing/        # Spa owner: create spa
│   ├── spas/               # Spa owner: manage spas
│   ├── coupons/            # Coupon management
│   ├── bookmarks/          # Saved spas
│   ├── messages/           # Messaging (stub)
│   ├── profile/            # User profile
│   └── admin/              # Admin panel (users, spas)
└── spa/[id]/               # Public spa detail page

components/
├── ui/                     # Reusable UI (Radix UI-based)
├── BookingModal.jsx        # Main booking form
├── CloudinaryUpload.jsx    # Single image upload
├── CloudinaryMultiUpload.jsx
└── SpaCard.jsx

models/                     # Mongoose schemas
├── User.js                 # Auth, roles, bookmarks
├── Spa.js                  # Listings, services, pricing
├── Booking.js              # Orders with payment status
├── Payment.js              # Razorpay records
└── Coupon.js               # Discount codes

lib/
├── mongodb.js              # DB connection with caching
├── jwt.js                  # Token sign/verify (Jose)
├── cloudinary.js           # Server-side Cloudinary SDK
├── email.js                # Nodemailer email sending
├── razorpay.js             # Payment utilities
├── fast2sms.js             # SMS OTP
├── rate-limit.js           # In-memory rate limiter (resets on server restart)
├── form-validation.js      # Form field validators
└── phone-validation.js     # Phone number validation (libphonenumber-js)
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

**Auth in API Routes** (middleware does NOT protect API routes):

```javascript
import { verifyToken } from "@/lib/jwt";
const token = request.cookies.get("token")?.value;
const decoded = await verifyToken(token);
if (!decoded) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

**Payment Flow:**

1. `/api/payments/create-order` - Creates Razorpay order
2. Frontend processes payment via Razorpay SDK
3. `/api/payments/verify` - Verifies HMAC signature
4. `/api/payments/webhook` - Handles async payment status updates

### User Roles

- **customer**: Browse, book, manage own bookings, bookmarks
- **spa_owner**: All customer features + create/manage spa listings, coupons
- **admin**: Full system access, user management, spa assignment

## Environment Variables

Key variables needed (see `.env.example`):

- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - Token signing (Jose)
- `NEXTAUTH_SECRET` - NextAuth
- `GOOGLE_CLIENT_ID/SECRET` - OAuth
- `CLOUDINARY_*` - Image uploads
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Client-side Cloudinary
- `RAZORPAY_KEY_ID/SECRET` - Payments
- `RAZORPAY_WEBHOOK_SECRET` - Webhook verification
- `FAST2SMS_API_KEY` - SMS OTP
- `SMTP_*` - Email configuration

## Important Notes

- GST is calculated at 18% on bookings
- Supports partial payment (booking amount) vs full payment
- Rate limiter (`lib/rate-limit.js`) is in-memory — does not persist across server restarts and is not suitable for multi-instance deployments
- NextAuth is v5 beta (`next-auth@5.0.0-beta.30`) — its API differs from v4
- No test framework configured — only ESLint and TypeScript checking available
- Path alias `@/*` maps to the project root

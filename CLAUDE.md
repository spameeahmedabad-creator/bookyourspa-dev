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
- **Images**: GitHub repository storage (`app/api/upload/github/`) — Cloudinary is disabled
- **Email**: Nodemailer with React Email templates

### Dual Auth System (Important)

The project runs **two auth systems in parallel**:

1. **Custom JWT** (`lib/jwt.js` + Jose library): Primary auth for login, register, OTP, password reset. Token stored in `token` cookie, expires in 7 days. Used throughout the app.
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
│   ├── spas/               # Spa listings CRUD and search (text index + distance filter)
│   ├── coupons/            # Coupon CRUD and validate
│   ├── promotions/         # Active promotional banners
│   ├── bookmarks/          # User bookmark management
│   ├── contact/            # Contact form
│   ├── upload/github/      # Image upload to GitHub repo via GitHub API
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
├── spa/[id]/               # Public spa detail page
├── about/, privacy/, terms/  # Static pages
└── forgot-password/, reset-password/, verify-email/

components/
├── ui/                        # Reusable UI (Radix UI-based)
├── BookingModal.jsx           # Main booking form (supports guest + authenticated)
├── GitHubImageUpload.jsx      # Single image upload to GitHub
├── GitHubGalleryUpload.jsx    # Multi-image upload to GitHub
├── CloudinaryUpload.jsx       # Legacy (disabled)
├── CloudinaryMultiUpload.jsx  # Legacy (disabled)
└── SpaCard.jsx

models/                        # Mongoose schemas
├── User.js                    # Auth, roles, bookmarks; email/phone/googleId all sparse+unique
├── Spa.js                     # Listings, services, pricing; text index on title/address/region/services
├── Booking.js                 # Orders with payment status; stores spa/service snapshot at booking time
├── Payment.js                 # Razorpay records
├── Coupon.js                  # Discount codes with global/spa scope and promotional banner settings
├── Contact.js                 # Contact form submissions
├── EmailVerificationToken.js  # Tokens for email verification flow
├── OTPSession.js              # Phone OTP sessions
└── PasswordResetToken.js      # Tokens for password reset flow

lib/
├── mongodb.js              # DB connection with caching
├── jwt.js                  # Token sign/verify (Jose, 7-day expiry)
├── email.js                # Nodemailer email sending
├── razorpay.js             # Payment utilities
├── fast2sms.js             # SMS OTP
├── distance.js             # Haversine distance calculation for geo-filtering spas
├── rate-limit.js           # In-memory rate limiter (resets on server restart)
├── form-validation.js      # Form field validators
├── phone-validation.js     # Phone number validation (libphonenumber-js)
├── utils.js                # cn() helper (clsx + tailwind-merge)
└── cloudinary.js           # Server-side Cloudinary SDK (disabled/unused)
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

### Data Model Notes

- **Booking**: `userId` is optional (supports guest bookings). A `snapshot` sub-document captures spa name, location, phone, service details, and coupon info at booking time — these are preserved even if the spa is later edited. `paymentType` is `"full"` or `"booking_only"`.
- **Coupon**: `scope` is `"global"` or `"spa"`. Has banner settings (`showBanner`, `bannerText`, `bannerColor`, `bannerPosition`) used by the `PromotionalBanner` component via `/api/promotions`.
- **Spa**: Has a MongoDB text index on `title`, `location.address`, `location.region`, and `services` for full-text search. `location` stores lat/lng for haversine distance filtering.
- **User**: `password` field uses `select: false` — must explicitly `.select("+password")` when needed for auth.

### User Roles

- **customer**: Browse, book, manage own bookings, bookmarks
- **spa_owner**: All customer features + create/manage spa listings, coupons
- **admin**: Full system access, user management, spa assignment

## Environment Variables

See `env.example` for the full list. Key variables:

- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - Token signing (Jose)
- `NEXTAUTH_SECRET` - NextAuth
- `GOOGLE_CLIENT_ID/SECRET` - OAuth
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` - Image storage
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Payments
- `RAZORPAY_WEBHOOK_SECRET` - Webhook verification
- `FAST2SMS_API_KEY` - SMS OTP
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `FROM_EMAIL` - Email
- `NEXT_PUBLIC_BASE_URL` - App base URL (used in email links etc.)

## Important Notes

- GST is calculated at 18% on bookings
- Supports partial payment (`booking_only`) vs full payment
- Rate limiter (`lib/rate-limit.js`) is in-memory — does not persist across server restarts and is not suitable for multi-instance deployments
- NextAuth is v5 beta (`next-auth@5.0.0-beta.30`) — its API differs from v4
- No test framework configured — only ESLint and TypeScript checking available
- Path alias `@/*` maps to the project root
- Cloudinary packages remain installed but are not actively used — GitHub API is the image backend

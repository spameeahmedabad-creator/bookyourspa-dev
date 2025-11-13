# BookYourSpa - Spa Booking Platform

A comprehensive Next.js application for discovering and booking spa and wellness centers across cities.

## 🚀 Features

### Authentication
- **OTP-based Login**: Phone number + OTP verification via Twilio
- **Role-based Access**: Customer, Spa Owner, and Admin roles
- **JWT Authentication**: Secure session management

### Spa Discovery
- **Search Functionality**: Search by spa name, location, or services
- **Auto-complete Suggestions**: Real-time search results
- **Paginated Listings**: 3 columns × 2 rows per page
- **Spa Detail Pages**: Complete information with gallery, services, pricing

### Booking System
- **Guest & Authenticated Booking**: Book with or without login
- **Auto-fill for Logged Users**: Name and phone pre-filled
- **WhatsApp Notifications**: 
  - Customer confirmation messages
  - Spa owner booking notifications
- **Real-time Dashboard Sync**: Bookings visible across all relevant dashboards

### Dashboard Features
- **My Bookings**: Role-filtered booking views
  - Customers: See their own bookings
  - Spa Owners: See bookings for their spas
  - Admin: See all bookings
- **Add Listing**: Create new spa listings with:
  - Basic info (title, logo, services, description)
  - Location details (address, region, coordinates)
  - Gallery images
  - Contact information (phone, email, social media)
  - Pricing with multiple service options
- **Bookmarks**: Save favorite spas (coming soon)
- **Messages**: Communication hub (coming soon)

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB
- Yarn package manager
- Twilio account (for SMS/WhatsApp - optional, mocked by default)

## 🛠️ Installation

1. **Install dependencies**:
```bash
cd /app/bookyourspa
yarn install
```

2. **Set up environment variables**:
Edit `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/bookyourspa
JWT_SECRET=your-secret-key

# Twilio Credentials (Optional - currently mocked)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

NEXT_PUBLIC_APP_URL=http://localhost:3002
```

3. **Seed sample data** (optional):
```bash
node scripts/seed.js
```

4. **Run development server**:
```bash
yarn dev
```

Visit: http://localhost:3002

## 🏗️ Project Structure

```
bookyourspa/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── spas/         # Spa CRUD & search
│   │   └── bookings/     # Booking management
│   ├── dashboard/        # Dashboard pages
│   │   ├── bookings/
│   │   ├── add-listing/
│   │   ├── bookmarks/
│   │   └── messages/
│   ├── login/            # Login page
│   ├── spa/[id]/         # Spa detail page
│   ├── layout.js         # Root layout
│   ├── page.js           # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # UI components
│   ├── Navbar.jsx
│   ├── SearchBar.jsx
│   ├── SpaCard.jsx
│   └── BookingModal.jsx
├── lib/                  # Utilities
│   ├── mongodb.js       # DB connection
│   ├── jwt.js           # JWT helpers
│   ├── twilio.js        # Twilio integration
│   └── utils.js         # Helper functions
├── models/               # MongoDB models
│   ├── User.js
│   ├── Spa.js
│   ├── Booking.js
│   └── OTPSession.js
├── middleware.js         # Next.js middleware
└── scripts/
    └── seed.js          # Database seeding

```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Spas
- `GET /api/spas` - List all spas (paginated)
- `GET /api/spas/[id]` - Get single spa
- `POST /api/spas` - Create spa (Admin/Owner)
- `PUT /api/spas/[id]` - Update spa (Owner/Admin)
- `DELETE /api/spas/[id]` - Delete spa (Admin)
- `GET /api/spas/search?q=query` - Search spas

### Bookings
- `GET /api/bookings` - Get bookings (role-filtered)
- `POST /api/bookings` - Create booking

## 👥 User Roles

### Customer
- Browse and search spas
- View spa details
- Book appointments
- View own bookings
- Bookmark spas

### Spa Owner
- All Customer permissions
- Add/edit their own spa listings
- View bookings for their spas

### Admin
- All permissions
- View all bookings
- Manage all spas
- User management

## 🧪 Test Credentials

After running the seed script:

**Admin Account**:
- Phone: `+919999999999`
- Login to get OTP (displayed in console during development)

**Sample Spas**:
- Serenity Wellness Spa (Ahmedabad)
- Royal Retreat Spa & Wellness (Ahmedabad)
- Bliss Spa Gandhinagar (Gandhinagar)

## 🔐 Twilio Integration

### Currently Mocked
The application is set up with mocked Twilio integration. All SMS/WhatsApp messages are logged to console.

### To Enable Real Twilio:
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID, Auth Token, and Phone Number
3. Update `.env.local` with real credentials
4. The app will automatically switch from mocked to real API calls

### WhatsApp Messages

**Customer Confirmation**:
```
Hi [Customer Name]

Your spa booking has been confirmed by [Spa Name]

Service: [Service Name]
Location: [Spa Location]
Date and Time: [Booking DateTime]
```

**Spa Owner Notification**:
```
Hello [Spa Owner Name]

A new spa booking has been confirmed.

Spa name: [Spa Name]
Customer name: [Customer Name]
Customer's phone no: [Customer Phone]
Service: [Service Name]
Date and Time: [Booking DateTime]
```

## 🎨 Design Features

- Modern, clean UI with Tailwind CSS
- Gradient backgrounds (emerald to teal theme)
- Responsive design (mobile, tablet, desktop)
- Loading states and animations
- Toast notifications (sonner)
- Form validation
- Search autocomplete
- Pagination

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Twilio OTP
- **Notifications**: Twilio SMS/WhatsApp
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## 📝 Available Services

- Couple Massage
- Deep Tissue Massage
- Dry Massage
- Four Hand Massage
- Hammam Massage
- Hot Stone Massage
- Jacuzzi Massage
- Oil Massage
- Potli Massage
- Shirodhara Massage
- Swedish Massage

## 🚧 Coming Soon

- Bookmarks functionality
- Messages/Chat system
- Advanced filters
- Rating and reviews
- Payment integration
- Image uploads (currently URL-based)
- Email notifications
- SMS notifications (in addition to WhatsApp)

## 📄 License

Private project for BookYourSpa

## 🤝 Support

For support, contact the development team or refer to the documentation.

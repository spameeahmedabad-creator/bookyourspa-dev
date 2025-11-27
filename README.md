# BookYourSpa

A modern spa booking platform built with Next.js for discovering and booking spa and wellness centers.

## Overview

BookYourSpa is a comprehensive web application that connects customers with spa and wellness centers. Users can search, discover, and book spa services with ease, while spa owners can manage their listings and bookings through an intuitive dashboard.

## Features

### Authentication & User Management

- **Multiple Login Options**: Email/password, Google OAuth, and phone OTP authentication
- **Email Verification**: Secure email verification for new registrations
- **Password Recovery**: Forgot password functionality with email reset links
- **Role-Based Access**: Three user roles - Customer, Spa Owner, and Admin
- **Secure Sessions**: JWT-based authentication with secure cookie management

### Spa Discovery

- **Advanced Search**: Search spas by name, location, or services
- **Real-time Suggestions**: Auto-complete search functionality
- **Filtering**: Filter by city and service type
- **Detailed Listings**: Comprehensive spa information including gallery, services, pricing, and contact details
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

### Booking System

- **Flexible Booking**: Book appointments as a guest or authenticated user
- **Smart Forms**: Auto-filled booking forms for logged-in users
- **Booking Management**: View and manage bookings through personalized dashboards
- **Role-Specific Views**: Different booking views for customers, spa owners, and admins

### Dashboard Features

- **My Bookings**: View all bookings filtered by user role
- **Add Listing**: Spa owners can create and manage their spa listings
- **Image Management**: Upload and manage spa images using Cloudinary
- **Admin Panel**: Comprehensive admin dashboard for managing users, spas, and bookings
- **Bookmarks**: Save favorite spas for quick access
- **Messages**: Communication hub for users

### Additional Features

- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Toast Notifications**: User-friendly notifications for all actions
- **Form Validation**: Comprehensive client and server-side validation
- **Rate Limiting**: Protection against abuse and spam
- **Image Uploads**: Cloudinary integration for seamless image management

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js, JWT
- **Image Storage**: Cloudinary
- **Email**: Nodemailer with React Email
- **SMS**: Fast2SMS
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## Prerequisites

- Node.js 18 or higher
- MongoDB database
- Yarn package manager
- Fast2SMS account (for SMS OTP)
- Cloudinary account (for image uploads)
- Email service (for email verification and password reset)
- Google OAuth credentials (for Google login)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd bookyourspa
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key
   NEXT_AUTH_SECRET=your_nextauth_secret
   NEXT_AUTH_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Fast2SMS (for SMS OTP)
   FAST2SMS_API_KEY=your_fast2sms_api_key

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration
   EMAIL_HOST=your_email_smtp_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_address
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=your_from_email_address

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run database migrations** (if applicable)

   ```bash
   node scripts/migrate-users-to-email.js
   ```

5. **Seed sample data** (optional)

   ```bash
   node scripts/seed.js
   ```

6. **Start the development server**

   ```bash
   yarn dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## User Roles

### Customer

- Browse and search spas
- View detailed spa information
- Book spa appointments
- Manage personal bookings
- Bookmark favorite spas

### Spa Owner

- All customer features
- Create and manage spa listings
- Upload spa images
- View bookings for their spas
- Manage spa information and pricing

### Admin

- Full system access
- Manage all users and spas
- View all bookings
- User role management
- System administration

## Available Services

The platform supports various spa services including:

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

## Project Structure

The project follows Next.js App Router conventions with organized directories for:

- API routes for backend functionality
- React components for UI
- Database models and utilities
- Authentication and middleware
- Configuration files

## Development

- **Development Server**: `yarn dev`
- **Build**: `yarn build`
- **Production**: `yarn start`
- **Linting**: `yarn lint`

## License

Private project for BookYourSpa

## Support

For support and inquiries, please contact the development team.

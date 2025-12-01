"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-emerald-50">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-10">
          <div className="prose prose-emerald max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>Personal Information:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Name and phone number (for booking and authentication)</li>
              <li>Email address (optional)</li>
              <li>Booking history and preferences</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Process and confirm your spa bookings</li>
              <li>Send booking confirmations via WhatsApp</li>
              <li>Improve our services and user experience</li>
              <li>Communicate important updates about your bookings</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Information Sharing
            </h2>
            <p className="text-gray-700 mb-6">
              We share your booking information with spa partners only to
              facilitate your appointments. We do not sell your personal
              information to third parties.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate security measures to protect your
              personal information. However, no method of transmission over the
              Internet is 100% secure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Your Rights
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Contact Us
            </h2>
            <p className="text-gray-700 mb-2">For privacy-related questions:</p>
            <ul className="list-none text-gray-700 mb-6 space-y-2">
              <li>
                <strong>Email:</strong> privacy@bookyourspa.com
              </li>
              <li>
                <strong>Phone:</strong> +91 79 1234 5678
              </li>
            </ul>
          </div>
        </div>

        <BackToHome />
      </div>

      <Footer variant="simple" />
    </div>
  );
}

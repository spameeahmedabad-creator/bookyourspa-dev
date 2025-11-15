'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-emerald-50">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-10">
          <div className="prose prose-emerald max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using BookYourSpa ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Services</h2>
            <p className="text-gray-700 mb-4">
              BookYourSpa provides a platform for users to discover and book spa and wellness services. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide accurate and complete information when booking</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the platform only for lawful purposes</li>
              <li>Not engage in any activity that disrupts or interferes with our services</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Cancellation</h2>
            <p className="text-gray-700 mb-4">
              <strong>Booking Process:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>All bookings are subject to availability</li>
              <li>You will receive confirmation via WhatsApp</li>
              <li>Booking details must be accurate and complete</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Cancellation Policy:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Cancellations must be made directly with the spa</li>
              <li>Each spa may have different cancellation policies</li>
              <li>Late cancellations may incur charges as per spa policy</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
            <p className="text-gray-700 mb-6">
              Currently, all payments are made directly at the spa. Online payment integration is coming soon. BookYourSpa does not handle monetary transactions at this time.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>You are responsible for maintaining your account security</li>
              <li>You must arrive on time for your booking</li>
              <li>You must comply with spa rules and regulations</li>
              <li>You must treat spa staff and property with respect</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Spa Partner Responsibilities</h2>
            <p className="text-gray-700 mb-6">
              Spa partners listed on BookYourSpa are independent businesses. We verify partners but are not responsible for the quality of services provided. Any disputes should be resolved directly with the spa.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              All content on BookYourSpa, including text, graphics, logos, and software, is the property of BookYourSpa and protected by copyright laws. You may not reproduce, distribute, or create derivative works without permission.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-6">
              We collect and process personal data in accordance with our Privacy Policy. By using our services, you consent to such processing and warrant that all data provided is accurate.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              BookYourSpa acts as a platform connecting users with spa services. We are not liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Quality of services provided by spa partners</li>
              <li>Any injuries or damages incurred at spa facilities</li>
              <li>Cancellations or changes made by spa partners</li>
              <li>Loss or theft of personal belongings at spa premises</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform constitutes acceptance of modified terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 mb-6">
              We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms or is harmful to other users, us, or third parties.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Ahmedabad, Gujarat.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-700 mb-2">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-none text-gray-700 mb-6 space-y-2">
              <li><strong>Email:</strong> legal@bookyourspa.com</li>
              <li><strong>Phone:</strong> +91 79 1234 5678</li>
              <li><strong>Address:</strong> C.G. Road, Ahmedabad, Gujarat - 380009</li>
            </ul>

            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 mt-8">
              <p className="text-emerald-900 font-semibold">Acknowledgment</p>
              <p className="text-emerald-800 mt-2">
                By using BookYourSpa, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BookYourSpa</h3>
              <p className="text-gray-400">Your trusted platform for booking spa and wellness services.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Ahmedabad, Gujarat</li>
                <li>support@bookyourspa.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BookYourSpa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import SpaCard from '@/components/SpaCard';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchSpas(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (searchParams.get('booking') === 'true') {
      setShowBookingModal(true);
    }
  }, [searchParams]);

  const fetchSpas = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/spas?page=${page}&limit=6`);
      setSpas(response.data.spas || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch spas:', error);
      setSpas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (spa) => {
    router.push(`/spa/${spa._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar />
      
      {/* Hero Section with Search */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 py-8 sm:py-12 lg:py-16" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
              Discover Your Perfect Spa Experience
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-emerald-50 max-w-2xl mx-auto px-4">
              Find and book the best spa and wellness centers across Ahmedabad, Gandhinagar, and beyond
            </p>
          </div>
          
          <SearchBar onSelectSpa={handleSearch} />
        </div>
      </div>

      {/* Spa Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Featured Spas</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No spas found. Be the first to add one!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="spa-grid">
              {spas.map((spa) => (
                <SpaCard key={spa._id} spa={spa} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 sm:space-x-4 mt-8 sm:mt-12" data-testid="pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  data-testid="prev-page-button"
                  className="text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <span className="text-gray-700 font-medium text-xs sm:text-base">
                  {currentPage}/{totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="next-page-button"
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 sm:ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose BookYourSpa?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Experience hassle-free spa booking with our trusted platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Spas</h3>
              <p className="text-gray-600">All spa centers are verified and trusted for quality services</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-600">Book your spa appointment in seconds with real-time confirmation</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Transparent pricing with no hidden charges</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Got questions? We've got answers</p>
          </div>

          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                How do I book a spa appointment?
                <span className="text-emerald-600 transition group-open:rotate-180">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600">Simply search for your preferred spa, select your desired service, choose date and time, and confirm your booking. You'll receive instant confirmation via WhatsApp.</p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                Do I need to create an account to book?
                <span className="text-emerald-600 transition group-open:rotate-180">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600">No, you can book as a guest. However, creating an account allows you to track bookings, save favorite spas, and get faster checkout.</p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                What payment methods do you accept?
                <span className="text-emerald-600 transition group-open:rotate-180">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600">Currently, payment is made directly at the spa. Online payment integration is coming soon!</p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                Can I cancel or reschedule my booking?
                <span className="text-emerald-600 transition group-open:rotate-180">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600">Yes, you can manage your bookings from the 'My Bookings' section. Contact the spa directly for cancellation or rescheduling.</p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                Are the spas verified?
                <span className="text-emerald-600 transition group-open:rotate-180">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600">Absolutely! All spas listed on BookYourSpa are verified for quality, safety, and professional service standards.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BookYourSpa</h3>
              <p className="text-gray-400">Your trusted platform for booking spa and wellness services across India.</p>
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
              <h4 className="font-semibold mb-4">Cities</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Ahmedabad</li>
                <li>Gandhinagar</li>
                <li>More cities coming soon...</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BookYourSpa. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal 
        open={showBookingModal} 
        onClose={() => {
          setShowBookingModal(false);
          router.push('/');
        }} 
      />
    </div>
  );
}

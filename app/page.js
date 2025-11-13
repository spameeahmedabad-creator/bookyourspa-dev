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
      setSpas(response.data.spas);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch spas:', error);
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
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 py-16" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Discover Your Perfect Spa Experience
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 max-w-2xl mx-auto">
              Find and book the best spa and wellness centers across Ahmedabad, Gandhinagar, and beyond
            </p>
          </div>
          
          <SearchBar onSelectSpa={handleSearch} />
        </div>
      </div>

      {/* Spa Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Spas</h2>
        
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
              <div className="flex justify-center items-center space-x-4 mt-12" data-testid="pagination">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  data-testid="prev-page-button"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="next-page-button"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

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

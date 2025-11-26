"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import SpaCard from "@/components/SpaCard";
import BookingModal from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Component that handles search params (needs to be wrapped in Suspense)
function BookingModalHandler({ onBookingDetected }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("booking") === "true") {
      onBookingDetected();
    }
  }, [searchParams, onBookingDetected]);

  return null;
}

export default function Home() {
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Memoize the callback to prevent unnecessary re-renders
  const handleBookingDetected = useCallback(() => {
    setShowBookingModal(true);
  }, []);

  useEffect(() => {
    fetchSpas(currentPage);
    fetchHeroImages();
  }, [currentPage]);

  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const fetchSpas = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/spas?page=${page}&limit=6`);
      setSpas(response.data.spas || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to fetch spas:", error);
      setSpas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroImages = async () => {
    try {
      const response = await axios.get("/api/spas?limit=10");
      const allSpas = response.data.spas || [];

      // Collect images from spa galleries
      const images = [];
      allSpas.forEach((spa) => {
        if (spa.gallery && Array.isArray(spa.gallery)) {
          spa.gallery.forEach((img) => {
            if (img && img.trim() !== "") {
              images.push(img);
            }
          });
        }
        // Also use logo if available
        if (spa.logo && spa.logo.trim() !== "") {
          images.push(spa.logo);
        }
      });

      // If we have images, use them; otherwise use placeholder spa images
      if (images.length > 0) {
        setHeroImages(images.slice(0, 5)); // Use first 5 images
      } else {
        // Placeholder spa images from Unsplash
        setHeroImages([
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80",
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80",
          "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&q=80",
          "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&q=80",
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80",
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch hero images:", error);
      // Fallback to placeholder images
      setHeroImages([
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80",
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80",
        "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&q=80",
      ]);
    }
  };

  const handleSearch = (spa) => {
    router.push(`/spa/${spa._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Suspense fallback={null}>
        <BookingModalHandler onBookingDetected={handleBookingDetected} />
      </Suspense>
      <Navbar />

      {/* Hero Section with Sliding Background Images */}
      <div
        className="relative py-8 sm:py-12 lg:py-16 min-h-[400px] sm:min-h-[500px] flex items-center"
        data-testid="hero-section"
      >
        {/* Sliding Background Images */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroImages.length > 0 ? (
            <>
              {heroImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Spa background ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-teal-800/75 to-cyan-900/80"></div>
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2 drop-shadow-lg">
              Book The Best Spa & Massage in Ahmedabad and Gandhinagar
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-emerald-50 max-w-2xl mx-auto px-4 drop-shadow-md">
              Find and book the best spa and wellness centers across Ahmedabad,
              Gandhinagar, and beyond
            </p>
          </div>

          <SearchBar onSelectSpa={handleSearch} />
        </div>

        {/* Image indicators */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {/* {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))} */}
          </div>
        )}
      </div>

      {/* Spa Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 sm:mb-8">
          Featured Spas
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No spas found. Be the first to add one!
            </p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-testid="spa-grid"
            >
              {spas.map((spa) => (
                <SpaCard key={spa._id} spa={spa} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex justify-center items-center space-x-2 sm:space-x-4 mt-8 sm:mt-12"
                data-testid="pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
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
      <div className="bg-gradient-to-b from-white via-emerald-50/30 to-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Why Choose BookYourSpa?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience hassle-free spa booking with our trusted platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Verified Spas
              </h3>
              <p className="text-gray-600">
                All spa centers are verified and trusted for quality services
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-teal-100">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Instant Booking
              </h3>
              <p className="text-gray-600">
                Book your spa appointment in seconds with real-time confirmation
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cyan-100">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Best Prices
              </h3>
              <p className="text-gray-600">
                Transparent pricing with no hidden charges
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BookYourSpa</h3>
              <p className="text-gray-400">
                Your trusted platform for booking spa and wellness services
                across India.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
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
          router.push("/");
        }}
      />
    </div>
  );
}

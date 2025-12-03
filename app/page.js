"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import SpaCard from "@/components/SpaCard";
import BookingModal from "@/components/BookingModal";
import Footer from "@/components/Footer";
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

function HomeContent() {
  const searchParams = useSearchParams();
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ahmedabadCount, setAhmedabadCount] = useState(0);
  const [gandhinagarCount, setGandhinagarCount] = useState(0);
  const [cityImages, setCityImages] = useState({
    ahmedabad: null,
    gandhinagar: null,
  });
  const [cityFilter, setCityFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [serviceImages, setServiceImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const router = useRouter();

  // Memoize the callback to prevent unnecessary re-renders
  const handleBookingDetected = useCallback(() => {
    setShowBookingModal(true);
  }, []);

  // Read city from URL params on mount and when params change
  useEffect(() => {
    const cityParam = searchParams.get("city");
    if (cityParam) {
      setCityFilter(cityParam);
      setCurrentPage(1); // Reset to first page when filter changes
    }
  }, [searchParams]);

  // Fetch spas when pagination or filters change
  useEffect(() => {
    fetchSpas(currentPage, cityFilter, serviceFilter);
  }, [currentPage, cityFilter, serviceFilter]);

  // Fetch static data once
  useEffect(() => {
    fetchHeroImages();
    fetchCityCounts();
    fetchServiceImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  // Auto-scroll carousel for Popular Categories
  useEffect(() => {
    if (serviceImages.length > 0) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % serviceImages.length);
      }, 3000); // Scroll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [serviceImages.length]);

  const fetchSpas = async (page, city = "", service = "") => {
    try {
      setLoading(true);
      if (city || service) {
        // Fetch all spas and filter by city and/or service
        const response = await axios.get(`/api/spas?limit=1000`);
        const allSpas = response.data.spas || [];

        // Filter spas
        let filteredSpas = allSpas;

        // Filter by city if provided
        if (city) {
          filteredSpas = filteredSpas.filter((spa) => {
            const region = spa.location?.region?.toLowerCase() || "";
            const address = spa.location?.address?.toLowerCase() || "";
            return (
              region.includes(city.toLowerCase()) ||
              address.includes(city.toLowerCase())
            );
          });
        }

        // Filter by service if provided
        if (service) {
          filteredSpas = filteredSpas.filter((spa) => {
            // Check if spa has this service in services array
            const hasService = spa.services?.some(
              (s) => s.toLowerCase() === service.toLowerCase()
            );
            // Also check in pricing items
            const hasInPricing = spa.pricing?.some(
              (p) => p.title?.toLowerCase() === service.toLowerCase()
            );
            return hasService || hasInPricing;
          });
        }

        // Paginate the filtered results
        const limit = 6;
        const skip = (page - 1) * limit;
        const paginatedSpas = filteredSpas.slice(skip, skip + limit);
        setSpas(paginatedSpas);
        setTotalPages(Math.ceil(filteredSpas.length / limit) || 1);
      } else {
        const response = await axios.get(`/api/spas?page=${page}&limit=6`);
        setSpas(response.data.spas || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
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

  const fetchCityCounts = async () => {
    try {
      const response = await axios.get("/api/spas?limit=1000");
      const allSpas = response.data.spas || [];

      // Count spas by city
      let ahmedabad = 0;
      let gandhinagar = 0;
      let ahmedabadImage = null;
      let gandhinagarImage = null;

      allSpas.forEach((spa) => {
        const region = spa.location?.region?.toLowerCase() || "";
        const address = spa.location?.address?.toLowerCase() || "";

        if (region.includes("ahmedabad") || address.includes("ahmedabad")) {
          ahmedabad++;
          // Get first image for Ahmedabad
          if (!ahmedabadImage && spa.gallery && spa.gallery.length > 0) {
            ahmedabadImage = spa.gallery[0];
          } else if (!ahmedabadImage && spa.logo) {
            ahmedabadImage = spa.logo;
          }
        }

        if (region.includes("gandhinagar") || address.includes("gandhinagar")) {
          gandhinagar++;
          // Get first image for Gandhinagar
          if (!gandhinagarImage && spa.gallery && spa.gallery.length > 0) {
            gandhinagarImage = spa.gallery[0];
          } else if (!gandhinagarImage && spa.logo) {
            gandhinagarImage = spa.logo;
          }
        }
      });

      setAhmedabadCount(ahmedabad);
      setGandhinagarCount(gandhinagar);
      setCityImages({
        ahmedabad:
          ahmedabadImage ||
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
        gandhinagar:
          gandhinagarImage ||
          "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80",
      });
    } catch (error) {
      console.error("Failed to fetch city counts:", error);
    }
  };

  const fetchServiceImages = async () => {
    try {
      const response = await axios.get("/api/spas?limit=1000");
      const allSpas = response.data.spas || [];

      // Collect service images from pricing items
      const services = [];
      const serviceMap = new Map();

      allSpas.forEach((spa) => {
        if (spa.pricing && Array.isArray(spa.pricing)) {
          spa.pricing.forEach((item) => {
            if (item.image && item.title) {
              // Use service title as key to avoid duplicates
              if (!serviceMap.has(item.title)) {
                serviceMap.set(item.title, {
                  title: item.title,
                  image: item.image,
                  description: item.description || "",
                });
              }
            }
          });
        }
      });

      // Convert map to array
      const serviceArray = Array.from(serviceMap.values());

      // If we don't have enough service images, use gallery images with service names
      if (serviceArray.length < 5) {
        const availableServices = [
          "Couple Massage",
          "Oil Massage",
          "Deep Tissue Massage",
          "Hot Stone Massage",
          "Swedish Massage",
          "Four Hand Massage",
          "Potli Massage",
          "Shirodhara Massage",
          "Jacuzzi Massage",
          "Hammam Massage",
        ];

        // Get gallery images from spas
        const galleryImages = [];
        allSpas.forEach((spa) => {
          if (spa.gallery && Array.isArray(spa.gallery)) {
            spa.gallery.forEach((img) => {
              if (img && img.trim() !== "") {
                galleryImages.push(img);
              }
            });
          }
        });

        // Fill remaining slots with gallery images and service names
        availableServices.forEach((serviceName, index) => {
          if (!serviceMap.has(serviceName) && galleryImages[index]) {
            serviceArray.push({
              title: serviceName,
              image: galleryImages[index],
              description: "",
            });
          }
        });
      }

      // If still not enough, use placeholder images
      const placeholderServices = [
        {
          title: "Couple Massage",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        },
        {
          title: "Oil Massage",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
        },
        {
          title: "Deep Tissue Massage",
          image:
            "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
        },
        {
          title: "Hot Stone Massage",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        },
        {
          title: "Swedish Massage",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
        },
        {
          title: "Four Hand Massage",
          image:
            "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
        },
        {
          title: "Potli Massage",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        },
        {
          title: "Shirodhara Massage",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
        },
      ];

      // Use service images if available, otherwise use placeholders
      const finalServices =
        serviceArray.length >= 5
          ? serviceArray.slice(0, 8)
          : placeholderServices;

      setServiceImages(finalServices);
    } catch (error) {
      console.error("Failed to fetch service images:", error);
      // Fallback to placeholder services
      setServiceImages([
        {
          title: "Couple Massage",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        },
        {
          title: "Oil Massage",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
        },
        {
          title: "Deep Tissue Massage",
          image:
            "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
        },
        {
          title: "Hot Stone Massage",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        },
        {
          title: "Swedish Massage",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
        },
        {
          title: "Four Hand Massage",
          image:
            "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
        },
        {
          title: "Potli Massage",
          image:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        },
        {
          title: "Shirodhara Massage",
          image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
        },
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
      <div
        id="spa-listings"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {cityFilter && serviceFilter
              ? `Spas in ${cityFilter} - ${serviceFilter}`
              : cityFilter
                ? `Spas in ${cityFilter}`
                : serviceFilter
                  ? `Spas with ${serviceFilter}`
                  : "Featured Spas"}
          </h2>
          {(cityFilter || serviceFilter) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCityFilter("");
                setServiceFilter("");
                setCurrentPage(1);
              }}
              className="w-fit"
            >
              Clear Filter
            </Button>
          )}
        </div>

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
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                  }}
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
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  }}
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

      {/* City Booking Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Explore Spas by City
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the best spa experiences in Ahmedabad and Gandhinagar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6">
            {/* 40% - Text Content */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-4 sm:space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                Book the Best Spa in Ahmedabad & Gandhinagar
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Discover top-rated spa therapies in Ahmedabad and Gandhinagar.
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                Relax, refresh, and book your next spa session instantly with
                SpaMee.
              </p>
              <Button
                onClick={() => {
                  setCityFilter("");
                  setCurrentPage(1);
                  const element = document.getElementById("spa-listings");
                  if (element) {
                    setTimeout(() => {
                      element.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
                className="w-fit bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore Spas Near You
              </Button>
            </div>

            {/* 30% - Ahmedabad Card */}
            <div
              className="lg:col-span-3 relative group cursor-pointer"
              onClick={() => {
                setCityFilter("Ahmedabad");
                setCurrentPage(1);
                const element = document.getElementById("spa-listings");
                if (element) {
                  setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
            >
              <div className="relative h-full min-h-[280px] sm:min-h-[320px] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-white">
                <img
                  src={cityImages.ahmedabad}
                  alt="Ahmedabad Spa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    Book massage in Ahmedabad
                  </h3>
                  <p className="text-lg sm:text-xl font-semibold text-emerald-300">
                    {ahmedabadCount} {ahmedabadCount === 1 ? "Spa" : "Spas"}{" "}
                    Available
                  </p>
                </div>
              </div>
            </div>

            {/* 30% - Gandhinagar Card */}
            <div
              className="lg:col-span-3 relative group cursor-pointer"
              onClick={() => {
                setCityFilter("Gandhinagar");
                setCurrentPage(1);
                const element = document.getElementById("spa-listings");
                if (element) {
                  setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
            >
              <div className="relative h-full min-h-[280px] sm:min-h-[320px] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] bg-white">
                <img
                  src={cityImages.gandhinagar}
                  alt="Gandhinagar Spa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    BOOK MASSAGE IN Gandhinagar
                  </h3>
                  <p className="text-lg sm:text-xl font-semibold text-emerald-300">
                    {gandhinagarCount} {gandhinagarCount === 1 ? "Spa" : "Spas"}{" "}
                    Available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories Section */}
      <div className="bg-white py-12 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Popular Categories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our most popular spa services and treatments
            </p>
          </div>

          {/* Scrolling Carousel - Shows 5 images continuously */}
          {serviceImages.length > 0 && (
            <div className="relative">
              <div className="flex gap-4 sm:gap-6 justify-center items-center overflow-x-hidden">
                {/* Show exactly 5 items in a sliding window */}
                {Array.from({ length: 5 }).map((_, index) => {
                  const totalItems = serviceImages.length;
                  // Calculate which service to show at this position
                  // Use modulo to wrap around
                  const displayIndex = (carouselIndex + index) % totalItems;
                  const service = serviceImages[displayIndex];

                  // Position: 0 (first/blurred), 1-3 (center/clear), 4 (last/blurred)
                  const isBlurred = index === 0 || index === 4;
                  const isCenter = index === 1 || index === 2 || index === 3;

                  return (
                    <div
                      key={`${service.title}-${displayIndex}-${index}`}
                      className={`flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] rounded-xl overflow-hidden shadow-lg transition-all duration-500 cursor-pointer ${
                        isBlurred
                          ? "opacity-40 blur-sm scale-90"
                          : isCenter
                            ? "opacity-100 scale-100 z-10"
                            : "opacity-40 blur-sm scale-90"
                      }`}
                      onClick={() => {
                        setServiceFilter(service.title);
                        setCityFilter(""); // Clear city filter when selecting service
                        setCurrentPage(1);
                        const element = document.getElementById("spa-listings");
                        if (element) {
                          setTimeout(() => {
                            element.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }
                      }}
                    >
                      <div className="relative h-[280px] sm:h-[320px] md:h-[360px] group">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                            {service.title}
                          </h3>
                          {service.description && (
                            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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
      <Footer variant="full" fourthColumn="cities" />

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

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

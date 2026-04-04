"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PromotionalBanner from "@/components/PromotionalBanner";
import SearchBar from "@/components/SearchBar";
import SpaCard from "@/components/SpaCard";
import BookingModal from "@/components/BookingModal";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function BookingModalHandler({ onBookingDetected }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("booking") === "true") onBookingDetected();
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
  const [cityFilter, setCityFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [serviceImages, setServiceImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const router = useRouter();

  const handleBookingDetected = useCallback(
    () => setShowBookingModal(true),
    [],
  );

  useEffect(() => {
    const cityParam = searchParams.get("city");
    if (cityParam) {
      setCityFilter(cityParam);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSpas(currentPage, cityFilter, serviceFilter);
  }, [currentPage, cityFilter, serviceFilter]);
  useEffect(() => {
    fetchHeroImages();
    fetchCityCounts();
    fetchServiceImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(
        () => setCurrentImageIndex((p) => (p + 1) % heroImages.length),
        5000,
      );
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  useEffect(() => {
    if (serviceImages.length > 0) {
      const interval = setInterval(
        () => setCarouselIndex((p) => (p + 1) % serviceImages.length),
        3000,
      );
      return () => clearInterval(interval);
    }
  }, [serviceImages.length]);

  const sortSpasWithDefault = (list) => {
    const def = "Rainbow International Spa ~ Gota";
    return [...list].sort((a, b) =>
      a.title === def ? -1 : b.title === def ? 1 : 0,
    );
  };

  const fetchSpas = async (page, city = "", service = "") => {
    try {
      setLoading(true);
      if (city || service) {
        const response = await axios.get("/api/spas?limit=1000");
        let filtered = response.data.spas || [];
        if (city)
          filtered = filtered.filter(
            (s) => s.location?.region?.toLowerCase() === city.toLowerCase(),
          );
        if (service)
          filtered = filtered.filter(
            (s) =>
              s.services?.some(
                (sv) => sv.toLowerCase() === service.toLowerCase(),
              ) ||
              s.pricing?.some(
                (p) => p.title?.toLowerCase() === service.toLowerCase(),
              ),
          );
        const sorted = sortSpasWithDefault(filtered);
        const limit = 6;
        setSpas(sorted.slice((page - 1) * limit, page * limit));
        setTotalPages(Math.ceil(filtered.length / limit) || 1);
      } else {
        const response = await axios.get(`/api/spas?page=${page}&limit=6`);
        setSpas(sortSpasWithDefault(response.data.spas || []));
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch {
      setSpas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroImages = async () => {
    try {
      const response = await axios.get("/api/spas?limit=10");
      const images = [];
      (response.data.spas || []).forEach((spa) => {
        (spa.gallery || []).forEach((img) => {
          if (img?.trim()) images.push(img);
        });
        if (spa.logo?.trim()) images.push(spa.logo);
      });
      setHeroImages(
        images.length > 0
          ? images.slice(0, 5)
          : [
              "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80",
              "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80",
              "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&q=80",
            ],
      );
    } catch {
      setHeroImages([
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80",
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80",
      ]);
    }
  };

  const fetchCityCounts = async () => {
    try {
      const response = await axios.get("/api/spas?limit=1000");
      let a = 0,
        g = 0;
      (response.data.spas || []).forEach((spa) => {
        const region = spa.location?.region?.toLowerCase() || "";
        if (region === "ahmedabad") a++;
        else if (region === "gandhinagar") g++;
      });
      setAhmedabadCount(a);
      setGandhinagarCount(g);
    } catch {}
  };

  const fetchServiceImages = () => {
    setServiceImages([
      { title: "Dry Massage", image: "/img/category/1.png" },
      { title: "Oil Massage", image: "/img/category/2.png" },
      { title: "Deep Tissue", image: "/img/category/3.png" },
      { title: "Swedish", image: "/img/category/4.png" },
      { title: "Couple", image: "/img/category/5.png" },
      { title: "Four Hand", image: "/img/category/6.png" },
      { title: "Hammam", image: "/img/category/7.png" },
      { title: "Jacuzzi", image: "/img/category/8.png" },
      { title: "Hot Stone", image: "/img/category/9.png" },
      { title: "Potli Massage", image: "/img/category/10.png" },
      { title: "Shirodhara", image: "/img/category/11.png" },
      { title: "Hot Stone Therapy", image: "/img/category/12.png" },
    ]);
  };

  const handleSearch = (spa) => router.push(`/spa/${spa._id}`);

  const scrollToListings = () => {
    setTimeout(
      () =>
        document
          .getElementById("spa-listings")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  return (
    <div className="min-h-screen bg-sand-50">
      <Suspense fallback={null}>
        <BookingModalHandler onBookingDetected={handleBookingDetected} />
      </Suspense>
      <PromotionalBanner />
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative min-h-[520px] sm:min-h-[600px] flex items-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Background images */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${i === currentImageIndex ? "opacity-100" : "opacity-0"}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Multi-layer overlay for rich depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Floating decorative orbs */}
        <div className="absolute top-20 right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Ahmedabad & Gandhinagar's Best Spas
          </div>

          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight max-w-2xl">
            Find Your
            <span className="block text-emerald-gradient">Perfect Escape</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-xl mb-8 sm:mb-10 leading-relaxed">
            Discover and book premium spa experiences. Relax, refresh, and
            rejuvenate — in seconds.
          </p>

          {/* Search */}
          <div className="max-w-xl">
            <SearchBar onSelectSpa={handleSearch} />
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-6 mt-8 sm:mt-10">
            {[
              {
                value: `${ahmedabadCount + gandhinagarCount}+`,
                label: "Verified Spas",
              },
              { value: "500+", label: "Happy Customers" },
              { value: "4.8★", label: "Average Rating" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white font-playfair">
                  {value}
                </p>
                <p className="text-xs text-white/60 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide indicators */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`rounded-full transition-all duration-300 ${i === currentImageIndex ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SPA LISTINGS ── */}
      <section
        id="spa-listings"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
              {cityFilter || serviceFilter ? "Filtered Results" : "Featured"}
            </p>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900">
              {cityFilter && serviceFilter
                ? `${serviceFilter} in ${cityFilter}`
                : cityFilter
                  ? `Spas in ${cityFilter}`
                  : serviceFilter
                    ? `${serviceFilter} Spas`
                    : "Top Spas Near You"}
            </h2>
          </div>
          {(cityFilter || serviceFilter) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCityFilter("");
                setServiceFilter("");
                setCurrentPage(1);
              }}
              className="w-fit rounded-xl border-sand-300 hover:bg-sand-100 text-sm"
            >
              Clear Filter
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl skeleton" />
            ))}
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-sand-400" />
            </div>
            <p className="text-gray-500">
              No spas found. Try a different filter.
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

            {totalPages > 1 && (
              <div
                className="flex justify-center items-center gap-3 mt-12"
                data-testid="pagination"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="prev-page-button"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium border border-sand-200 bg-white hover:bg-sand-50 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm font-semibold text-gray-600 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  data-testid="next-page-button"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium border border-sand-200 bg-white hover:bg-sand-50 disabled:opacity-40 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── CITY SECTION ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">
              Explore by City
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Find Spas Near You
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Premium spa experiences in Ahmedabad and Gandhinagar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
            {/* Left text card */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-7 sm:p-10 text-white shadow-luxury-lg">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-playfair text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                  Book the Best Spa in Ahmedabad & Gandhinagar
                </h3>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Discover top-rated spa therapies. Relax, refresh, and book
                  your session instantly.
                </p>
              </div>
              <button
                onClick={() => {
                  setCityFilter("");
                  setCurrentPage(1);
                  scrollToListings();
                }}
                className="self-start flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Explore All Spas <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Ahmedabad */}
            <CityCard
              image="/img/spa-ahmedabad.jpg"
              city="Ahmedabad"
              count={ahmedabadCount}
              onClick={() => {
                setCityFilter("Ahmedabad");
                setCurrentPage(1);
                scrollToListings();
              }}
            />

            {/* Gandhinagar */}
            <CityCard
              image="/img/spa-gandhinahar.jpg"
              city="Gandhinagar"
              count={gandhinagarCount}
              onClick={() => {
                setCityFilter("Gandhinagar");
                setCurrentPage(1);
                scrollToListings();
              }}
            />
          </div>
        </div>
      </section>

      {/* ── POPULAR CATEGORIES ── */}
      <section className="py-14 sm:py-20 bg-sand-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">
              Services
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Popular Categories
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              From relaxing massages to rejuvenating therapies
            </p>
          </div>

          {serviceImages.length > 0 && (
            <div className="relative group/carousel">
              <button
                onClick={() =>
                  setCarouselIndex((p) =>
                    p === 0 ? serviceImages.length - 1 : p - 1,
                  )
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-luxury rounded-2xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCarouselIndex((p) => (p + 1) % serviceImages.length)
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-luxury rounded-2xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex gap-4 sm:gap-5 justify-center items-center overflow-x-hidden px-6">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const total = serviceImages.length;
                  const displayIndex = (carouselIndex + idx) % total;
                  const service = serviceImages[displayIndex];
                  const isEdge = idx === 0 || idx === 4;
                  const isCenter = idx === 2;
                  const isNear = idx === 1 || idx === 3;
                  return (
                    <div
                      key={`${service.title}-${displayIndex}`}
                      className="flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] rounded-3xl overflow-hidden cursor-pointer shadow-card"
                      style={{
                        opacity: isEdge ? 0.35 : isNear ? 0.8 : 1,
                        filter: isEdge ? "blur(2px)" : "none",
                        transform: `scale(${isEdge ? 0.84 : isNear ? 0.94 : 1})`,
                        transition:
                          "all 0.45s cubic-bezier(0.34, 1.1, 0.64, 1)",
                        zIndex: isCenter ? 10 : isNear ? 5 : 1,
                        boxShadow: isCenter
                          ? "0 12px 40px -8px rgba(5,150,105,0.2)"
                          : undefined,
                      }}
                      onClick={() => {
                        if (!isCenter) {
                          setCarouselIndex(displayIndex);
                          return;
                        }
                        setServiceFilter(service.title);
                        setCityFilter("");
                        setCurrentPage(1);
                        scrollToListings();
                      }}
                    >
                      <div className="relative h-[240px] sm:h-[280px] md:h-[320px] group">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white">
                          <h3 className="font-playfair text-lg sm:text-xl font-bold">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-1.5 mt-6">
                {serviceImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`rounded-full transition-all duration-300 ${i === carouselIndex ? "w-6 h-1.5 bg-emerald-500" : "w-1.5 h-1.5 bg-sand-300 hover:bg-sand-400"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">
              Why Us
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Why Choose BookYourSpa?
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Experience hassle-free spa booking with our trusted platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: CheckCircle2,
                title: "Verified Spas",
                description:
                  "Every spa is vetted and verified for quality, hygiene, and service excellence.",
                color: "emerald",
              },
              {
                icon: Clock,
                title: "Instant Booking",
                description:
                  "Book your spa appointment in seconds with real-time confirmation and WhatsApp updates.",
                color: "teal",
              },
              {
                icon: Star,
                title: "Best Prices",
                description:
                  "Transparent pricing with no hidden charges. Pay just ₹199 to secure your slot.",
                color: "gold",
              },
            ].map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="group p-7 bg-white rounded-3xl border border-sand-100 hover:border-emerald-200 shadow-card hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
                    color === "gold"
                      ? "bg-gold-100"
                      : color === "teal"
                        ? "bg-teal-50"
                        : "bg-emerald-50"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${color === "gold" ? "text-gold-600" : color === "teal" ? "text-teal-600" : "text-emerald-600"}`}
                  />
                </div>
                <h3 className="font-playfair text-lg font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-playfair text-2xl sm:text-4xl font-bold text-white mb-4">
            Ready for Your Wellness Journey?
          </h2>
          <p className="text-emerald-100 text-base mb-8">
            Book your spa appointment now and pay just ₹199 to secure your slot.
          </p>
          <button
            onClick={() => setShowBookingModal(true)}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-2xl text-base font-bold hover:bg-emerald-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Book Your Spa Now
          </button>
        </div>
      </section>

      <Footer variant="full" fourthColumn="cities" />

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

function CityCard({ image, city, count, onClick }) {
  return (
    <div
      className="lg:col-span-3 relative group cursor-pointer rounded-3xl overflow-hidden shadow-card hover:shadow-luxury-lg transition-all duration-400"
      onClick={onClick}
      style={{ minHeight: "300px" }}
    >
      <img
        src={image}
        alt={`${city} Spa`}
        className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-110"
        style={{ minHeight: "300px" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7">
        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {count} {count === 1 ? "Spa" : "Spas"} Available
        </p>
        <h3 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-3">
          Book Massage in {city}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-white/80 text-xs font-medium bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 w-fit group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300">
          Explore <ArrowRight className="w-3 h-3" />
        </span>
      </div>
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

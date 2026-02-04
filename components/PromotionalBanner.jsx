"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X, Tag, Clock, Sparkles } from "lucide-react";

// Static banner configuration
const STATIC_BANNER_CONFIG = {
  enabled: true, // Set to false to use dynamic banner instead
  image: "/etc/rainbow-banner-coupan.png",
  alt: "Special Coupon Offer",
  link: null, // Optional: Add a link URL if the banner should be clickable
};

const colorSchemes = {
  emerald: {
    bg: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600",
    text: "text-white",
    border: "border-emerald-400",
    glow: "shadow-emerald-500/50",
  },
  red: {
    bg: "bg-gradient-to-r from-red-600 via-rose-500 to-red-600",
    text: "text-white",
    border: "border-red-400",
    glow: "shadow-red-500/50",
  },
  purple: {
    bg: "bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600",
    text: "text-white",
    border: "border-purple-400",
    glow: "shadow-purple-500/50",
  },
  orange: {
    bg: "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500",
    text: "text-white",
    border: "border-orange-400",
    glow: "shadow-orange-500/50",
  },
  blue: {
    bg: "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600",
    text: "text-white",
    border: "border-blue-400",
    glow: "shadow-blue-500/50",
  },
  pink: {
    bg: "bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600",
    text: "text-white",
    border: "border-pink-400",
    glow: "shadow-pink-500/50",
  },
};

export default function PromotionalBanner() {
  const [promotions, setPromotions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch dynamic promotions if static banner is disabled
    if (!STATIC_BANNER_CONFIG.enabled) {
      fetchPromotions();
    } else {
      setLoading(false);
    }
  }, []);

  // Auto-rotate promotions every 4 seconds
  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % promotions.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [promotions.length]);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get("/api/promotions");
      if (response.data.success && response.data.promotions.length > 0) {
        setPromotions(response.data.promotions);
      }
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Static banner rendering
  if (STATIC_BANNER_CONFIG.enabled) {
    if (dismissed) return null;

    const BannerImage = ({ className }) => (
      <img
        src={STATIC_BANNER_CONFIG.image}
        alt={STATIC_BANNER_CONFIG.alt}
        className={className}
      />
    );

    const renderBannerContent = (imageClassName) => {
      if (STATIC_BANNER_CONFIG.link) {
        return (
          <a
            href={STATIC_BANNER_CONFIG.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <BannerImage className={imageClassName} />
          </a>
        );
      }
      return <BannerImage className={imageClassName} />;
    };

    return (
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 overflow-hidden">
        {/* All screen sizes: Full width, auto height to show complete image */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto">
            {renderBannerContent("w-full h-auto object-contain")}
          </div>
        </div>

        {/* Close button - responsive sizing and positioning */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
          aria-label="Dismiss banner"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>
    );
  }

  // Dynamic banner - original logic
  if (loading || dismissed || promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex];
  const colors = colorSchemes[currentPromo.color] || colorSchemes.emerald;

  // Calculate time remaining
  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "Ending soon!";
  };

  return (
    <div
      className={`relative ${colors.bg} ${colors.text} overflow-hidden animate-gradient bg-[length:200%_100%]`}
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping delay-100" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2.5 sm:py-3 flex items-center justify-center gap-2 sm:gap-4">
          {/* Sparkle icon */}
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse flex-shrink-0" />

          {/* Main content */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            {/* Promo text */}
            <span className="font-bold text-sm sm:text-base lg:text-lg text-center">
              {currentPromo.text}
            </span>

            {/* Code badge */}
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-mono font-bold border border-white/30">
              <Tag className="w-3 h-3" />
              {currentPromo.code}
            </span>

            {/* Time remaining */}
            <span className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm opacity-90">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {getTimeRemaining(currentPromo.expiresAt)}
            </span>
          </div>

          {/* Sparkle icon */}
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse flex-shrink-0" />

          {/* Close button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Promotion indicators */}
        {promotions.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-4 bg-white"
                    : "w-1 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to promotion ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

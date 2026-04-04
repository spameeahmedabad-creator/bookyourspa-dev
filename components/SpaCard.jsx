"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Bookmark, ArrowRight, Star } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import axios from "axios";
import { toast } from "sonner";

export default function SpaCard({ spa }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndBookmarkStatus();
  }, [spa._id]);

  const checkAuthAndBookmarkStatus = async () => {
    try {
      const userRes = await axios.get("/api/auth/me");
      setUser(userRes.data.user);
      const bookmarksRes = await axios.get("/api/bookmarks");
      const bookmarkedIds = bookmarksRes.data.bookmarks.map((b) =>
        String(b._id || b),
      );
      setIsBookmarked(bookmarkedIds.includes(String(spa._id)));
    } catch {
      setUser(null);
      setIsBookmarked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to bookmark spas");
      return;
    }
    try {
      if (isBookmarked) {
        await axios.delete(`/api/bookmarks?spaId=${spa._id}`);
        setIsBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await axios.post("/api/bookmarks", { spaId: spa._id });
        setIsBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update bookmark");
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;
    router.push(`/spa/${spa._id}`);
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBookingModal(true);
  };

  const hasImage = spa.gallery?.length > 0 && !imgError;

  return (
    <>
      <div
        className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer card-hover shadow-card"
        data-testid={`spa-card-${spa._id}`}
        onClick={handleCardClick}
      >
        {/* Image section — 58% height */}
        <div className="relative h-52 sm:h-60 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
          {hasImage ? (
            <img
              src={spa.gallery[0]}
              alt={spa.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-bold text-emerald-300 font-playfair select-none">
                {spa.title?.charAt(0)}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bookmark button */}
          {user && !loading && (
            <button
              onClick={handleBookmarkToggle}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full glass shadow-sm hover:scale-110 transition-transform duration-200"
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              data-testid={`bookmark-button-${spa._id}`}
            >
              <Bookmark
                className={`w-4 h-4 transition-colors duration-200 ${
                  isBookmarked
                    ? "text-emerald-600 fill-emerald-600"
                    : "text-gray-600"
                }`}
              />
            </button>
          )}

        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3
            className="font-playfair text-base sm:text-lg font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-emerald-700 transition-colors duration-200"
            data-testid={`spa-title-${spa._id}`}
          >
            {spa.title}
          </h3>

          <div className="flex items-start text-gray-500 mb-3 gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
            <span className="text-xs sm:text-sm line-clamp-1 leading-snug">
              {spa.location?.region ||
                spa.location?.address ||
                "Location not specified"}
            </span>
          </div>

          {/* Services */}
          {spa.services?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {spa.services.slice(0, 2).map((service, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full"
                >
                  {service}
                </span>
              ))}
              {spa.services.length > 2 && (
                <span className="text-[11px] font-medium text-gray-400 bg-sand-100 px-2.5 py-0.5 rounded-full border border-sand-200">
                  +{spa.services.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Book Now button */}
          <button
            onClick={handleBookNow}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-300 group/btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-luxury hover:shadow-luxury-lg"
            data-testid={`book-now-${spa._id}`}
          >
            Book Now
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>

      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        prefilledSpa={spa}
      />
    </>
  );
}

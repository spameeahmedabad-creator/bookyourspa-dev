"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/BookingModal";
import axios from "axios";
import { toast } from "sonner";

export default function SpaCard({ spa }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndBookmarkStatus();
  }, [spa._id]);

  const checkAuthAndBookmarkStatus = async () => {
    try {
      const userRes = await axios.get("/api/auth/me");
      setUser(userRes.data.user);

      // Check if spa is bookmarked
      const bookmarksRes = await axios.get("/api/bookmarks");
      const bookmarkedIds = bookmarksRes.data.bookmarks.map((b) =>
        String(b._id || b)
      );
      const spaId = String(spa._id || spa);
      setIsBookmarked(bookmarkedIds.includes(spaId));
    } catch (error) {
      // User not authenticated or no bookmarks
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
        toast.success("Bookmark removed");
      } else {
        await axios.post("/api/bookmarks", { spaId: spa._id });
        setIsBookmarked(true);
        toast.success("Bookmark added");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update bookmark");
    }
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on bookmark button or book now button
    if (
      e.target.closest('button[aria-label*="bookmark"]') ||
      e.target.closest('button[data-testid*="book-now"]')
    ) {
      return;
    }
    router.push(`/spa/${spa._id}`);
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBookingModal(true);
  };

  return (
    <>
      <Card
        className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        data-testid={`spa-card-${spa._id}`}
        onClick={handleCardClick}
      >
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-emerald-200 to-teal-200">
          {spa.images?.length > 0 ? (
            <img
              src={spa.images[0]}
              alt={spa.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-600 font-semibold text-xl">
              {spa.title?.charAt(0)}
            </div>
          )}
          {user && !loading && (
            <button
              onClick={handleBookmarkToggle}
              className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all z-10"
              data-testid={`bookmark-button-${spa._id}`}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Bookmark
                className={`w-5 h-5 ${
                  isBookmarked
                    ? "text-emerald-600 fill-emerald-600"
                    : "text-gray-400 hover:text-emerald-600"
                } transition-colors`}
              />
            </button>
          )}
        </div>

        <CardContent className="p-4 sm:p-6">
          <h3
            className="text-base sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1"
            data-testid={`spa-title-${spa._id}`}
          >
            {spa.title}
          </h3>

          <div className="flex items-start text-gray-600 mb-3">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 mt-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm line-clamp-2">
              {spa.location?.address ||
                spa.location?.region ||
                "Location not specified"}
            </span>
          </div>

          {spa.services?.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {spa.services.slice(0, 2).map((service, index) => (
                  <span
                    key={index}
                    className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full"
                  >
                    {service}
                  </span>
                ))}
                {spa.services.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{spa.services.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={handleBookNow}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base h-9 sm:h-10"
            data-testid={`book-now-${spa._id}`}
          >
            Book Now
          </Button>
        </CardContent>
      </Card>
      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        prefilledSpa={spa}
      />
    </>
  );
}

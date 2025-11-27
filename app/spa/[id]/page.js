"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import GallerySlider from "@/components/GallerySlider";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  MessageCircle,
  Instagram,
  Navigation,
  Bookmark,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function SpaDetailPage() {
  const params = useParams();
  const [spa, setSpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [user, setUser] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pricingExpanded, setPricingExpanded] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchSpaDetails();
      checkBookmarkStatus();
    }
  }, [params.id]);

  // Prevent body scroll when gallery modal is open and handle ESC key
  useEffect(() => {
    if (showGalleryModal) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          setShowGalleryModal(false);
        }
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleEsc);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showGalleryModal]);

  const fetchSpaDetails = async () => {
    try {
      const response = await axios.get(`/api/spas/${params.id}`);
      setSpa(response.data.spa);
    } catch (error) {
      toast.error("Failed to load spa details");
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const userRes = await axios.get("/api/auth/me");
      setUser(userRes.data.user);

      const bookmarksRes = await axios.get("/api/bookmarks");
      const bookmarkedIds = bookmarksRes.data.bookmarks.map((b) =>
        String(b._id || b)
      );
      setIsBookmarked(bookmarkedIds.includes(String(params.id)));
    } catch (error) {
      // User not authenticated
      setUser(null);
      setIsBookmarked(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error("Please login to bookmark spas");
      return;
    }

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await axios.delete(`/api/bookmarks?spaId=${params.id}`);
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await axios.post("/api/bookmarks", { spaId: params.id });
        setIsBookmarked(true);
        toast.success("Bookmark added");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!spa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Spa not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div
        className="max-w-6xl mx-auto px-4 py-4 sm:py-8"
        data-testid="spa-detail-page"
      >
        {/* Gallery Grid - Replaces logo section */}
        {spa.gallery && spa.gallery.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {spa.gallery.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setShowGalleryModal(true);
                  }}
                >
                  <img
                    src={image}
                    alt={`${spa.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback to logo if no gallery */}
        {(!spa.gallery || spa.gallery.length === 0) && spa.logo && (
          <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden">
            <img
              src={spa.logo}
              alt={spa.title}
              className="w-full h-48 sm:h-64 lg:h-96 object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
                data-testid="spa-detail-title"
              >
                {spa.title}
              </h1>

              {spa.location && (
                <div className="flex items-start text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p>{spa.location.address}</p>
                    <p className="text-sm">{spa.location.region}</p>
                  </div>
                </div>
              )}

              {/* Redirect to Shop/Map Button */}
              {spa.location && spa.location.googleMapsLink && (
                <div className="mb-4">
                  <Button
                    onClick={() => {
                      window.open(spa.location.googleMapsLink, "_blank");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="redirect-to-shop-button"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Redirect to SPA
                  </Button>
                </div>
              )}
            </div>

            {/* Description */}
            {spa.description && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {spa.description}
                </p>
              </div>
            )}

            {/* Services */}
            {spa.services && spa.services.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Services</h2>
                <div className="grid grid-cols-2 gap-3">
                  {spa.services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {spa.pricing && spa.pricing.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
                <div className="space-y-4">
                  {(pricingExpanded
                    ? spa.pricing
                    : spa.pricing.slice(0, 6)
                  ).map((item, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {spa.pricing.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setPricingExpanded(!pricingExpanded)}
                      className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                    >
                      {pricingExpanded
                        ? "Show Less"
                        : `Show All (${spa.pricing.length - 6} more)`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow lg:sticky lg:top-24">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 mb-3 sm:mb-4 h-10 sm:h-12 text-base sm:text-lg"
                onClick={() => setShowBookingModal(true)}
                data-testid="book-now-detail-button"
              >
                Book Now
              </Button>

              {user && (
                <Button
                  variant="outline"
                  className="w-full mb-4 sm:mb-6 h-10 sm:h-12 text-base sm:text-lg border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  data-testid="bookmark-detail-button"
                >
                  <Bookmark
                    className={`w-4 h-4 mr-2 ${
                      isBookmarked ? "fill-current" : ""
                    }`}
                  />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              )}

              {/* Contact Info */}
              {spa.contact && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>

                  {spa.contact.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3" />
                      <span className="text-sm">{spa.contact.phone}</span>
                    </div>
                  )}

                  {spa.contact.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3" />
                      <span className="text-sm">{spa.contact.email}</span>
                    </div>
                  )}

                  {spa.contact.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="w-4 h-4 mr-3" />
                      <a
                        href={spa.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {/* Social Media */}
                  <div className="flex space-x-4 pt-4">
                    {spa.contact.facebook && (
                      <a
                        href={spa.contact.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-emerald-600"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {spa.contact.whatsapp && (
                      <a
                        href={
                          spa.contact.whatsapp.startsWith("http")
                            ? spa.contact.whatsapp
                            : `https://wa.me/${spa.contact.whatsapp.replace(/[^0-9]/g, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-emerald-600"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                    {spa.contact.instagram && (
                      <a
                        href={spa.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-emerald-600"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        prefilledSpa={spa}
      />

      {/* Gallery Modal */}
      {showGalleryModal && spa.gallery && spa.gallery.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowGalleryModal(false)}
        >
          <button
            onClick={() => setShowGalleryModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
            aria-label="Close gallery"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative w-full max-w-7xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GallerySlider
              images={spa.gallery}
              spaTitle={spa.title}
              initialIndex={selectedImageIndex}
              disableFullscreen={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

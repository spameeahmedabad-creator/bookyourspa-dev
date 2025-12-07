"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Grid3X3, Images } from "lucide-react";

export default function GallerySlider({
  images,
  spaTitle,
  initialIndex = 0,
  disableFullscreen = false,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === "ArrowLeft") {
          setFullscreenIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        } else if (e.key === "ArrowRight") {
          setFullscreenIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        } else if (e.key === "Escape") {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, images.length]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  const openFullscreen = (index) => {
    if (!disableFullscreen) {
      setFullscreenIndex(index);
      setIsFullscreen(true);
    }
  };

  const goToPrevious = () => {
    setFullscreenIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setFullscreenIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return null;
  }

  // For single image, show simple display
  if (images.length === 1) {
    return (
      <>
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src={images[0]}
            alt={`${spaTitle} - Image 1`}
            className="w-full h-64 sm:h-80 lg:h-[450px] object-cover cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => openFullscreen(0)}
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300" />
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <FullscreenModal
            images={images}
            currentIndex={fullscreenIndex}
            spaTitle={spaTitle}
            onClose={() => setIsFullscreen(false)}
            onPrevious={goToPrevious}
            onNext={goToNext}
            setIndex={setFullscreenIndex}
          />
        )}
      </>
    );
  }

  // For 2 images
  if (images.length === 2) {
    return (
      <>
        <div className="relative">
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative h-64 sm:h-80 lg:h-[400px] cursor-pointer overflow-hidden group"
                onClick={() => openFullscreen(index)}
              >
                <img
                  src={image}
                  alt={`${spaTitle} - Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
            ))}
          </div>
          {/* Show All Photos Button */}
          <ShowAllPhotosButton count={images.length} onClick={() => openFullscreen(0)} />
        </div>

        {isFullscreen && (
          <FullscreenModal
            images={images}
            currentIndex={fullscreenIndex}
            spaTitle={spaTitle}
            onClose={() => setIsFullscreen(false)}
            onPrevious={goToPrevious}
            onNext={goToNext}
            setIndex={setFullscreenIndex}
          />
        )}
      </>
    );
  }

  // For 3-4 images
  if (images.length <= 4) {
    return (
      <>
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {/* Large Left Image */}
            <div
              className="relative h-64 sm:h-80 lg:h-[400px] cursor-pointer overflow-hidden group sm:row-span-2"
              onClick={() => openFullscreen(0)}
            >
              <img
                src={images[0]}
                alt={`${spaTitle} - Image 1`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </div>
            
            {/* Right Side Images */}
            <div className="grid grid-cols-2 gap-2 h-64 sm:h-80 lg:h-[400px]">
              {images.slice(1, 4).map((image, index) => (
                <div
                  key={index + 1}
                  className={`relative cursor-pointer overflow-hidden group ${
                    images.length === 3 && index === 1 ? "col-span-2" : ""
                  }`}
                  onClick={() => openFullscreen(index + 1)}
                >
                  <img
                    src={image}
                    alt={`${spaTitle} - Image ${index + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
          {/* Show All Photos Button */}
          <ShowAllPhotosButton count={images.length} onClick={() => openFullscreen(0)} />
        </div>

        {isFullscreen && (
          <FullscreenModal
            images={images}
            currentIndex={fullscreenIndex}
            spaTitle={spaTitle}
            onClose={() => setIsFullscreen(false)}
            onPrevious={goToPrevious}
            onNext={goToNext}
            setIndex={setFullscreenIndex}
          />
        )}
      </>
    );
  }

  // For 5+ images - Main gallery grid (Airbnb/Booking style)
  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl overflow-hidden">
          {/* Large Left Image (50%) */}
          <div
            className="relative h-64 sm:h-80 lg:h-[400px] cursor-pointer overflow-hidden group"
            onClick={() => openFullscreen(0)}
          >
            <img
              src={images[0]}
              alt={`${spaTitle} - Image 1`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </div>

          {/* Right Side 2x2 Grid (50%) */}
          <div className="hidden sm:grid grid-cols-2 grid-rows-2 gap-2 h-80 lg:h-[400px]">
            {/* Top Left */}
            <div
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => openFullscreen(1)}
            >
              <img
                src={images[1]}
                alt={`${spaTitle} - Image 2`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </div>

            {/* Top Right */}
            <div
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => openFullscreen(2)}
            >
              <img
                src={images[2]}
                alt={`${spaTitle} - Image 3`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </div>

            {/* Bottom Left */}
            <div
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => openFullscreen(3)}
            >
              <img
                src={images[3]}
                alt={`${spaTitle} - Image 4`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </div>

            {/* Bottom Right - with overlay for remaining photos */}
            <div
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => openFullscreen(4)}
            >
              <img
                src={images[4]}
                alt={`${spaTitle} - Image 5`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              
              {/* Show remaining count if more than 5 images */}
              {images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:bg-black/50 transition-all duration-300">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    +{images.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Show 4 small images in a row */}
          <div className="grid grid-cols-4 gap-1 sm:hidden h-20">
            {images.slice(1, 5).map((image, index) => (
              <div
                key={index + 1}
                className="relative cursor-pointer overflow-hidden group"
                onClick={() => openFullscreen(index + 1)}
              >
                <img
                  src={image}
                  alt={`${spaTitle} - Image ${index + 2}`}
                  className="w-full h-full object-cover"
                />
                {/* Show remaining count on last visible image */}
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">+{images.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Show All Photos Button */}
        <ShowAllPhotosButton count={images.length} onClick={() => openFullscreen(0)} />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <FullscreenModal
          images={images}
          currentIndex={fullscreenIndex}
          spaTitle={spaTitle}
          onClose={() => setIsFullscreen(false)}
          onPrevious={goToPrevious}
          onNext={goToNext}
          setIndex={setFullscreenIndex}
        />
      )}
    </>
  );
}

// Show All Photos Button Component
function ShowAllPhotosButton({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium text-sm transition-all duration-300 hover:shadow-xl border border-gray-200"
    >
      <Grid3X3 className="w-4 h-4" />
      <span>Show All Photos</span>
      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
        {count}
      </span>
    </button>
  );
}

// Fullscreen Modal Component
function FullscreenModal({
  images,
  currentIndex,
  spaTitle,
  onClose,
  onPrevious,
  onNext,
  setIndex,
}) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [viewMode, setViewMode] = useState("slider"); // "slider" or "grid"
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) onNext();
    if (distance < -minSwipeDistance) onPrevious();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-white font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("slider")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "slider"
                ? "bg-white text-gray-900"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Slider view"
          >
            <Images className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-white text-gray-900"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Grid view"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === "slider" ? (
        /* Slider View */
        <div className="h-full flex items-center justify-center pt-16 pb-24">
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={onPrevious}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-full transition-all backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              <button
                onClick={onNext}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-full transition-all backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div
            className="relative max-w-6xl max-h-[75vh] w-full mx-4"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`${spaTitle} - Image ${currentIndex + 1}`}
              className="w-full h-full max-h-[75vh] object-contain"
            />
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 px-4 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setIndex(index)}
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? "border-white ring-2 ring-white/50 scale-110"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="h-full overflow-y-auto pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-lg group"
                  onClick={() => {
                    setIndex(index);
                    setViewMode("slider");
                  }}
                >
                  <img
                    src={image}
                    alt={`${spaTitle} - Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GallerySlider({
  images,
  spaTitle,
  initialIndex = 0,
  disableFullscreen = false,
  autoPlay = true,
  autoPlayInterval = 4000,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Auto-scroll the gallery
  useEffect(() => {
    if (!autoPlay || isPaused || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 2; // pixels per frame

    const scroll = () => {
      if (container) {
        container.scrollLeft += scrollAmount;

        // Reset scroll when reaching the end (for infinite loop effect)
        if (
          container.scrollLeft >=
          container.scrollWidth - container.clientWidth
        ) {
          container.scrollLeft = 0;
        }
      }
    };

    autoScrollRef.current = setInterval(scroll, 30);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [autoPlay, isPaused]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === "ArrowLeft") {
          setFullscreenIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          );
        } else if (e.key === "ArrowRight") {
          setFullscreenIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
          );
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
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
            className="w-full h-64 sm:h-80 lg:h-[450px] object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => openFullscreen(0)}
          />
          {!disableFullscreen && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          )}
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

  // Grid layout for multiple images
  return (
    <>
      <div
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Buttons */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Scrollable Gallery Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Duplicate images for seamless infinite scroll */}
          {[...images, ...images].map((image, index) => {
            const actualIndex = index % images.length;
            // Determine size classes for visual variety
            const sizeVariants = [
              "w-[280px] sm:w-[320px] h-[200px] sm:h-[240px]", // medium
              "w-[200px] sm:w-[240px] h-[200px] sm:h-[240px]", // small square
              "w-[320px] sm:w-[380px] h-[200px] sm:h-[240px]", // large
              "w-[240px] sm:w-[280px] h-[200px] sm:h-[240px]", // medium-small
              "w-[300px] sm:w-[350px] h-[200px] sm:h-[240px]", // medium-large
            ];
            const sizeClass = sizeVariants[actualIndex % sizeVariants.length];

            return (
              <div
                key={`${actualIndex}-${index}`}
                className={`flex-shrink-0 ${sizeClass} relative rounded-xl overflow-hidden shadow-lg cursor-pointer group/item`}
                onClick={() => openFullscreen(actualIndex)}
              >
                <img
                  src={image}
                  alt={`${spaTitle} - Image ${actualIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white drop-shadow-lg transform scale-75 group-hover/item:scale-100 transition-transform duration-300" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm font-medium truncate">
                      {actualIndex + 1} / {images.length}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gradient Edges */}
        <div className="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
      </div>

      {/* Thumbnail Preview Row */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openFullscreen(index)}
            className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Image Count Badge */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {images.length} {images.length === 1 ? "photo" : "photos"} • Click to
          view full size
        </p>
        {autoPlay && (
          <p className="text-xs text-gray-400">
            {isPaused ? "Paused" : "Auto-scrolling"}
          </p>
        )}
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
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close fullscreen"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-3 rounded-full transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-3 rounded-full transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div
        className="relative max-w-7xl max-h-[85vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`${spaTitle} - Image ${currentIndex + 1}`}
          className="w-full h-full max-h-[85vh] object-contain rounded-lg"
        />
      </div>

      {/* Image Counter */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 px-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(index);
              }}
              className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-white ring-2 ring-white/50 scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
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
  );
}

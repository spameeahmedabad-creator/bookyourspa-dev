"use client";

import { useState, useEffect, useRef } from "react";
import { CldUploadButton } from "next-cloudinary";
import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";
import { Upload, X, CheckCircle2, Loader2, Images } from "lucide-react";

export default function CloudinaryMultiUpload({
  onUpload,
  values = [],
  buttonText = "Upload Images",
  showPreview = true,
  sources = ["local"],
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadCount, setUploadCount] = useState(0);

  // Use ref to accumulate URLs during batch upload (to handle closure issue)
  const pendingUrlsRef = useRef([]);
  const valuesRef = useRef(values);

  // Keep valuesRef in sync with values prop
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // Create options object with sources array and allow multiple uploads
  const uploadOptions = {
    sources: sources,
    multiple: true,
    maxFiles: 10,
  };

  // Function to restore body scroll
  const restoreBodyScroll = () => {
    if (document.body) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.height = "";
      document.body.style.width = "";
    }
    if (document.documentElement) {
      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
    }
  };

  // Monitor for Cloudinary widget close and restore scroll
  useEffect(() => {
    const checkAndRestoreScroll = () => {
      const cloudinaryWidget =
        document.querySelector("[data-cloudinary-widget]") ||
        document.querySelector(".cloudinary-widget") ||
        document.querySelector('[id*="cloudinary"]') ||
        document.querySelector('iframe[src*="cloudinary"]');

      if (!cloudinaryWidget) {
        if (
          document.body.style.overflow === "hidden" ||
          document.documentElement.style.overflow === "hidden" ||
          document.body.style.position === "fixed"
        ) {
          restoreBodyScroll();
        }
      }
    };

    const checkInterval = setInterval(checkAndRestoreScroll, 100);

    const handleFocus = () => {
      setTimeout(checkAndRestoreScroll, 200);
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("click", checkAndRestoreScroll);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("click", checkAndRestoreScroll);
      restoreBodyScroll();
    };
  }, []);

  const handleUpload = (result) => {
    setUploadStatus("uploading");

    if (result?.info?.secure_url) {
      setUploadStatus("success");
      setUploadCount((prev) => prev + 1);

      // Add the new image URL to pending uploads
      const newUrl = result.info.secure_url;
      pendingUrlsRef.current = [...pendingUrlsRef.current, newUrl];

      setTimeout(() => {
        restoreBodyScroll();
      }, 100);

      setTimeout(() => {
        setUploadStatus(null);
        setUploadCount(0);
      }, 3000);
    } else if (result?.error) {
      setUploadStatus("error");

      setTimeout(() => {
        restoreBodyScroll();
      }, 100);

      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  // Called when all uploads in the queue are complete
  const handleQueuesEnd = () => {
    if (pendingUrlsRef.current.length > 0) {
      // Merge pending URLs with existing values
      const existingUrls = valuesRef.current.filter(
        (v) => v && v.trim() !== ""
      );
      const updatedValues = [...existingUrls, ...pendingUrlsRef.current];
      onUpload(updatedValues);

      // Clear pending URLs
      pendingUrlsRef.current = [];
    }

    setTimeout(() => {
      restoreBodyScroll();
    }, 100);
  };

  const handleRemove = (indexToRemove) => {
    const updatedValues = values.filter((_, index) => index !== indexToRemove);
    onUpload(updatedValues.length > 0 ? updatedValues : [""]);
  };

  const handleRemoveAll = () => {
    onUpload([""]);
  };

  // Extract public_id from Cloudinary URL for CldImage
  const getPublicId = (url) => {
    if (!url) return null;
    const trimmedUrl = url.trim();

    if (
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")
    ) {
      return trimmedUrl;
    }

    if (trimmedUrl.includes("cloudinary.com")) {
      const match = trimmedUrl.match(/\/upload\/[^\/]+\/(.+?)(?:\.[^.]+)?$/);
      if (match) {
        return match[1];
      }
      const uploadMatch = trimmedUrl.match(/\/upload\/[^\/]+\/(.+)$/);
      return uploadMatch ? uploadMatch[1] : null;
    }

    return null;
  };

  const validImages = values.filter((v) => v && v.trim() !== "");
  const hasImages = validImages.length > 0;

  if (!cloudName) {
    return (
      <div className="p-4 border border-red-300 rounded-md bg-red-50">
        <p className="text-red-600 text-sm font-medium">
          Cloudinary Configuration Error
        </p>
        <p className="text-red-500 text-xs mt-1">
          Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local file
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="space-y-2">
        <CldUploadButton
          uploadPreset="bookyourspa_uploads"
          onSuccess={handleUpload}
          onQueuesEnd={handleQueuesEnd}
          config={{ cloudName }}
          options={uploadOptions}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "bg-emerald-600 text-white hover:bg-emerald-700",
            "h-10 px-4 py-2",
            "w-full",
            uploadStatus === "uploading" &&
              "disabled:pointer-events-none disabled:opacity-50"
          )}
          disabled={uploadStatus === "uploading"}
        >
          {uploadStatus === "uploading" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Images className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </CldUploadButton>

        <p className="text-gray-500 text-xs text-center">
          You can select multiple images at once (up to 10)
        </p>

        {uploadStatus === "uploading" && (
          <p className="text-blue-600 text-xs flex items-center justify-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading images...
          </p>
        )}
        {uploadStatus === "success" && (
          <p className="text-green-600 text-xs font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {uploadCount > 1
              ? `${uploadCount} images uploaded!`
              : "Image uploaded successfully!"}
          </p>
        )}
        {uploadStatus === "error" && (
          <p className="text-red-600 text-xs text-center">
            Upload failed. Please try again.
          </p>
        )}
      </div>

      {/* Image Previews Grid */}
      {hasImages && showPreview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Uploaded Images ({validImages.length})
            </p>
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={handleRemoveAll}
                className="text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                Remove All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {validImages.map((url, index) => {
              const publicId = getPublicId(url);
              return (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {publicId && url.startsWith("http") ? (
                      <CldImage
                        src={publicId}
                        width="200"
                        height="200"
                        alt={`Gallery image ${index + 1}`}
                        config={{ cloudName }}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback =
                            e.target.parentElement.querySelector(
                              ".fallback-img"
                            );
                          if (fallback) fallback.style.display = "block";
                        }}
                      />
                    ) : null}
                    <img
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      className={`w-full h-full object-cover fallback-img ${
                        publicId && url.startsWith("http") ? "hidden" : ""
                      }`}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Image number badge */}
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* URL List (shown when showPreview is false or always at bottom) */}
      {hasImages && (
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            Gallery Images Cloudinary URLs ({validImages.length}):
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {validImages.map((url, index) => (
              <div
                key={index}
                className="bg-white p-2 rounded border border-blue-100 flex items-start gap-2"
              >
                <span className="text-xs font-medium text-gray-500 shrink-0">
                  {index + 1}.
                </span>
                <p className="text-xs text-blue-700 break-all font-mono flex-1">
                  {url}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700 shrink-0"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

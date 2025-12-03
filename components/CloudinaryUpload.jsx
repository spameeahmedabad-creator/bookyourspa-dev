"use client";

import { useState, useEffect } from "react";
import { CldUploadButton } from "next-cloudinary";
import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";
import { Upload, X, CheckCircle2, Loader2 } from "lucide-react";

export default function CloudinaryUpload({
  onUpload,
  value,
  buttonText = "Upload Image",
  showPreview = true,
  sources = ["local"], // Only show "My Files" by default
}) {
  // Get cloud name from environment variable (must be NEXT_PUBLIC_* for client-side access)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'

  // Function to restore body scroll
  const restoreBodyScroll = () => {
    // Remove any inline styles that might prevent scrolling
    if (document.body) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.height = "";
      document.body.style.width = "";
    }
    // Also check html element
    if (document.documentElement) {
      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
    }
  };

  // Monitor for Cloudinary widget close and restore scroll
  useEffect(() => {
    // Function to check and restore scroll
    const checkAndRestoreScroll = () => {
      // Check if Cloudinary widget is still open by looking for its elements
      const cloudinaryWidget =
        document.querySelector("[data-cloudinary-widget]") ||
        document.querySelector(".cloudinary-widget") ||
        document.querySelector('[id*="cloudinary"]') ||
        document.querySelector('iframe[src*="cloudinary"]');

      // If widget is not visible and body is locked, restore scroll
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

    // Set up interval to check and restore scroll after upload
    const checkInterval = setInterval(checkAndRestoreScroll, 100);

    // Also listen for focus events (widget closing often triggers focus)
    const handleFocus = () => {
      setTimeout(checkAndRestoreScroll, 200);
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("click", checkAndRestoreScroll);

    // Cleanup on unmount
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("click", checkAndRestoreScroll);
      // Ensure scroll is restored on unmount
      restoreBodyScroll();
    };
  }, []);

  const handleUpload = (result) => {
    setUploadStatus("uploading");

    if (result?.info?.secure_url) {
      setUploadStatus("success");
      onUpload(result.info.secure_url);

      // Restore scroll immediately after upload completes
      setTimeout(() => {
        restoreBodyScroll();
      }, 100);

      // Reset status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
    } else if (result?.error) {
      setUploadStatus("error");

      // Restore scroll even on error
      setTimeout(() => {
        restoreBodyScroll();
      }, 100);

      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleRemove = () => {
    setUploadStatus(null);
    onUpload("");
  };

  // Extract public_id from Cloudinary URL for CldImage
  // Also handles cases where value is already a public_id
  const getPublicId = (url) => {
    if (!url) return null;
    const trimmedUrl = url.trim();

    // If it's already a public_id (no http/https protocol)
    // Public IDs are typically simple strings without protocol
    if (
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")
    ) {
      // It's likely already a public_id - return it directly
      // CldImage can handle public_ids directly
      return trimmedUrl;
    }

    // If it's a Cloudinary URL, extract the public_id
    if (trimmedUrl.includes("cloudinary.com")) {
      // Extract public_id from URL like: https://res.cloudinary.com/cloud_name/image/upload/v1234567/public_id.jpg
      // or: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
      const match = trimmedUrl.match(/\/upload\/[^\/]+\/(.+?)(?:\.[^.]+)?$/);
      if (match) {
        return match[1];
      }
      // If extraction fails, try to get everything after /upload/
      const uploadMatch = trimmedUrl.match(/\/upload\/[^\/]+\/(.+)$/);
      return uploadMatch ? uploadMatch[1] : null;
    }

    // If it's a regular URL (not Cloudinary), return null to use regular img tag
    return null;
  };

  const publicId = getPublicId(value);
  const hasImage = value && value.trim() !== "";

  return (
    <div className="space-y-2">
      {hasImage && showPreview ? (
        <div className="space-y-2">
          {/* Image Preview - Only show if showPreview is true */}
          <div className="relative inline-block">
            {publicId && cloudName && value.startsWith("http") ? (
              // Only use CldImage for full Cloudinary URLs
              <CldImage
                src={publicId}
                width="300"
                height="200"
                alt="Upload preview"
                config={{ cloudName }}
                className="max-w-full h-32 object-cover rounded-md border border-gray-300 bg-gray-50"
                onError={(e) => {
                  // Fallback to regular img if CldImage fails
                  e.target.style.display = "none";
                  const fallback =
                    e.target.parentElement.querySelector(".fallback-img");
                  if (fallback) fallback.style.display = "block";
                }}
              />
            ) : null}
            {/* Fallback img tag - always render but hidden if CldImage is used */}
            <img
              src={value}
              alt="Upload preview"
              className={`max-w-full h-32 object-cover rounded-md border border-gray-300 bg-gray-50 fallback-img ${
                publicId && cloudName && value.startsWith("http")
                  ? "hidden"
                  : ""
              }`}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 z-10 shadow-md"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Upload Status Indicator */}
            {uploadStatus === "uploading" && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                <div className="bg-white rounded-full p-2">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              </div>
            )}
            {uploadStatus === "success" && (
              <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1.5 z-10 shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Status Message and URL */}
          <div className="space-y-1">
            {uploadStatus === "success" && (
              <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Image uploaded successfully!
              </p>
            )}
            {uploadStatus === "error" && (
              <p className="text-red-600 text-xs font-medium">
                Upload failed. Please try again.
              </p>
            )}
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Image URL:
              </p>
              <p className="text-xs text-gray-500 truncate font-mono">
                {value}
              </p>
            </div>
          </div>

          {/* Change Image Button */}
          {cloudName ? (
            <CldUploadButton
              uploadPreset="bookyourspa_uploads"
              onSuccess={handleUpload}
              config={{ cloudName }}
              options={sources}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                "h-9 rounded-md px-3",
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
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </>
              )}
            </CldUploadButton>
          ) : (
            <p className="text-red-500 text-xs">
              Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment
              variables
            </p>
          )}
        </div>
      ) : cloudName ? (
        <div className="space-y-2">
          <CldUploadButton
            uploadPreset="bookyourspa_uploads"
            onSuccess={handleUpload}
            config={{ cloudName }}
            options={sources}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
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
                <Upload className="w-4 h-4 mr-2" />
                {buttonText}
              </>
            )}
          </CldUploadButton>
          {uploadStatus === "uploading" && (
            <p className="text-blue-600 text-xs flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading image...
            </p>
          )}
          {uploadStatus === "error" && (
            <p className="text-red-600 text-xs">
              Upload failed. Please try again.
            </p>
          )}
          {/* Always show URL section even when no image */}
          {value && (
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Cloudinary URL:
              </p>
              <p className="text-xs text-gray-500 break-all font-mono">
                {value}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-red-600 text-sm font-medium">
            Cloudinary Configuration Error
          </p>
          <p className="text-red-500 text-xs mt-1">
            Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local file
          </p>
        </div>
      )}
    </div>
  );
}

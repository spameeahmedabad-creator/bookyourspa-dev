"use client";

import { useState } from "react";
import { CldUploadButton } from "next-cloudinary";
import { CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle2, Loader2 } from "lucide-react";

export default function CloudinaryUpload({
  onUpload,
  value,
  buttonText = "Upload Image",
}) {
  // Get cloud name from environment variable (must be NEXT_PUBLIC_* for client-side access)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'

  const handleUpload = (result) => {
    setUploadStatus("uploading");

    if (result?.info?.secure_url) {
      setUploadStatus("success");
      onUpload(result.info.secure_url);
      // Reset status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
    } else if (result?.error) {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleRemove = () => {
    setUploadStatus(null);
    onUpload("");
  };

  // Extract public_id from Cloudinary URL for CldImage
  const getPublicId = (url) => {
    if (!url) return null;
    if (!url.startsWith("http") || !url.includes("cloudinary.com")) return null;
    // Extract public_id from URL like: https://res.cloudinary.com/cloud_name/image/upload/v1234567/public_id.jpg
    const match = url.match(/\/upload\/[^\/]+\/(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  };

  const publicId = getPublicId(value);
  const hasImage = value && value.trim() !== "";

  return (
    <div className="space-y-2">
      {hasImage ? (
        <div className="space-y-2">
          {/* Image Preview */}
          <div className="relative inline-block">
            {publicId && cloudName ? (
              <CldImage
                src={publicId}
                width="300"
                height="200"
                alt="Upload preview"
                className="max-w-full h-32 object-cover rounded-md border border-gray-300 bg-gray-50"
              />
            ) : (
              <img
                src={value}
                alt="Upload preview"
                className="max-w-full h-32 object-cover rounded-md border border-gray-300 bg-gray-50"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
            )}
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
              onUpload={handleUpload}
              cloudName={cloudName}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadStatus === "uploading"}
                className="w-full"
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
              </Button>
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
            onUpload={handleUpload}
            cloudName={cloudName}
          >
            <Button
              type="button"
              variant="outline"
              className="w-full"
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
            </Button>
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

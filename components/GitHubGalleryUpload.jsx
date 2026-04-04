"use client";

import { useRef, useState } from "react";
import { Images, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GitHubGalleryUpload({
  values = [],
  onUpload,
  folder = "uploads",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [imgErrors, setImgErrors] = useState({});

  const validImages = values.filter((v) => v && v.trim() !== "");

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError("");
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    const uploadedUrls = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload/github", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(
            `Failed to upload "${file.name}": ${data.error || "Unknown error"}`,
          );
        } else {
          uploadedUrls.push(data.url);
        }
      } catch (err) {
        setError(`Failed to upload "${file.name}". Check your connection.`);
      }

      setUploadProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    // Merge new URLs with existing ones
    const existing = values.filter((v) => v && v.trim() !== "");
    const merged = [...existing, ...uploadedUrls];
    onUpload(merged.length > 0 ? merged : [""]);

    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });

    // Reset file input
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index) => {
    const updated = validImages.filter((_, i) => i !== index);
    onUpload(updated.length > 0 ? updated : [""]);
    setImgErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleImgError = (index) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="space-y-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="hidden"
          id={`github-gallery-upload-${folder}`}
        />
        <Button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading {uploadProgress.done}/{uploadProgress.total}...
            </>
          ) : (
            <>
              <Images className="w-4 h-4 mr-2" />
              {validImages.length > 0
                ? "Add More Images"
                : "Upload Gallery Images"}
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          You can select multiple images at once
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </p>
      )}

      {/* Image Grid */}
      {validImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Gallery ({validImages.length} image
              {validImages.length !== 1 ? "s" : ""})
            </p>
            <button
              type="button"
              onClick={() => onUpload([""])}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              Remove All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {validImages.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {!imgErrors[index] ? (
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImgError(index)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center px-1">
                        Failed to load
                      </p>
                    </div>
                  )}
                </div>

                {/* Remove button - visible on hover */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Index badge */}
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

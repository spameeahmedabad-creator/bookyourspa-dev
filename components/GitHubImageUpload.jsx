"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GitHubImageUpload({
  value = "",
  onUpload,
  folder = "uploads",
  label = "Upload Image",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  const hasImage = value && value.trim() !== "";

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset
    setError("");
    setImgError(false);
    setUploading(true);

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
        setError(data.error || "Upload failed");
        return;
      }

      onUpload(data.url);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    onUpload("");
    setError("");
    setImgError(false);
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={`github-upload-${folder}`}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading to GitHub...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {hasImage ? "Change Image" : label}
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Preview */}
      {hasImage && (
        <div className="space-y-2">
          <div className="relative inline-block">
            {!imgError ? (
              <img
                src={value}
                alt="Preview"
                className="h-32 w-auto object-cover rounded-lg border border-gray-200"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="h-32 w-48 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-400 text-center px-2">
                  Could not load image
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
            {!imgError && (
              <div className="absolute bottom-1 left-1 bg-black/60 text-white rounded px-1.5 py-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-xs">Uploaded</span>
              </div>
            )}
          </div>

          {/* URL */}
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <p className="text-xs text-gray-500 break-all font-mono">{value}</p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface AvatarUploadProps {
  currentImage: string | null;
  name: string | null;
  email: string | null;
  onUploadComplete: () => void;
}

export function AvatarUpload({
  currentImage,
  name,
  email,
  onUploadComplete,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "?";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file);

      // Validate Cloudinary response before using
      if (!result || !result.secure_url) {
        throw new Error("Upload failed: Invalid response from image service");
      }

      // Save URL to database
      const response = await fetch("/api/profile/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: result.secure_url }),
      });

      if (!response.ok) {
        throw new Error("Failed to save avatar");
      }

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove avatar");
      }

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {currentImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImage}
              alt={name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-medium text-gray-500 dark:text-gray-400">
              {initials}
            </span>
          )}
        </div>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <svg
              className="animate-spin h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="sr-only"
            />
            Change avatar
          </label>
          {currentImage && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, GIF up to 5MB
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}

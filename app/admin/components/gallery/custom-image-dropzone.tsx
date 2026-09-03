"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, ImagePlus } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";

interface CustomImageDropzoneProps {
  images: string[];
  onImagesChange: (newImages: string[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
}

export function CustomImageDropzone({
  images,
  onImagesChange,
  onError,
  maxFiles = 10,
}: CustomImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize UploadThing hook
  const { startUpload, isUploading } = useUploadThing("galleryImageUploader", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res) => {
      if (res) {
        const uploadedUrls = res.map((item) => item.url);
        onImagesChange([...images, ...uploadedUrls]);
      }
      setUploadProgress(0);
    },
    onUploadError: (error) => {
      if (onError) onError(error.message);
      setUploadProgress(0);
    },
  });

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (images.length + fileArray.length > maxFiles) {
      if (onError) onError(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    // Filter non-image files
    const validImages = fileArray.filter((file) =>
      file.type.startsWith("image/"),
    );
    if (validImages.length === 0) {
      if (onError) onError("Please upload valid image files (JPG, PNG, WEBP).");
      return;
    }

    // Trigger UploadThing upload
    startUpload(validImages);
  };

  // Drag and Drop Events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onImagesChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/10 scale-[0.99]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium">
              Uploading images... {uploadProgress}%
            </p>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-3 bg-muted rounded-full border">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-primary">
                Click to upload
              </span>{" "}
              or drag and drop
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 4MB each (Max {maxFiles} images)
            </p>
          </div>
        )}
      </div>

      {/* Image Thumbnails Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted shadow-sm"
            >
              <Image
                src={url}
                alt={`Uploaded item ${idx + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

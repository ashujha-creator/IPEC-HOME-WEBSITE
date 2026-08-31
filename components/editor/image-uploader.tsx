"use client";

import React from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogImage } from "@/lib/vaildation/blog";

interface ImageUploaderProps {
  value: BlogImage[];
  onChange: (images: BlogImage[]) => void;
  maxFiles?: number;
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles = 10,
}: ImageUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = maxFiles - value.length;
    const filesToAdd = files.slice(0, Math.max(remainingSlots, 0));

    const newImages: BlogImage[] = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      altText: "",
      caption: "",
    }));

    onChange([...value, ...newImages]);

    // Allow selecting the same file again after removal.
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    const target = value.find((img) => img.id === id);
    if (target?.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
    }
    onChange(value.filter((img) => img.id !== id));
  };

  const updateMetadata = (
    id: string,
    field: "altText" | "caption",
    text: string,
  ) => {
    const updated = value.map((img) =>
      img.id === id ? { ...img, [field]: text } : img,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center cursor-pointer space-y-2"
        >
          <div className="p-3 bg-background rounded-full shadow-sm border">
            <ImagePlus className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium">
            <span className="text-primary font-semibold">Click to upload</span>{" "}
            or drag and drop
          </div>
          <p className="text-xs text-muted-foreground">
            SVG, PNG, JPG, or WEBP (up to {maxFiles} images)
          </p>
          <input
            id="image-upload-input"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={handleFileChange}
            disabled={value.length >= maxFiles}
          />
        </label>
      </div>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {value.map((img, index) => (
            <div
              key={img.id}
              className="group relative border rounded-lg overflow-hidden bg-background shadow-sm space-y-2 p-2"
            >
              <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                <img
                  src={img.url}
                  alt={img.altText || `Upload ${index + 1}`}
                  className="object-cover w-full h-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(img.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Optional Metadata Controls per Image */}
              <div className="space-y-2 pt-1">
                <Input
                  placeholder="Alt text (for accessibility)"
                  value={img.altText || ""}
                  onChange={(e) =>
                    updateMetadata(img.id, "altText", e.target.value)
                  }
                  className="text-xs h-8"
                />
                <Input
                  placeholder="Caption (optional)"
                  value={img.caption || ""}
                  onChange={(e) =>
                    updateMetadata(img.id, "caption", e.target.value)
                  }
                  className="text-xs h-8"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

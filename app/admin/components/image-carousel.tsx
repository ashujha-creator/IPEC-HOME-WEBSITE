"use client";

import React, { useId, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  onRemoveImage?: (index: number) => void;
  className?: string;
}

export function ImageCarousel({
  images,
  onRemoveImage,
  className = "",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselId = useId();

  if (images.length === 0) {
    return (
      <div
        className={`flex h-48 flex-col items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground ${className}`}
        role="status"
        aria-label="No images uploaded"
      >
        <ImageIcon className="mb-2 h-10 w-10 opacity-50" aria-hidden="true" />
        <p className="text-sm">No images uploaded yet.</p>
      </div>
    );
  }

  /*
   * Don't use an effect to synchronize currentIndex with images.
   *
   * If the parent removes an image and currentIndex is now out of bounds,
   * simply derive a safe index during render.
   */
  const safeIndex = Math.min(currentIndex, images.length - 1);
  const currentImage = images[safeIndex];

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const index = Math.min(prev, images.length - 1);
      return index === 0 ? images.length - 1 : index - 1;
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const index = Math.min(prev, images.length - 1);
      return index === images.length - 1 ? 0 : index + 1;
    });
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const handleRemove = () => {
    if (!onRemoveImage) return;

    const removedIndex = safeIndex;

    /*
     * Tell the parent to remove the current image.
     * The parent remains the source of truth for `images`.
     */
    onRemoveImage(removedIndex);

    /*
     * Keep the local selection sensible.
     *
     * The actual bounds are still derived from `images` during render,
     * so this does not depend on an effect.
     */
    setCurrentIndex((prev) => {
      if (images.length <= 1) {
        return 0;
      }

      if (removedIndex === images.length - 1) {
        return Math.max(0, prev - 1);
      }

      return prev;
    });
  };

  return (
    <div
      id={carouselId}
      className={`relative w-full overflow-hidden rounded-lg border bg-black/5 ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
    >
      {/* Active Image */}
      <div
        id={`${carouselId}-image`}
        className="relative h-56 w-full sm:h-64"
        aria-live="polite"
        aria-atomic="true"
      >
        <Image
          key={currentImage}
          src={currentImage}
          alt={`Image ${safeIndex + 1} of ${images.length}`}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
          priority={safeIndex === 0}
          draggable={false}
        />

        {/* Remove Button */}
        {onRemoveImage && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full shadow-md opacity-90 transition-opacity hover:opacity-100 focus-visible:opacity-100"
            aria-label={`Remove image ${safeIndex + 1}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 text-foreground shadow-md hover:bg-background/90 focus-visible:ring-2"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 text-foreground shadow-md hover:bg-background/90 focus-visible:ring-2"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        )}
      </div>

      {/* Indicator Dots */}
      {images.length > 1 && (
        <div
          className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/60 px-2 py-1 backdrop-blur-sm"
          role="tablist"
          aria-label="Select image"
        >
          {images.map((_, index) => {
            const isActive = safeIndex === index;

            return (
              <button
                key={`${carouselId}-indicator-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to image ${index + 1}`}
                aria-controls={`${carouselId}-image`}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isActive
                    ? "w-4 bg-primary"
                    : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground/80"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

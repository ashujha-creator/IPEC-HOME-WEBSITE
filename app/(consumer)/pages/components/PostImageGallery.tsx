/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";

type PostImageGalleryProps = {
  images: string[];
  title: string;
  autoPlayInterval?: number;
};

export function PostImageGallery({
  images,
  title,
  autoPlayInterval = 5000,
}: PostImageGalleryProps) {
  const validImages = images.filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  if (validImages.length === 0) {
    return null;
  }

  const hasMultipleImages = validImages.length > 1;

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % validImages.length);
  };

  const previousSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + validImages.length) % validImages.length,
    );
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (!hasMultipleImages || isPaused) {
      return;
    }

    const timer = window.setInterval(nextSlide, autoPlayInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeIndex, autoPlayInterval, hasMultipleImages, isPaused]);

  return (
    <section
      aria-label={`${title} images`}
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_20px_70px_-30px_rgba(0,0,0,0.25)] sm:rounded-3xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Images */}
        <div className="relative aspect-[16/9] w-full sm:aspect-[2/1]">
          {validImages.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={image}
              alt={
                validImages.length > 1
                  ? `${title} — image ${index + 1} of ${validImages.length}`
                  : title
              }
              loading={index === 0 ? "eager" : "lazy"}
              className={[
                "absolute inset-0 h-full w-full object-cover",
                "transition-opacity duration-700 ease-out",
                index === activeIndex
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              ].join(" ")}
              draggable={false}
            />
          ))}
        </div>

        {hasMultipleImages && (
          <>
            {/* Previous */}
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 sm:left-6 sm:h-11 sm:w-11"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15 18-6-6 6-6"
                />
              </svg>
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next image"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 sm:right-6 sm:h-11 sm:w-11"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </button>

            {/* Slide counter */}
            <div className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:right-6 sm:top-6">
              {activeIndex + 1} / {validImages.length}
            </div>

            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-2 backdrop-blur-md">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={[
                    "h-1.5 rounded-full transition-all duration-300",
                    index === activeIndex
                      ? "w-7 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

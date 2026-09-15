/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  Trash2,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ImageOff,
  X,
  Layers,
} from "lucide-react";

import { deleteGalleryItem } from "@/app/actions/gallery-delete";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface GalleryItemData {
  id: string;
  title: string;
  image: string[];
  video?: string | null;
  description?: string | null;
  authorId: string;
  createdAt: Date | string;
  author: {
    name?: string | null;
    image?: string | null;
  };
}

function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

/* -------------------------------------------------------------------------- */
/* Masonry tile — sizes itself to the image's real aspect ratio so nothing    */
/* gets cropped into a forced square, which is what made the old grid look    */
/* wrong for portrait/landscape mixes.                                        */
/* -------------------------------------------------------------------------- */

function MasonryImage({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className="mb-3 flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 break-inside-avoid rounded-xl border bg-muted text-muted-foreground"
        aria-label={`${alt} failed to load`}
      >
        <ImageOff className="h-5 w-5" />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${alt} full size`}
      className="group/tile relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl border bg-muted text-left shadow-sm transition-shadow duration-300 hover:shadow-md"
      style={{ aspectRatio: ratio ?? 4 / 5 }}
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}

      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover transition-all duration-300 group-hover/tile:scale-[1.03] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) {
            setRatio(img.naturalWidth / img.naturalHeight);
          }
          setLoaded(true);
        }}
        onError={() => setErrored(true)}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover/tile:bg-black/25 group-hover/tile:opacity-100">
        <span className="rounded-full bg-white/90 p-2 shadow-sm">
          <Maximize2 className="h-4 w-4 text-black" />
        </span>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Lightbox — navigates every image in the item that was clicked, not just    */
/* the one tile. object-contain inside a fixed viewport box means any aspect  */
/* ratio displays correctly without needing to know dimensions up front.      */
/* -------------------------------------------------------------------------- */

function Lightbox({
  images,
  initialIndex,
  title,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const goNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) goPrev();
      if (e.key === "ArrowRight" && images.length > 1) goNext();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [goPrev, goNext, images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/90"
      >
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/90"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/90"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div
        className="relative h-[85vh] w-[90vw] max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`${title} photo ${index + 1}`}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery section — one post                                                 */
/* -------------------------------------------------------------------------- */

export function GallerySection({
  item,
  currentUserId,
  onItemDeleted,
  onImageClick,
}: {
  item: GalleryItemData;
  currentUserId?: string;
  onItemDeleted?: (id: string) => void;
  onImageClick?: (images: string[], index: number, title: string) => void;
}) {
  const [isDeleting, startDeleteTransition] = useTransition();

  const youtubeEmbedUrl = getYoutubeEmbedUrl(item.video);
  const isOwner = currentUserId === item.authorId;

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this gallery item? This action will also delete all uploaded images from storage.",
      )
    ) {
      return;
    }

    startDeleteTransition(async () => {
      const res = await deleteGalleryItem(item.id);
      if (!res.success) {
        alert(res.error || "Failed to delete item.");
        return;
      }
      onItemDeleted?.(item.id);
    });
  };

  return (
    <article className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: title, description & delete action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {item.title}
          </h2>

          {item.description && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 border">
                <AvatarImage src={item.author?.image || undefined} />
                <AvatarFallback className="text-[10px]">
                  {item.author?.name
                    ? item.author.name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {item.author?.name || "User"}
              </span>
            </div>

            <span>•</span>

            <div className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>

            {item.image.length > 1 && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  <span>{item.image.length} photos</span>
                </div>
              </>
            )}
          </div>
        </div>

        {isOwner && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="self-start gap-1.5"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Delete</span>
          </Button>
        )}
      </div>

      {/* Pinterest-style masonry: CSS columns + per-image aspect ratio, so
          portrait and landscape shots sit at their natural size instead of
          being cropped into uniform squares. */}
      {item.image.length > 0 && (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {item.image.map((imgUrl, idx) => (
            <MasonryImage
              key={`${item.id}-img-${idx}`}
              src={imgUrl}
              alt={`${item.title} photo ${idx + 1}`}
              onOpen={() => onImageClick?.(item.image, idx, item.title)}
            />
          ))}
        </div>
      )}

      {youtubeEmbedUrl && (
        <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl border bg-black/5 shadow-sm">
          <iframe
            src={youtubeEmbedUrl}
            title={item.title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery grid — paginated feed of sections                                  */
/* -------------------------------------------------------------------------- */

export function GalleryGrid({
  items,
  currentUserId,
  itemsPerPage = 3,
}: {
  items: GalleryItemData[];
  currentUserId?: string;
  itemsPerPage?: number;
}) {
  const [galleryItems, setGalleryItems] = useState(items);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
    title: string;
  } | null>(null);

  // Keep in sync if the parent re-fetches and passes a new items array.
  useEffect(() => {
    setGalleryItems(items);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(galleryItems.length / itemsPerPage));

  // If a delete empties out the last page, step back instead of showing blank.
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleItemDeleted = useCallback((id: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  if (!galleryItems || galleryItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/10 py-20 text-center">
        <p className="text-muted-foreground">No gallery posts found.</p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = galleryItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {currentItems.map((item) => (
          <GallerySection
            key={item.id}
            item={item}
            currentUserId={currentUserId}
            onItemDeleted={handleItemDeleted}
            onImageClick={(images, index, title) =>
              setLightbox({ images, index, title })
            }
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, galleryItems.length)}
            </span>{" "}
            of <span className="font-medium">{galleryItems.length}</span>{" "}
            gallery entries
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="h-8 w-8 p-0 font-medium"
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

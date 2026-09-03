"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Trash2,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
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

export function GallerySection({
  item,
  currentUserId,
  onItemDeleted,
  onImageClick,
}: {
  item: GalleryItemData;
  currentUserId?: string;
  onItemDeleted?: (id: string) => void;
  onImageClick?: (url: string) => void;
}) {
  const [isDeleting, startDeleteTransition] = useTransition();

  const youtubeEmbedUrl = getYoutubeEmbedUrl(item.video);
  const isOwner = currentUserId === item.authorId;

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this gallery item? This action will also delete all uploaded images from storage.",
      )
    ) {
      startDeleteTransition(async () => {
        const res = await deleteGalleryItem(item.id);
        if (!res.success) {
          alert(res.error || "Failed to delete item.");
        } else if (onItemDeleted) {
          onItemDeleted(item.id);
        }
      });
    }
  };

  return (
    <article className="group space-y-6 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      {/* Top Header: Title, Description & Action */}
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

          {/* Metadata Bar */}
          <div className="flex items-center space-x-3 pt-2 text-xs text-muted-foreground">
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

        {/* Delete Trigger */}
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

      {/* Gallery Image Layout */}
      {item.image.length > 0 && (
        <div
          className={`grid gap-3 ${
            item.image.length === 1
              ? "grid-cols-1"
              : item.image.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          }`}
        >
          {item.image.map((imgUrl, idx) => (
            <div
              key={`${item.id}-img-${idx}`}
              onClick={() => onImageClick?.(imgUrl)}
              className="group/img relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border bg-muted shadow-sm transition-all hover:opacity-95 hover:ring-2 hover:ring-primary/50"
            >
              <Image
                src={imgUrl}
                alt={`${item.title} photo ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover/img:opacity-100">
                <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Video */}
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

export function GalleryGrid({
  items,
  currentUserId,
  itemsPerPage = 3,
}: {
  items: GalleryItemData[];
  currentUserId?: string;
  itemsPerPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-20 text-center bg-muted/10">
        <p className="text-muted-foreground">No gallery posts found.</p>
      </div>
    );
  }

  // Calculate pagination boundaries
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Gallery Feed */}
      <div className="space-y-6">
        {currentItems.map((item) => (
          <GallerySection
            key={item.id}
            item={item}
            currentUserId={currentUserId}
            onImageClick={(url) => setSelectedImage(url)}
          />
        ))}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, items.length)}
            </span>{" "}
            of <span className="font-medium">{items.length}</span> gallery
            entries
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

      {/* Fullscreen Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw] aspect-auto overflow-hidden rounded-xl">
            <Image
              src={selectedImage}
              alt="Enlarged view"
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

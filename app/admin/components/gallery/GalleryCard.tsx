"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface GalleryCardProps {
  item: {
    id: string;
    title: string;
    image: string[];
    video?: string | null;
    description?: string | null;
    createdAt: Date | string;
    author: {
      name?: string | null;
      image?: string | null;
    };
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

export function GalleryCard({ item }: GalleryCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(item.video);

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % item.image.length);
  };

  const prevImage = () => {
    setCurrentImageIdx(
      (prev) => (prev - 1 + item.image.length) % item.image.length,
    );
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="overflow-hidden border bg-card text-card-foreground">
      {/* Header: Author info & Date */}
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={item.author.image || undefined}
            alt={item.author.name || "User"}
          />
          <AvatarFallback>
            {item.author.name ? item.author.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">
            {item.author.name || "Anonymous"}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {formattedDate}
          </span>
        </div>
      </CardHeader>

      {/* Media Section: Images */}
      {item.image.length > 0 && (
        <div className="relative aspect-video w-full overflow-hidden bg-black/5">
          <Image
            src={item.image[currentImageIdx]}
            alt={`${item.title} image ${currentImageIdx + 1}`}
            fill
            className="object-cover transition-all duration-300"
          />

          {/* Navigation Controls for Multiple Images */}
          {item.image.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1.5">
                {item.image.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIdx
                        ? "w-4 bg-white"
                        : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Media Section: YouTube Video Embed */}
      {youtubeEmbedUrl && (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={youtubeEmbedUrl}
            title={`${item.title} video`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Card Details */}
      <CardContent className="p-4 space-y-2">
        <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
        {item.description && (
          <CardDescription className="text-sm text-muted-foreground whitespace-pre-wrap">
            {item.description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}

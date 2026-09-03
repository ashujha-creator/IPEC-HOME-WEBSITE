"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { X, Loader2, ImagePlus } from "lucide-react";
import { FaYoutube } from "react-icons/fa";

import { gallerySchema } from "@/lib/vaildation/gallery";
import { createGalleryItem } from "@/app/actions/gallery";
import { UploadDropzone } from "@/lib/uploadthing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomImageDropzone } from "./custom-image-dropzone";

function getYoutubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

export function GalleryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");

  // Validation / Error states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const youtubeEmbedUrl = getYoutubeEmbedUrl(videoUrl);

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const formData = {
      title,
      image: images,
      video: videoUrl || undefined,
      description: description || undefined,
    };

    // Client-side Zod validation check
    const validation = gallerySchema.safeParse(formData);

    if (!validation.success) {
      setFieldErrors(
        validation.error.flatten().fieldErrors as Record<string, string[]>,
      );
      return;
    }

    startTransition(async () => {
      const result = await createGalleryItem(validation.data);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors as Record<string, string[]>);
        } else {
          setServerError(result.error || "Failed to create gallery item.");
        }
        return;
      }

      // Reset form on success
      setTitle("");
      setImages([]);
      setVideoUrl("");
      setDescription("");

      if (onSuccess) onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {serverError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
          {serverError}
        </div>
      )}
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Enter gallery title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {fieldErrors.title && (
          <p className="text-xs text-red-500">{fieldErrors.title[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Images *</Label>

        <CustomImageDropzone
          images={images}
          onImagesChange={(newImages) => {
            setImages(newImages);
            setFieldErrors((prev) => ({ ...prev, image: [] }));
          }}
          onError={(err) => setServerError(err)}
          maxFiles={10}
        />

        {fieldErrors.image && (
          <p className="text-xs text-red-500">{fieldErrors.image[0]}</p>
        )}
      </div>
      {/* YouTube Link Field */}
      <div className="space-y-2">
        <Label htmlFor="video">YouTube Video Link (Optional)</Label>
        <Input
          id="video"
          placeholder="https://www.youtube.com/watch?v=..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        {fieldErrors.video && (
          <p className="text-xs text-red-500">{fieldErrors.video[0]}</p>
        )}

        {/* Live Video Embed Preview */}
        {youtubeEmbedUrl && (
          <div className="mt-3 aspect-video w-full rounded-lg overflow-hidden border bg-black">
            <iframe
              src={youtubeEmbedUrl}
              title="YouTube video preview"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Tell people more about this gallery post..."
          className="resize-y min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-500">{fieldErrors.description[0]}</p>
        )}
      </div>
      {/* Submit Button */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Gallery...
          </>
        ) : (
          "Publish Gallery"
        )}
      </Button>
    </form>
  );
}

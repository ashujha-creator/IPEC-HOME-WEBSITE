import { z } from "zod";

// Optional Youtube URL validator (supports standard, short, and embed URLs)
const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;

export const gallerySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters"),
  image: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  video: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || youtubeUrlRegex.test(val),
      "Please provide a valid YouTube URL",
    ),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
});

export type GalleryFormValues = z.infer<typeof gallerySchema>;

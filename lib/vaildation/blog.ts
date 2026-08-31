import * as z from "zod";

export const PageStatusEnum = z.enum(["DRAFT", "PUBLISHED"]);
export type PageStatus = z.infer<typeof PageStatusEnum>;

// A slug should be URL-safe: lowercase letters, numbers, hyphens only.
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens only",
  );

export const blogImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  file: z.instanceof(File).optional(),
  caption: z.string().optional(),
  altText: z.string().optional(),
});

export const blogFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters")
    .max(300, "Short description must be under 300 characters"),
  slug: slugSchema.optional().or(z.literal("")),
  content: z.string().default(""),
  images: z.array(blogImageSchema).default([]),
  status: PageStatusEnum.default("DRAFT"),
});

export type ActionState<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export type BlogImage = z.infer<typeof blogImageSchema>;
export type CreateBlogFormInput = z.input<typeof blogFormSchema>;
export type CreateBlogFormValues = z.infer<typeof blogFormSchema>;

// DTO payload schema passed over the Server Action boundary.
// Trusts nothing from the client except well-formed strings/urls —
// this is the schema actually validated inside the Server Action.
export const serverPagePayloadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().min(10).max(300),
  slug: slugSchema.optional(),
  content: z.string().default(""),
  images: z.array(z.string().url()).default([]), // String array matching Prisma String[]
  status: PageStatusEnum.default("DRAFT"),
});

export type ServerPagePayload = z.infer<typeof serverPagePayloadSchema>;
export type CreateServerPagePayload = z.input<typeof serverPagePayloadSchema>;

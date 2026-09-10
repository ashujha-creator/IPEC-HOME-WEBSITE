// lib/user-sites/schemas.ts
import { z } from "zod";
import {
  ALLOWED_EXTENSIONS_SET,
  BLOCKED_FILENAMES_SET,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_SIZE_BYTES,
  MAX_FILE_COUNT,
  getSafeContentType,
} from "./constants";
import { isValidSlug } from "./reserved-slugs";

// ---- path safety ----
// No leading slash requirement here — we normalize before validating.
const safePath = z
  .string()
  .min(1)
  .max(255)
  .transform((p) => p.replace(/^\/+/, "").trim())
  .refine((p) => p.length > 0, { message: "Path cannot be empty" })
  .refine((p) => !p.includes(".."), {
    message: "Path traversal is not allowed",
  })
  .refine((p) => !p.startsWith("/"), {
    message: "Absolute paths are not allowed",
  })
  .refine((p) => !/[<>:"|?*\x00-\x1f]/.test(p), {
    message: "Path contains illegal characters",
  })
  .refine(
    (p) => {
      const filename = p.split("/").pop() ?? "";
      return !BLOCKED_FILENAMES_SET.has(filename.toLowerCase());
    },
    { message: "This filename is not allowed" },
  );

const extensionOf = (path: string) =>
  path.split(".").pop()?.toLowerCase() ?? "";

// ---- a single file entry in the upload manifest ----
// NOTE: `contentType` is accepted from the client for shape validation
// only, then OVERWRITTEN server-side (and client-side, since this schema
// runs in both places) by getSafeContentType() derived from the path
// extension. Never trust a client-declared MIME type — it's used
// downstream for response headers.
export const siteFileSchema = z
  .object({
    path: safePath,
    contentType: z.string().min(1),
    size: z
      .number()
      .int()
      .positive()
      .max(MAX_FILE_SIZE_BYTES, {
        message: `File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit`,
      }),
    storageKey: z.string().min(1),
    storageUrl: z.string().url(),
    checksum: z.string().min(1),
  })
  .refine((f) => ALLOWED_EXTENSIONS_SET.has(extensionOf(f.path)), {
    message: "File type not allowed",
    path: ["path"],
  })
  .transform((f) => ({
    ...f,
    contentType: getSafeContentType(f.path),
  }));

// ---- full manifest submitted after upload ----
export const createSiteManifestSchema = z
  .object({
    slug: z
      .string()
      .min(3)
      .max(40)
      .transform((s) => s.toLowerCase())
      .refine(isValidSlug, { message: "Invalid or reserved slug" }),
    entryFile: z.string().default("index.html"),
    files: z
      .array(siteFileSchema)
      .min(1, "At least one file is required")
      .max(MAX_FILE_COUNT, `No more than ${MAX_FILE_COUNT} files allowed`),
  })
  .refine((data) => data.files.some((f) => f.path === data.entryFile), {
    message: "entryFile must match one of the uploaded files",
    path: ["entryFile"],
  })
  .refine((data) => data.files.some((f) => extensionOf(f.path) === "html"), {
    message: "At least one .html file is required",
    path: ["files"],
  })
  .refine(
    (data) => {
      const total = data.files.reduce((sum, f) => sum + f.size, 0);
      return total <= MAX_TOTAL_SIZE_BYTES;
    },
    {
      message: `Total upload exceeds ${MAX_TOTAL_SIZE_BYTES / 1024 / 1024}MB`,
      path: ["files"],
    },
  )
  .refine(
    (data) => {
      const paths = data.files.map((f) => f.path.toLowerCase());
      return new Set(paths).size === paths.length;
    },
    { message: "Duplicate file paths are not allowed", path: ["files"] },
  );

export type CreateSiteManifest = z.infer<typeof createSiteManifestSchema>;

// ---- slug availability check (separate lightweight endpoint) ----
export const slugCheckSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(40)
    .transform((s) => s.toLowerCase()),
});

// ---- single-file replace (used in file replace/delete route) ----
export const replaceFileSchema = z.object({
  siteId: z.string().cuid(),
  file: siteFileSchema,
});

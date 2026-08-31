import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET_NAME = "page-media";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

function resolveExtension(file: File | Blob): string {
  if ("name" in file && file.name.includes(".")) {
    const rawExt = file.name.split(".").pop() || "";
    // Strip anything that isn't a safe extension character.
    const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (safeExt) return safeExt === "svg" ? "svg" : safeExt;
  }
  if (file.type) {
    const mimeSubtype = file.type.split("/")[1];
    if (mimeSubtype) {
      return mimeSubtype.includes("+xml") ? "svg" : mimeSubtype;
    }
  }
  return "png";
}

/**
 * Uploads a single File or Blob to Supabase Storage and returns its public URL.
 * Validates MIME type and size before uploading — call sites should treat
 * the file as untrusted input.
 */
export async function uploadMediaToSupabase(
  file: File | Blob,
  folder: string = "uploads",
): Promise<{ url: string | null; error: string | null }> {
  try {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        url: null,
        error: `Unsupported file type: ${file.type || "unknown"}. Allowed: PNG, JPG, WEBP, SVG, GIF.`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        url: null,
        error: `File exceeds the 5MB limit.`,
      };
    }

    const fileExt = resolveExtension(file);
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: unknown) {
    return {
      url: null,
      error: (err as Error).message || "File upload failed.",
    };
  }
}

/**
 * Uploads multiple File or Blob instances concurrently to Supabase Storage.
 */
export async function uploadMultipleMediaToSupabase(
  files: (File | Blob)[],
  folder: string = "uploads",
): Promise<{ urls: string[]; errors: string[] }> {
  const results = await Promise.all(
    files.map((file) => uploadMediaToSupabase(file, folder)),
  );

  const urls: string[] = [];
  const errors: string[] = [];

  for (const res of results) {
    if (res.url) urls.push(res.url);
    if (res.error) errors.push(res.error);
  }

  return { urls, errors };
}

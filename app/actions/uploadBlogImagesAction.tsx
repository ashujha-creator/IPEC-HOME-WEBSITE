"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { uploadMultipleMediaToSupabase } from "@/lib/supabase-upload";
import { ActionState } from "@/lib/vaildation/blog";

export type UploadedImage = { url: string };

/**
 * Server Action: uploads one or more blog images on behalf of the current
 * authenticated user. Client components must call this instead of touching
 * Supabase directly — the service-role client never runs in the browser.
 */
export async function uploadBlogImagesAction(
  formData: FormData,
): Promise<ActionState<UploadedImage[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return {
        success: false,
        message: "Unauthorized. You must be logged in to upload images.",
      };
    }

    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File);

    if (!files.length) {
      return { success: false, message: "No files provided." };
    }

    const { urls, errors } = await uploadMultipleMediaToSupabase(
      files,
      "blog-images",
    );

    if (errors.length && !urls.length) {
      return {
        success: false,
        message: "All image uploads failed.",
        errors: { images: errors },
      };
    }

    return {
      success: true,
      message:
        errors.length > 0
          ? "Some images failed to upload."
          : "Images uploaded successfully.",
      data: urls.map((url) => ({ url })),
      ...(errors.length ? { errors: { images: errors } } : {}),
    };
  } catch (error: unknown) {
    console.error("[UPLOAD_BLOG_IMAGES_ERROR]:", error);
    return {
      success: false,
      message: (error as Error).message || "Image upload failed unexpectedly.",
    };
  }
}

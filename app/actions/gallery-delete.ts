"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { revalidatePath } from "next/cache";

const utapi = new UTApi();

// Helper to extract UploadThing file key from URL
function getUploadThingKey(url: string): string | null {
  try {
    const parts = url.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export async function deleteGalleryItem(galleryId: string) {
  // 1. Authenticate user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  try {
    // 2. Fetch the gallery item to verify ownership and retrieve image URLs
    const galleryItem = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    if (!galleryItem) {
      return { success: false, error: "Gallery item not found." };
    }

    // Optional: Ensure only author (or admin) can delete
    if (galleryItem.authorId !== session.user.id) {
      return {
        success: false,
        error: "You can only delete your own gallery items.",
      };
    }

    // 3. Delete files from UploadThing storage
    const fileKeys = galleryItem.image
      .map(getUploadThingKey)
      .filter((key): key is string => Boolean(key));

    if (fileKeys.length > 0) {
      await utapi.deleteFiles(fileKeys);
    }

    // 4. Delete entry from database
    await prisma.gallery.delete({
      where: { id: galleryId },
    });

    // 5. Revalidate cache
    revalidatePath("/admin");
    revalidatePath("/gallery");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return { success: false, error: "Failed to delete item from database." };
  }
}

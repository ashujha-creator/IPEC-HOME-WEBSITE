"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Adjust import path to your better-auth instance
import { prisma } from "@/lib/prisma"; // Adjust import path to your prisma instance above
import { gallerySchema, GalleryFormValues } from "@/lib/vaildation/gallery";

export async function createGalleryItem(data: GalleryFormValues) {
  // 1. Authenticate user via Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  // 2. Validate request payload using Zod
  const validatedFields = gallerySchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input fields",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, image, video, description } = validatedFields.data;

  try {
    // 3. Create entry in Prisma
    const galleryItem = await prisma.gallery.create({
      data: {
        title,
        image,
        video: video ? video : null,
        description: description || null,
        authorId: session.user.id,
      },
    });

    return { success: true, data: galleryItem };
  } catch (error) {
    console.error("Failed to create gallery item:", error);
    return {
      success: false,
      error: "Database error. Failed to save gallery item.",
    };
  }
}

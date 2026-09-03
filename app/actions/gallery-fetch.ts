"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface GetGalleryParams {
  page?: number;
  limit?: number;
}

export interface GalleryAuthor {
  name: string | null;
  image: string | null;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string[];
  video: string | null;
  description: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: GalleryAuthor;
}

export interface GetGalleryResponse {
  success: boolean;
  items: GalleryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  currentUserId: string | null;
  error?: string;
}

/**
 * Server Action to fetch paginated gallery items and current user session.
 */
export async function getGalleryData(
  params: GetGalleryParams = {},
): Promise<GetGalleryResponse> {
  try {
    // 1. Sanitize & Validate Pagination Input
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 6));
    const skip = (page - 1) * limit;

    // 2. Fetch User Session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 3. Query DB: Parallelize items fetch and total count for better performance
    const [galleryItems, totalCount] = await Promise.all([
      prisma.gallery.findMany({
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          image: true,
          video: true,
          description: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.gallery.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      success: true,
      items: galleryItems,
      totalCount,
      totalPages,
      currentPage: page,
      pageSize: limit,
      currentUserId: session?.user?.id ?? null,
    };
  } catch (error) {
    console.error("Error fetching gallery items:", error);

    return {
      success: false,
      items: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: params.limit || 6,
      currentUserId: null,
      error: "Failed to fetch gallery items. Please try again later.",
    };
  }
}

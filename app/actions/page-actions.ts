"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // Better-Auth instance
import {
  serverPagePayloadSchema,
  ActionState,
  ServerPagePayload,
} from "@/lib/vaildation/blog";
import { generateSlug } from "@/lib/slugify";
import { PageStatus } from "../generated/prisma/enums";

// Partial version of the server schema, for update payloads —
// every field optional, but whatever IS present still gets validated.
const partialServerPagePayloadSchema = serverPagePayloadSchema.partial();

/**
 * Ensures a slug is unique by appending incrementing suffixes if duplicates exist.
 */
async function ensureUniqueSlug(
  baseSlug: string,
  currentId?: string,
): Promise<string> {
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.page.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }
}

/**
 * Server Action: Create a new Page (Blog/Document)
 */
export async function createPageAction(
  rawData: ServerPagePayload,
): Promise<ActionState<{ id: string; slug: string }>> {
  try {
    // 1. Authenticate & fetch user session via Better-Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        message: "Unauthorized. You must be logged in to create a post.",
      };
    }

    const authorId = session.user.id;

    // 2. Validate payload against server schema
    const validated = serverPagePayloadSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: "Invalid form input.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const {
      title,
      shortDescription,
      content,
      images,
      status,
      slug: customSlug,
    } = validated.data;

    const baseSlug = customSlug || generateSlug(title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    // 3. Save to Prisma with clean string array for images
    const page = await prisma.page.create({
      data: {
        title,
        slug: uniqueSlug,
        shortDescription: shortDescription || null,
        content: content,
        status: status as PageStatus,
        image: images, // String[] matching Prisma schema
        authorId,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    revalidatePath("/admin/pages/all");
    revalidatePath(`/blog/${page.slug}`);

    return {
      success: true,
      message: "Page created successfully.",
      data: page,
    };
  } catch (error: unknown) {
    console.error("[CREATE_PAGE_ERROR]:", error);
    return {
      success: false,
      message:
        (error as Error).message ||
        "An unexpected error occurred while creating the page.",
    };
  }
}

/**
 * Server Action: Update an existing Page
 */
export async function updatePageAction(
  id: string,
  rawData: Partial<ServerPagePayload>,
): Promise<ActionState<{ id: string; slug: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    // 1. Validate the partial payload before touching anything else
    const validated = partialServerPagePayloadSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: "Invalid form input.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const data = validated.data;

    const existingPage = await prisma.page.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, authorId: true },
    });

    if (!existingPage) {
      return { success: false, message: "Page not found." };
    }

    // 2. Ownership check — only the original author may update their page
    if (existingPage.authorId !== session.user.id) {
      return {
        success: false,
        message: "You are not authorized to edit this page.",
      };
    }

    let updatedSlug = existingPage.slug;
    if (data.title && data.title !== existingPage.title) {
      const baseSlug = data.slug || generateSlug(data.title);
      updatedSlug = await ensureUniqueSlug(baseSlug, id);
    } else if (data.slug && data.slug !== existingPage.slug) {
      updatedSlug = await ensureUniqueSlug(data.slug, id);
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.shortDescription !== undefined && {
          shortDescription: data.shortDescription,
        }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.status && { status: data.status as PageStatus }),
        ...(data.images && { image: data.images }),
        slug: updatedSlug,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    revalidatePath("/admin/pages/all");
    revalidatePath(`/blog/${page.slug}`);

    return {
      success: true,
      message: "Page updated successfully.",
      data: page,
    };
  } catch (error: unknown) {
    console.error("[UPDATE_PAGE_ERROR]:", error);
    return {
      success: false,
      message:
        (error as Error).message ||
        "An unexpected error occurred while updating the page.",
    };
  }
}

/**
 * Server Action: Delete a Page by ID
 */
export async function deletePageAction(id: string): Promise<ActionState<null>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized." };
    }

    const existingPage = await prisma.page.findUnique({
      where: { id },
      select: { slug: true, authorId: true },
    });

    if (!existingPage) {
      return { success: false, message: "Page not found." };
    }

    if (existingPage.authorId !== session.user.id) {
      return {
        success: false,
        message: "You are not authorized to delete this page.",
      };
    }

    const deletedPage = await prisma.page.delete({
      where: { id },
      select: { slug: true },
    });

    revalidatePath("/admin/pages/all");
    revalidatePath(`/blog/${deletedPage.slug}`);

    return {
      success: true,
      message: "Page deleted successfully.",
    };
  } catch (error: unknown) {
    console.error("[DELETE_PAGE_ERROR]:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to delete page.",
    };
  }
}

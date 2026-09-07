import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = request.nextUrl;

    const parsed = querySchema.safeParse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: parsed.error.flatten().fieldErrors,
          requestId,
        },
        {
          status: 400,
          headers: {
            "X-Request-ID": requestId,
          },
        },
      );
    }

    const { cursor, limit, search } = parsed.data;

    const posts = await prisma.page.findMany({
      where: {
        status: "PUBLISHED",

        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  shortDescription: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  slug: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        image: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },

      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],

      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),

      // Fetch one extra item to determine whether another page exists.
      take: limit + 1,
    });

    const hasNextPage = posts.length > limit;

    const items = hasNextPage ? posts.slice(0, limit) : posts;

    const nextCursor =
      hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

    return NextResponse.json(
      {
        data: items,

        pagination: {
          limit,
          hasNextPage,
          nextCursor,
        },

        requestId,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "X-Request-ID": requestId,
        },
      },
    );
  } catch (error) {
    console.error("[PAGES_GET_ERROR]", {
      requestId,
      error,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        requestId,
      },
      {
        status: 500,
        headers: {
          "X-Request-ID": requestId,
        },
      },
    );
  }
}

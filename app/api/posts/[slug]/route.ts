import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const requestId = crypto.randomUUID();

  try {
    const { slug } = await params;

    if (!slug || slug.length > 200) {
      return NextResponse.json(
        {
          error: "Invalid post slug",
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

    const post = await prisma.page.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },

      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        content: true,
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
    });

    if (!post) {
      return NextResponse.json(
        {
          error: "Post not found",
          requestId,
        },
        {
          status: 404,
          headers: {
            "X-Request-ID": requestId,
          },
        },
      );
    }

    return NextResponse.json(
      {
        data: post,
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
    console.error("[POST_GET_ERROR]", {
      requestId,
      error,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch post",
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

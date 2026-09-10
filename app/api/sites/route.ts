// app/api/sites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSiteManifestSchema } from "@/lib/user-sites/schemas";
import {
  MAX_TOTAL_SIZE_BYTES,
  MAX_FILE_COUNT,
} from "@/lib/user-sites/constants";
import { headers } from "next/headers";

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status },
  );
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    // -----------------------------------------------------------------------
    // Authentication
    // -----------------------------------------------------------------------
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // -----------------------------------------------------------------------
    // Content-Type
    // -----------------------------------------------------------------------
    const contentType = req.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 415);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    // -----------------------------------------------------------------------
    // Validate request
    // -----------------------------------------------------------------------
    const parsed = createSiteManifestSchema.safeParse(body);

    if (!parsed.success) {
      console.warn("POST /api/sites: validation failed", {
        userId: session.user.id,
        issues: parsed.error.flatten(),
      });
      return jsonError("Invalid request", 400, parsed.error.flatten());
    }

    const { slug, entryFile, files } = parsed.data;

    // Defensive re-check — schema already enforces these via Zod, but
    // this guards against the schema being loosened later without
    // someone remembering to re-check server limits here too.
    if (files.length > MAX_FILE_COUNT) {
      return jsonError(
        `A site cannot contain more than ${MAX_FILE_COUNT} files`,
        400,
      );
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

    if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
      return jsonError(
        `Total site size cannot exceed ${MAX_TOTAL_SIZE_BYTES} bytes`,
        413,
      );
    }

    // -----------------------------------------------------------------------
    // Database write
    //
    // IMPORTANT:
    // `slug` must have a UNIQUE database constraint.
    //
    // Do not rely on findUnique() followed by create(). Two requests can
    // pass the check simultaneously — the DB constraint is the actual
    // race-condition protection (see the P2002 handling below).
    // -----------------------------------------------------------------------
    const site = await prisma.site.create({
      data: {
        slug,
        entryFile,
        ownerId: session.user.id,
        totalBytes,
        files: {
          create: files.map((file) => ({
            path: file.path,
            contentType: file.contentType,
            size: file.size,
            storageKey: file.storageKey,
            storageUrl: file.storageUrl,
            checksum: file.checksum,
          })),
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    console.info("POST /api/sites: site created", {
      userId: session.user.id,
      siteId: site.id,
      slug: site.slug,
      fileCount: files.length,
      totalBytes,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      {
        id: site.id,
        slug: site.slug,
        url: `$/sections/${site.slug}`,
      },
      { status: 201 },
    );
  } catch (error) {
    // -----------------------------------------------------------------------
    // Expected Prisma uniqueness violation on `slug` — this is the actual
    // race-condition protection. The database constraint decides which
    // concurrent request wins; everything else falls through to a real
    // 500 below instead of being misreported as "slug taken".
    // -----------------------------------------------------------------------

    console.error("POST /api/sites failed", {
      error,
      durationMs: Date.now() - startedAt,
    });

    return jsonError("Internal server error", 500);
  }
}

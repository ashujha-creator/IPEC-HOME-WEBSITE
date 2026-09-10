// app/api/sites/[id]/republish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSiteManifestSchema } from "@/lib/user-sites/schemas";
import { headers } from "next/headers";

const idParamSchema = z.string().cuid();

// Note: reuses createSiteManifestSchema but slug is ignored/immutable here —
// slug changes are a separate, deliberate operation (URL changes = broken links),
// not bundled into a republish.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const startedAt = Date.now();
  const { id } = await params;

  const idCheck = idParamSchema.safeParse(id);
  if (!idCheck.success) {
    return NextResponse.json({ error: "Invalid site id" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const site = await prisma.site.findUnique({
      where: { id },
      select: { id: true, ownerId: true, slug: true },
    });
    if (!site) return new NextResponse("Not found", { status: 404 });
    if (site.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = createSiteManifestSchema.safeParse({
      ...(body && typeof body === "object" ? body : {}),
      slug: site.slug,
    });
    if (!parsed.success) {
      console.warn("PUT /api/sites/[id]/republish: validation failed", {
        userId: session.user.id,
        siteId: site.id,
        issues: parsed.error.flatten(),
      });
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { entryFile, files } = parsed.data;
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

    await prisma.$transaction([
      prisma.siteFile.deleteMany({ where: { siteId: site.id } }),
      prisma.siteFile.createMany({
        data: files.map((f) => ({
          siteId: site.id,
          path: f.path,
          contentType: f.contentType,
          size: f.size,
          storageKey: f.storageKey,
          storageUrl: f.storageUrl,
          checksum: f.checksum,
        })),
      }),
      prisma.site.update({
        where: { id: site.id },
        data: { entryFile, totalBytes, updatedAt: new Date() },
      }),
    ]);

    console.info("PUT /api/sites/[id]/republish: site republished", {
      userId: session.user.id,
      siteId: site.id,
      slug: site.slug,
      fileCount: files.length,
      totalBytes,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/sites/[id]/republish failed", {
      siteId: id,
      error,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

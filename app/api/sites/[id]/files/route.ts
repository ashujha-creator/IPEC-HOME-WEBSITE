/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/sites/[id]/files/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { replaceFileSchema } from "@/lib/user-sites/schemas";
import {
  MAX_TOTAL_SIZE_BYTES,
  MAX_FILE_COUNT,
} from "@/lib/user-sites/constants";
import { headers } from "next/headers";

const idParamSchema = z.string().cuid();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const startedAt = Date.now();
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = replaceFileSchema.safeParse({
    siteId: id,
    file: body && typeof body === "object" ? (body as any).file : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { siteId, file } = parsed.data;

  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, ownerId: true, slug: true, totalBytes: true },
    });

    if (!site) return new NextResponse("Not found", { status: 404 });
    if (site.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.siteFile.findUnique({
      where: { siteId_path: { siteId, path: file.path } },
      select: { size: true },
    });

    // Enforce the per-site file-count cap only when this PUT is creating
    // a *new* file. Replacing an existing file's content never changes
    // the count, so it's exempt.
    if (!existing) {
      const currentFileCount = await prisma.siteFile.count({
        where: { siteId },
      });
      if (currentFileCount >= MAX_FILE_COUNT) {
        return NextResponse.json(
          { error: `Site already has the maximum of ${MAX_FILE_COUNT} files` },
          { status: 413 },
        );
      }
    }

    const sizeDelta = file.size - (existing?.size ?? 0);
    const projectedTotal = site.totalBytes + sizeDelta;
    if (projectedTotal > MAX_TOTAL_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Would exceed ${MAX_TOTAL_SIZE_BYTES / 1024 / 1024}MB site limit`,
        },
        { status: 413 },
      );
    }

    await prisma.$transaction([
      prisma.siteFile.upsert({
        where: { siteId_path: { siteId, path: file.path } },
        create: {
          siteId,
          path: file.path,
          contentType: file.contentType,
          size: file.size,
          storageKey: file.storageKey,
          storageUrl: file.storageUrl,
          checksum: file.checksum,
        },
        update: {
          contentType: file.contentType,
          size: file.size,
          storageKey: file.storageKey,
          storageUrl: file.storageUrl,
          checksum: file.checksum,
        },
      }),
      // Atomic increment instead of a read-then-write assignment — avoids
      // losing updates when two file replaces on the same site race.
      prisma.site.update({
        where: { id: siteId },
        data: { totalBytes: { increment: sizeDelta } },
      }),
    ]);

    console.info("PUT /api/sites/[id]/files: file upserted", {
      userId: session.user.id,
      siteId,
      path: file.path,
      sizeDelta,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ ok: true, path: file.path });
  } catch (error) {
    console.error("PUT /api/sites/[id]/files failed", {
      siteId,
      path: file.path,
      error,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
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

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "path query param required" },
      { status: 400 },
    );
  }

  try {
    const site = await prisma.site.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        slug: true,
        entryFile: true,
        totalBytes: true,
      },
    });
    if (!site) return new NextResponse("Not found", { status: 404 });
    if (site.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Don't allow deleting the site's entry file out from under it — that
    // would leave the published site with no page to serve. The user
    // must change the entry file (a separate, deliberate operation)
    // before removing this one.
    if (path === site.entryFile) {
      return NextResponse.json(
        {
          error:
            "Cannot delete the site's entry file. Set a different entry file first.",
        },
        { status: 409 },
      );
    }

    const existing = await prisma.siteFile.findUnique({
      where: { siteId_path: { siteId: site.id, path } },
      select: { size: true },
    });
    if (!existing) return new NextResponse("Not found", { status: 404 });

    // Fixed: this previously also deleted the *site* itself
    // (prisma.site.delete), which cascaded and wiped every other file.
    // It now only removes the one file and decrements the site's byte
    // total — the site itself is untouched.
    await prisma.$transaction([
      prisma.siteFile.delete({
        where: { siteId_path: { siteId: site.id, path } },
      }),
      prisma.site.update({
        where: { id: site.id },
        data: { totalBytes: { decrement: existing.size } },
      }),
    ]);

    console.info("DELETE /api/sites/[id]/files: file deleted", {
      userId: session.user.id,
      siteId: site.id,
      path,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/sites/[id]/files failed", {
      siteId: id,
      path,
      error,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

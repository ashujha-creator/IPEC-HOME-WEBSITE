import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/lib/auth"; // ⚠️ adjust to your actual better-auth export
import { prisma } from "@/lib/prisma"; // ⚠️ adjust to your actual Prisma client singleton
import { supabaseAdmin } from "@/lib/supabase-admin";
import { applyAssetUrls } from "@/lib/asset-refs";

export const runtime = "nodejs";

const BUCKET = "page-media";
const MAX_ASSET_BYTES = 5 * 1024 * 1024; // 5 MB per asset
const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50 MB per playground

const CODE_FILES = [
  { field: "html", path: "index.html", contentType: "text/html" },
  { field: "css", path: "style.css", contentType: "text/css" },
  { field: "javascript", path: "script.js", contentType: "text/javascript" },
] as const;

function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playground = await prisma.playground.findUnique({ where: { id } });

  if (!playground) {
    return NextResponse.json(
      { error: "Playground not found." },
      { status: 404 },
    );
  }

  if (playground.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();

  const html = formData.get("html");
  const css = formData.get("css");
  const javascript = formData.get("javascript");
  const assetMetaRaw = formData.get("assetMeta");

  if (
    typeof html !== "string" ||
    typeof css !== "string" ||
    typeof javascript !== "string"
  ) {
    return NextResponse.json(
      { error: "html, css, and javascript are required." },
      { status: 400 },
    );
  }

  let assetMeta: { id: string; name: string }[] = [];

  if (typeof assetMetaRaw === "string") {
    try {
      assetMeta = JSON.parse(assetMetaRaw);
    } catch {
      return NextResponse.json(
        { error: "Invalid assetMeta." },
        { status: 400 },
      );
    }
  }

  const assetFiles = formData
    .getAll("assets")
    .filter((entry): entry is File => entry instanceof File);

  if (assetFiles.length !== assetMeta.length) {
    return NextResponse.json(
      { error: "assetMeta does not match the number of uploaded files." },
      { status: 400 },
    );
  }

  for (const file of assetFiles) {
    if (file.size > MAX_ASSET_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" is larger than 5 MB.` },
        { status: 400 },
      );
    }
  }

  const codeByteLength =
    Buffer.byteLength(html, "utf-8") +
    Buffer.byteLength(css, "utf-8") +
    Buffer.byteLength(javascript, "utf-8");

  const assetsByteLength = assetFiles.reduce((sum, file) => sum + file.size, 0);

  if (codeByteLength + assetsByteLength > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: "Total upload size exceeds the playground's 50 MB limit." },
      { status: 400 },
    );
  }

  try {
    // Existing rows, keyed by path — used to skip unchanged uploads and
    // find assets that were removed client-side since the last publish.
    const existingFiles = await prisma.playgroundFile.findMany({
      where: { playgroundId: playground.id },
    });
    const existingByPath = new Map(existingFiles.map((f) => [f.path, f]));

    // 1. Upload assets, skipping any whose checksum matches the stored one.
    const urlById: Record<string, string> = {};
    const currentAssetPaths = new Set<string>();

    for (let i = 0; i < assetFiles.length; i++) {
      const file = assetFiles[i];
      const meta = assetMeta[i];

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

      const safeName = sanitizeFileName(meta.name || file.name);
      const relativePath = `assets/${meta.id}-${safeName}`;
      const storagePath = `playgrounds/${playground.ownerId}/${playground.slug}/${relativePath}`;

      currentAssetPaths.add(relativePath);

      const existing = existingByPath.get(relativePath);
      const unchanged = existing && existing.checksum === checksum;

      if (!unchanged) {
        const { error: uploadError } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(
            `Failed to upload ${meta.name}: ${uploadError.message}`,
          );
        }

        await prisma.playgroundFile.upsert({
          where: {
            playgroundId_path: {
              playgroundId: playground.id,
              path: relativePath,
            },
          },
          create: {
            playgroundId: playground.id,
            path: relativePath,
            contentType: file.type || "application/octet-stream",
            size: buffer.byteLength,
            bucket: BUCKET,
            storagePath,
            checksum,
          },
          update: {
            contentType: file.type || "application/octet-stream",
            size: buffer.byteLength,
            storagePath,
            checksum,
          },
        });
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      urlById[meta.id] = publicUrlData.publicUrl;
    }

    // 2. Any previously-stored asset not present this time was removed
    // client-side — delete its storage object and DB row.
    const staleAssets = existingFiles.filter(
      (f) => f.path.startsWith("assets/") && !currentAssetPaths.has(f.path),
    );

    if (staleAssets.length > 0) {
      const { error: removeError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove(staleAssets.map((f) => f.storagePath));

      if (removeError) {
        // Non-fatal: log and continue: an orphaned storage object is safer
        // to leave behind than to block the whole publish over cleanup.
        console.error("Failed to remove stale assets:", removeError.message);
      }

      await prisma.playgroundFile.deleteMany({
        where: { id: { in: staleAssets.map((f) => f.id) } },
      });
    }

    // 3. Rewrite asset:// references now that we know the real URLs.
    const finalHtml = applyAssetUrls(html, urlById);
    const finalCss = applyAssetUrls(css, urlById);

    const codeContents: Record<(typeof CODE_FILES)[number]["field"], string> = {
      html: finalHtml,
      css: finalCss,
      javascript,
    };

    // 4. Upload code files, again skipping any with a matching checksum.
    for (const file of CODE_FILES) {
      const buffer = Buffer.from(codeContents[file.field], "utf-8");
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
      const storagePath = `playgrounds/${playground.ownerId}/${playground.slug}/${file.path}`;

      const existing = existingByPath.get(file.path);
      if (existing && existing.checksum === checksum) {
        continue;
      }

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.contentType,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(
          `Failed to upload ${file.path}: ${uploadError.message}`,
        );
      }

      await prisma.playgroundFile.upsert({
        where: {
          playgroundId_path: { playgroundId: playground.id, path: file.path },
        },
        create: {
          playgroundId: playground.id,
          path: file.path,
          contentType: file.contentType,
          size: buffer.byteLength,
          bucket: BUCKET,
          storagePath,
          checksum,
        },
        update: {
          contentType: file.contentType,
          size: buffer.byteLength,
          storagePath,
          checksum,
        },
      });
    }

    // 5. totalBytes across whatever's left on record after cleanup.
    const remainingFiles = await prisma.playgroundFile.findMany({
      where: { playgroundId: playground.id },
      select: { size: true },
    });
    const totalBytes = remainingFiles.reduce((sum, f) => sum + f.size, 0);

    const updated = await prisma.playground.update({
      where: { id: playground.id },
      data: { totalBytes, status: "PUBLISHED" },
    });

    return NextResponse.json({ playground: updated });
  } catch (error) {
    console.error("Publish failed:", error);
    return NextResponse.json(
      { error: "Failed to publish playground." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playground = await prisma.playground.findUnique({
    where: { id },
    include: { files: true },
  });

  if (!playground) {
    return NextResponse.json(
      { error: "Playground not found." },
      { status: 404 },
    );
  }

  if (playground.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    if (playground.files.length > 0) {
      const { error: removeError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove(playground.files.map((f) => f.storagePath));

      if (removeError) {
        console.error("Failed to remove storage objects:", removeError.message);
        // continue anyway — an orphaned object is safer than a stuck delete
      }
    }

    // Cascades to PlaygroundFile rows via the schema's onDelete: Cascade.
    await prisma.playground.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete playground." },
      { status: 500 },
    );
  }
}

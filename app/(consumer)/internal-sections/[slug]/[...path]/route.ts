/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSiteBySlugCached } from "@/lib/user-sites/site-cache";
import crypto from "crypto";

const PROXY_EXTENSIONS = new Set(["html", "htm"]);
const UPSTREAM_FETCH_TIMEOUT_MS = 5000; // 5-second connection timeout

// Cache site file metadata to reduce DB load
const getSiteFileCached = unstable_cache(
  async (siteId: string, path: string) => {
    return prisma.siteFile.findUnique({
      where: { siteId_path: { siteId, path } },
      select: {
        path: true,
        contentType: true,
        storageKey: true,
        storageUrl: true,
        updatedAt: true,
      },
    });
  },
  ["site-file-by-path"],
  { revalidate: 60, tags: ["site-files"] }, // 1-min cache, revalidate on file updates via tags
);

function buildCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

/**
 * Normalizes and sanitizes path parts to prevent directory traversal
 */
function sanitizePath(pathParts: string[]): string | null {
  const normalized = pathParts
    .map((part) => decodeURIComponent(part))
    .join("/")
    .replace(/\/+/g, "/"); // remove duplicate slashes

  if (normalized.includes("..") || normalized.startsWith("/")) {
    return null;
  }

  return normalized;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path: pathParts } = await params;

  // 1. Path Sanitization Check
  const relPath = sanitizePath(pathParts);
  if (!relPath) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    // 2. Resolve Site
    const site = await getSiteBySlugCached(slug);
    if (!site || site.status !== "ACTIVE") {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 3. Resolve File Metadata (Cached)
    const file = await getSiteFileCached(site.id, relPath);
    if (!file) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const ext = file.path.split(".").pop()?.toLowerCase() ?? "";

    // 4. Handle Non-Proxy Extensions (Direct Storage Redirect)
    if (!PROXY_EXTENSIONS.has(ext)) {
      return NextResponse.redirect(file.storageUrl, {
        status: 302,
        headers: {
          // Cache redirect at CDN edge for 5 mins
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      });
    }

    // 5. Fetch Upstream HTML with Abort Signal Timeout
    const upstream = await fetch(file.storageUrl, {
      signal: AbortSignal.timeout(UPSTREAM_FETCH_TIMEOUT_MS),
      next: { revalidate: 60 }, // Utilize Next fetch cache for S3/Blob storage
    });

    if (!upstream.ok) {
      console.error(
        `[Proxy Error] Upstream returned status ${upstream.status} for file: ${file.storageUrl}`,
      );
      return new NextResponse("Upstream resource unavailable", { status: 502 });
    }

    let html = await upstream.text();

    // 6. Generate ETag & Handle Conditional HTTP 304 Requests
    const etag = `W/"${crypto.createHash("md5").update(html).digest("hex")}"`;
    const clientEtag = req.headers.get("if-none-match");

    if (clientEtag === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      });
    }

    // 7. Inject Base Tag for Relative Asset Resolution
    const basePath = `/sections/${slug}/`;
    if (!/<base\s/i.test(html)) {
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(
          /<head[^>]*>/i,
          (match) => `${match}\n<base href="${basePath}">`,
        );
      } else {
        html = `<base href="${basePath}">\n${html}`;
      }
    }

    // 8. Construct Secured Response
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": file.contentType || "text/html; charset=utf-8",
        "Content-Security-Policy": buildCsp(),
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        ETag: etag,
        "Cache-Control":
          "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    // 9. Production-Grade Exception Handling
    if (error.name === "TimeoutError") {
      console.error(
        `[Proxy Timeout] Upstream request timed out for slug: ${slug}, path: ${relPath}`,
      );
      return new NextResponse("Gateway Timeout", { status: 504 });
    }

    console.error(
      `[Proxy Exception] Failed processing route for ${slug}/${relPath}:`,
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

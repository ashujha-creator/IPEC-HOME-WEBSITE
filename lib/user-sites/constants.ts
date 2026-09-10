// lib/user-sites/constants.ts

export const ALLOWED_EXTENSIONS = [
  "html",
  "css",
  "js",
  "mjs",
  "json",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "ico",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "pdf",
] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

// O(1) membership checks — this set is consulted on every uploaded file,
// for every site create/replace/republish request.
export const ALLOWED_EXTENSIONS_SET: ReadonlySet<string> = new Set(
  ALLOWED_EXTENSIONS,
);

export const EXTENSION_MIME_MAP: Record<AllowedExtension, string> = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  mjs: "application/javascript",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  pdf: "application/pdf",
};

const DEFAULT_CONTENT_TYPE = "application/octet-stream";

/**
 * Derives the content type from a file's extension. Never trust a
 * client-supplied contentType for anything security-relevant (serving
 * headers, sniffing behavior) — always resolve it server-side from the
 * path instead. Unknown/disallowed extensions fall back to a safe
 * generic binary type rather than throwing, so callers can still run
 * their own extension allow-list check and produce a clean validation
 * error instead of an exception.
 */
export function getSafeContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if ((ALLOWED_EXTENSIONS_SET as Set<string>).has(ext)) {
    return EXTENSION_MIME_MAP[ext as AllowedExtension];
  }
  return DEFAULT_CONTENT_TYPE;
}

// Explicitly blocked even if someone renames the extension trickily later —
// this list is the "never, ever" set for this feature.
// NOTE: this blocks upload of a file *named* sw.js. It does NOT stop a
// script served from this feature from calling
// navigator.serviceWorker.register() on any allowed .js file at runtime.
// If service-worker registration from user-hosted content is a concern,
// it needs to be enforced via CSP (`worker-src 'none'`) at the serving
// layer, not here.
export const BLOCKED_FILENAMES_SET: ReadonlySet<string> = new Set([
  "sw.js",
  "service-worker.js",
  ".htaccess",
  "web.config",
]);

export const MAX_FILE_SIZE_BYTES = 16 * 1024 * 1024; // 16MB
export const MAX_FILE_SIZE_STRING = "16MB" as const;
export const MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024; // 50MB per site
export const MAX_FILE_COUNT = 200;

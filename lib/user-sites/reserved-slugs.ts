// lib/user-sites/reserved-slugs.ts

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "www",
  "api",
  "admin",
  "app",
  "dashboard",
  "auth",
  "login",
  "signup",
  "mail",
  "ftp",
  "staging",
  "dev",
  "test",
  "assets",
  "static",
  "cdn",
  "blog",
  "docs",
  "help",
  "support",
  "status",
  "billing",
  "account",
  "null",
  "undefined",
  "root",
  "system",
  "sites",
]);

// lowercase alphanumeric + hyphen, 3-40 chars, no leading/trailing hyphen
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;

/**
 * Validates a slug against format + reserved-word rules.
 *
 * Defensive: lowercases internally so this is safe to call directly
 * (e.g. from a future script, admin tool, or test) even if the caller
 * forgets to normalize case first. `schemas.ts` also lowercases via a
 * Zod `.transform()` before this runs, so in the current request path
 * this is a no-op safety net, not duplicate logic that can drift.
 */
export function isValidSlug(slug: string): boolean {
  const normalized = slug.toLowerCase();
  return SLUG_REGEX.test(normalized) && !RESERVED_SLUGS.has(normalized);
}

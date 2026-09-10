// lib/user-sites/site-cache.ts
import { prisma } from "@/lib/prisma";

type CachedSite = {
  id: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  entryFile: string;
} | null;

type CacheEntry = { value: CachedSite; expires: number };

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CachedSite>>();

const TTL_MS = 30_000; // 30s — balance freshness (file edits) vs DB load
const MAX_CACHE_ENTRIES = 5_000; // safety valve against unbounded growth

/**
 * NOTE on multi-instance deployments:
 * This cache is in-process (a plain Map). If this app runs on more than
 * one server/container/lambda instance, invalidateSiteCache() only
 * clears the cache on the instance that handled the write — other
 * instances will keep serving stale data for up to TTL_MS after a
 * republish/file-edit/delete. That's a real correctness gap on any
 * horizontally-scaled deployment, not something fixable within a
 * single in-memory Map. If you're running >1 instance, this needs to
 * move to a shared store (Redis, etc.) with pub/sub invalidation —
 * flagging this explicitly rather than silently leaving it broken.
 */

function evictExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires <= now) cache.delete(key);
  }
}

function evictOldestIfOverCapacity() {
  if (cache.size <= MAX_CACHE_ENTRIES) return;
  // Map preserves insertion order — oldest entry is first.
  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) cache.delete(oldestKey);
}

export async function getSiteBySlugCached(slug: string): Promise<CachedSite> {
  const hit = cache.get(slug);
  if (hit && hit.expires > Date.now()) {
    return hit.value;
  }

  // Coalesce concurrent misses for the same slug into one DB query.
  const pending = inFlight.get(slug);
  if (pending) return pending;

  const queryPromise = (async () => {
    try {
      const site = await prisma.site.findUnique({
        where: { slug },
        select: { id: true, status: true, entryFile: true },
      });

      const value: CachedSite = site ?? null;

      evictExpired();
      evictOldestIfOverCapacity();
      cache.set(slug, { value, expires: Date.now() + TTL_MS });

      return value;
    } catch (error) {
      console.error("getSiteBySlugCached: DB lookup failed", {
        slug,
        error,
      });
      // Do not cache failures — a transient DB error should not make a
      // valid site look "not found" for the next 30s.
      throw error;
    } finally {
      inFlight.delete(slug);
    }
  })();

  inFlight.set(slug, queryPromise);
  return queryPromise;
}

export function invalidateSiteCache(slug: string) {
  const existed = cache.delete(slug);
  if (existed) {
    console.info("site-cache: invalidated", { slug });
  }
}

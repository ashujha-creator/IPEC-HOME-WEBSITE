import { type NavItem, type PageLinks, type LinkUrlKey } from "./nav-items";

/**
 * Returns a trimmed URL string if `value` is a non-empty, non-whitespace
 * string. Returns null for "", "   ", null, or undefined — anything that
 * should NOT override the hardcoded href.
 */
function normalizeUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolves the final href for one NavItem:
 * - `dbKey` (single field) wins if it has a non-empty URL.
 * - `dbKeys` (multiple fields, e.g. "Criterion 1 - 7") is checked in
 *   order; the first non-empty field wins.
 * - Otherwise, falls back to the original hardcoded `href`.
 */
function resolveHref(item: NavItem, dbData: PageLinks): string {
  if (item.dbKey) {
    const url = normalizeUrl(dbData[item.dbKey] as string | null | undefined);
    if (url) return url;
  }

  if (item.dbKeys?.length) {
    for (const key of item.dbKeys as LinkUrlKey[]) {
      const url = normalizeUrl(dbData[key] as string | null | undefined);
      if (url) return url;
    }
  }

  return item.href;
}

/**
 * Recursively merges DB-supplied URLs into a NavItem tree.
 * Pure function — never mutates `items` or `dbData`; returns a new tree.
 */
export function mapDatabaseLinks(
  items: NavItem[],
  dbData: PageLinks,
): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: resolveHref(item, dbData),
    children: item.children
      ? mapDatabaseLinks(item.children, dbData)
      : undefined,
  }));
}

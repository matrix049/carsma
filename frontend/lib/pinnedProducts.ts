/**
 * Shared rules for the four "always-on-top" products.
 *
 * Both the /shop gallery and the home page's Featured section import from
 * here so the ordering and the "Most Popular" badge can never drift out of
 * sync. Add, remove or reorder a pattern and both surfaces update together.
 *
 * Patterns are case-insensitive and matched against `product.name`.
 * If multiple products match a single pattern, the first one wins its
 * slot; the rest fall back into the non-pinned tail in natural order.
 */
import { getEditionIndex, NEW_EDITIONS } from './newEditions';

export const PINNED_NAME_PATTERNS: RegExp[] = [
  /911\s*GT3\s*RS/i,                      // 911 GT3 RS
  /\bg[\s-]*class\b|\bg[\s-]*63\b/i,      // G-Class / G63
  /\brs\s*6\b/i,                           // RS6
  /\bbmw\b.*\be93\b/i,                     // BMW E93 M3 Convertible
];

/**
 * Returns the pin slot a name matches, or -1 if it isn't pinned.
 * New editions (lib/newEditions.ts) are never "Most Popular" — "G-Class 3D"
 * must not take the regular G-Class slot.
 */
export function getPinnedIndex(name: string): number {
  if (getEditionIndex(name) >= 0) return -1;
  return PINNED_NAME_PATTERNS.findIndex((re) => re.test(name));
}

/** Combined slot: new editions first, then the Most Popular pins. */
function getSlot(name: string): number {
  const edition = getEditionIndex(name);
  if (edition >= 0) return edition;
  const pin = getPinnedIndex(name);
  return pin >= 0 ? NEW_EDITIONS.length + pin : -1;
}

/** Stable-sort: new editions, then pinned products in pattern order, everything else after. */
export function applyPin<T extends { name: string }>(items: T[]): T[] {
  const pinned: (T | undefined)[] = new Array(NEW_EDITIONS.length + PINNED_NAME_PATTERNS.length).fill(undefined);
  const rest: T[] = [];
  for (const item of items) {
    const idx = getSlot(item.name);
    if (idx >= 0 && !pinned[idx]) {
      pinned[idx] = item;
    } else {
      rest.push(item);
    }
  }
  return [...(pinned.filter(Boolean) as T[]), ...rest];
}

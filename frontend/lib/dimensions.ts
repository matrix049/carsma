import { editionOf } from './newEditions';

/**
 * Product dimensions come from the product itself, set per-product by admins
 * in /admin/products. Legacy products without the field fall back to the
 * catalogue standard — except the 3D editions, which are made in one fixed
 * size (lib/newEditions.ts) unless the admin typed a different one.
 */
export const DEFAULT_DIMENSIONS = '120cm x 35cm';

export function dimensionsOf(product: { name?: string; dimensions?: string } | null | undefined): string {
  const set = (product?.dimensions || '').trim();
  const edition = editionOf(product?.name);
  if (edition && (!set || set === DEFAULT_DIMENSIONS)) return edition.size;
  return set || DEFAULT_DIMENSIONS;
}

/** "120cm x 35cm" → { w: 120, h: 35 } (null when the string can't be parsed). */
export function parseDimensions(label: string): { w: number; h: number } | null {
  const m = label.match(/(\d+(?:[.,]\d+)?)\s*(?:cm)?\s*[x×*]\s*(\d+(?:[.,]\d+)?)/i);
  if (!m) return null;
  return { w: parseFloat(m[1].replace(',', '.')), h: parseFloat(m[2].replace(',', '.')) };
}

/** Compact spec-sheet form: "120×35 CM". */
export function shortDimensions(label: string): string {
  const d = parseDimensions(label);
  return d ? `${d.w}×${d.h} CM` : label.toUpperCase();
}

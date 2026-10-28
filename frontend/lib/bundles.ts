/**
 * The 3D duo offer: the G-Class 3D and the 911 3D together for one price,
 * taken off automatically for every complete pair in the cart.
 * Mirror of backend/src/services/bundles.ts — keep both in sync.
 */
import { NEW_EDITIONS } from './newEditions';

export const DUO_PRICE = 699;
export const DUO_LABEL = '3D duo offer';
export const DUO_LABEL_AR = 'عرض الجوج';

interface Line {
  name: string;
  price: number;
  quantity: number;
}

/** How much the duo takes off these lines (0 when the pair isn't complete). */
export function duoDiscount(lines: Line[]): { pairs: number; amount: number } {
  const groups = NEW_EDITIONS.map((e) => lines.filter((l) => e.pattern.test(l.name)));
  const pairs = Math.min(...groups.map((g) => g.reduce((n, l) => n + l.quantity, 0)));
  if (!pairs) return { pairs: 0, amount: 0 };
  const together = groups.reduce((sum, g) => sum + Math.min(...g.map((l) => l.price)), 0);
  return { pairs, amount: pairs * Math.max(0, together - DUO_PRICE) };
}

/** Full price of one of each edition, and what the duo saves on it. */
export function duoPricing(editions: { price: number }[]): { full: number; saving: number } {
  const full = editions.reduce((sum, e) => sum + e.price, 0);
  return { full, saving: Math.max(0, full - DUO_PRICE) };
}

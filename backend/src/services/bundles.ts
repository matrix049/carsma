/**
 * The 3D duo offer: the G-Class 3D and the 911 3D together for one price.
 * Applied automatically to every complete pair in an order.
 * Mirror of frontend/lib/bundles.ts — keep both in sync.
 */

export const DUO_PRICE = 699;
export const DUO_LABEL = '3D duo offer';

// Same names the 3D editions are matched by elsewhere (dataMigrations, frontend).
const DUO_PATTERNS = [/\bg[\s-]*(class|63)\b.*\b3\s*d\b/i, /\b911\b.*\b3\s*d\b/i];

interface Line {
  name: string;
  price: number;
  quantity: number;
}

/** How much the duo takes off these lines (0 when the pair isn't complete). */
export function duoDiscount(lines: Line[]): { pairs: number; amount: number } {
  const groups = DUO_PATTERNS.map((re) => lines.filter((l) => typeof l?.name === 'string' && re.test(l.name)));
  const pairs = Math.min(...groups.map((g) => g.reduce((n, l) => n + (Number(l.quantity) || 0), 0)));
  if (!pairs) return { pairs: 0, amount: 0 };
  const together = groups.reduce((sum, g) => sum + Math.min(...g.map((l) => Number(l.price) || 0)), 0);
  return { pairs, amount: pairs * Math.max(0, together - DUO_PRICE) };
}

/** Paying by instant bank transfer takes 10% off what's left after the duo offer. */
export const TRANSFER_DISCOUNT_RATE = 0.1;
export const TRANSFER_LABEL = '10% instant transfer';

/** What an order costs: items, minus the duo offer, minus 10% when paid by instant transfer. */
export function orderPricing(lines: Line[], paymentMethod?: string) {
  const subtotal = lines.reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0);
  const duo = duoDiscount(lines).amount;
  const transfer = paymentMethod === 'bank_transfer' ? Math.round((subtotal - duo) * TRANSFER_DISCOUNT_RATE) : 0;
  const label = [duo ? DUO_LABEL : '', transfer ? TRANSFER_LABEL : ''].filter(Boolean).join(' + ');
  return {
    subtotal,
    duo,
    transfer,
    total: subtotal - duo - transfer,
    discount: duo + transfer > 0 ? { label, amount: duo + transfer } : null,
  };
}

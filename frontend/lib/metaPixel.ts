/**
 * Thin wrapper around Meta Pixel's `fbq`. Safe to call from anywhere — if the
 * pixel hasn't loaded (SSR, ad-blocker), the call is a no-op.
 *
 * Prices are in MAD, but Meta's pixel rejects MAD as a currency ("Parameter
 * 'currency' is invalid"), which left every event without a value. So values go
 * out in US dollars — the ad account's currency — at a fixed, approximate rate:
 * close enough for Meta to tell a 699 DH order from a 249 DH one.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const CURRENCY = 'USD';
const MAD_PER_USD = 10;
const toUsd = (mad: number) => Math.round((mad / MAD_PER_USD) * 100) / 100;

type StandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export function trackMetaEvent(
  event: StandardEvent,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  window.fbq?.('track', event, params);
}

export function trackViewContent(args: {
  productId: string;
  name: string;
  category?: string;
  price: number;
}): void {
  trackMetaEvent('ViewContent', {
    content_ids: [args.productId],
    content_name: args.name,
    content_category: args.category,
    content_type: 'product',
    value: toUsd(args.price),
    currency: CURRENCY,
  });
}

export function trackAddToCart(args: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  trackMetaEvent('AddToCart', {
    content_ids: [args.productId],
    content_name: args.name,
    content_type: 'product',
    value: toUsd(args.price * args.quantity),
    currency: CURRENCY,
    num_items: args.quantity,
  });
}

export function trackInitiateCheckout(args: {
  productIds: string[];
  numItems: number;
  value: number;
}): void {
  trackMetaEvent('InitiateCheckout', {
    content_ids: args.productIds,
    content_type: 'product',
    num_items: args.numItems,
    value: toUsd(args.value),
    currency: CURRENCY,
  });
}

export function trackPurchase(args: {
  productIds: string[];
  numItems: number;
  value: number;
}): void {
  trackMetaEvent('Purchase', {
    content_ids: args.productIds,
    content_type: 'product',
    num_items: args.numItems,
    value: toUsd(args.value),
    currency: CURRENCY,
  });
}

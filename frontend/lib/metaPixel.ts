/**
 * Thin wrapper around Meta Pixel's `fbq`. Safe to call from anywhere — if the
 * pixel hasn't loaded (SSR, ad-blocker), the call is a no-op.
 *
 * Currency is fixed to MAD since the storefront only ships in Morocco.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const CURRENCY = 'MAD';

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
    value: args.price,
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
    value: args.price * args.quantity,
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
    value: args.value,
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
    value: args.value,
    currency: CURRENCY,
  });
}

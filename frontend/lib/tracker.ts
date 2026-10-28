/**
 * First-party visitor tracking for the admin dashboard: which pages people
 * open, which products they click and view, what they add to the cart, and
 * how they reach out (WhatsApp, calls, chat). Anonymous: a random visitor id
 * kept in this browser, no names, no IP stored.
 *
 * Never tracked: the admin (anyone logged in to /admin on this browser),
 * automated browsers, and visitors who set localStorage "l7_no_track".
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Same key the old product-view tracker used, so returning visitors stay the same visitor.
const VISITOR_KEY = 'analytics_session_id';
const VISIT_KEY = 'l7_visit';
const ADMIN_TOKEN_KEY = 'wall-decoration-auth-token';

export type PageType = 'home' | 'shop' | 'product' | 'contact' | 'faq' | 'cart' | 'checkout' | 'customize';
export type SiteEventType = 'product_click' | 'add_to_cart' | 'whatsapp_click' | 'call_click' | 'instagram_click' | 'chat_open';

const PRODUCT_PATH = /^\/product\/([a-f\d]{24})(?:[/?#]|$)/i;

/** Storefront page type + product id for a path, or null for pages we don't count. */
export function pageOf(pathname: string): { pageType: PageType; productId?: string } | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { pageType: 'home' };
  const product = path.match(PRODUCT_PATH);
  if (product) return { pageType: 'product', productId: product[1] };
  const first = path.split('/')[1];
  const known: PageType[] = ['shop', 'contact', 'faq', 'cart', 'checkout', 'customize'];
  return (known as string[]).includes(first) ? { pageType: first as PageType } : null;
}

export function productIdFromHref(href: string): string | null {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return url.pathname.match(PRODUCT_PATH)?.[1] ?? null;
  } catch {
    return null;
  }
}

function storage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function enabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (navigator.webdriver) return false;
  if (window.location.pathname.startsWith('/admin')) return false;
  const local = storage('local');
  return !(local?.getItem(ADMIN_TOKEN_KEY) || local?.getItem('l7_no_track'));
}

function visitorId(): string {
  const local = storage('local');
  let id = local?.getItem(VISITOR_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    local?.setItem(VISITOR_KEY, id);
  }
  return id;
}

function device(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  const touch = window.matchMedia?.('(pointer: coarse)').matches;
  if (w < 768) return 'mobile';
  if (w < 1100 && touch) return 'tablet';
  return 'desktop';
}

/** Where this visit came from, e.g. "instagram", "google", "direct". */
function sourceOf(): string {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get('utm_source');
  if (utm) return utm;
  if (params.has('fbclid')) return 'facebook / instagram';
  if (params.has('gclid')) return 'google ads';
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (!ref || ref.host === window.location.host) return 'direct';
    const host = ref.hostname.replace(/^(www|m|l|lm)\./, '');
    if (/instagram\./.test(host)) return 'instagram';
    if (/facebook\.|fb\.com/.test(host)) return 'facebook';
    if (/google\./.test(host)) return 'google';
    if (/tiktok\./.test(host)) return 'tiktok';
    return host;
  } catch {
    return 'direct';
  }
}

/** Tracking must never break the shop: every failure is swallowed. */
function send(path: string, payload: Record<string, unknown>): void {
  const url = `${API_BASE_URL}${path}`;
  const body = JSON.stringify(payload);
  try {
    // text/plain keeps it a "simple" request: no preflight, and the beacon
    // still goes out when the visitor leaves for WhatsApp or another page.
    if (typeof Blob !== 'undefined' && navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain' }))) return;
  } catch {
    // fall through to fetch
  }
  try {
    if (typeof fetch === 'function') {
      fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true }).catch(() => {});
    }
  } catch {
    // ignore
  }
}

let lastPage = '';

/** Count a page view (once per path change). */
export function trackPage(pathname: string): void {
  try {
    if (!enabled() || pathname === lastPage) return;
    const page = pageOf(pathname);
    if (!page) return;
    lastPage = pathname;

    const session = storage('session');
    const landing = !session?.getItem(VISIT_KEY);
    if (landing) session?.setItem(VISIT_KEY, '1');

    send('/api/analytics/track', {
      ...page,
      path: pathname.slice(0, 200),
      sessionId: visitorId(),
      device: device(),
      ...(landing ? { landing: true, source: sourceOf() } : {}),
    });
  } catch {
    // never let tracking break a page
  }
}

/** Count a click or action. */
export function trackEvent(type: SiteEventType, productId?: string): void {
  try {
    if (!enabled()) return;
    send('/api/analytics/event', {
      type,
      productId,
      page: pageOf(window.location.pathname)?.pageType,
      sessionId: visitorId(),
      device: device(),
    });
  } catch {
    // never let tracking break a click
  }
}

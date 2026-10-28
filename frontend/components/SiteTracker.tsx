'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { productIdFromHref, trackEvent, trackPage } from '@/lib/tracker';

/**
 * Counts page views on every storefront page and the clicks that matter
 * (product cards, WhatsApp, calls, Instagram) with one delegated listener,
 * so no component has to remember to report its own links.
 */
export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackPage(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (/^https?:\/\/(api\.)?(wa\.me|whatsapp\.com)/i.test(href) || href.includes('api.whatsapp.com')) trackEvent('whatsapp_click');
      else if (href.startsWith('tel:')) trackEvent('call_click');
      else if (/instagram\.com/i.test(href)) trackEvent('instagram_click');
      else {
        const productId = productIdFromHref(href);
        // A link to the product page you're already on isn't a new click.
        if (productId && !window.location.pathname.includes(productId)) trackEvent('product_click', productId);
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}

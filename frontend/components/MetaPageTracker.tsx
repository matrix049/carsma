'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaPageTracker() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    // The base snippet already fires PageView on initial load — only re-fire
    // for SPA navigations after that.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.fbq?.('track', 'PageView');
  }, [pathname]);

  return null;
}

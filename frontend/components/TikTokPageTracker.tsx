'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    ttq?: { page: () => void };
  }
}

export default function TikTokPageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    window.ttq?.page();
  }, [pathname]);

  return null;
}

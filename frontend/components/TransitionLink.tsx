'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Same-document View Transitions for App Router navigations.
 *
 * TransitionLink wraps router.push in document.startViewTransition and keeps
 * the transition open until the new route has committed (the resolver below
 * sees the pathname change). The clicked card's image — marked with
 * `data-vt-img` — gets the shared `car-hero` name, so it morphs into the
 * product page's hero image, which carries the same name (`data-vt-hero`).
 * Browsers without the API (or users with reduced motion) get a normal link.
 */

let pendingResolve: (() => void) | null = null;

/** Mounted once in the storefront shell. */
export function ViewTransitionResolver() {
  const pathname = usePathname();
  useEffect(() => {
    pendingResolve?.();
  }, [pathname]);
  return null;
}

type DocumentWithVT = Document & {
  startViewTransition?: (update: () => Promise<void>) => unknown;
};

type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string };

export default function TransitionLink({ href, onClick, children, ...rest }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === pathname) return;

    const doc = document as DocumentWithVT;
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    e.preventDefault();

    // Exactly one element may own the shared name at capture time.
    document.querySelectorAll<HTMLElement>('[data-vt-hero]').forEach((el) => {
      el.style.setProperty('view-transition-name', 'none');
    });
    const img = e.currentTarget.querySelector<HTMLElement>('[data-vt-img]');
    if (img) img.style.setProperty('view-transition-name', 'car-hero');

    doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          const done = () => {
            window.clearTimeout(timer);
            if (pendingResolve === done) pendingResolve = null;
            resolve();
          };
          // Never freeze the page for long if the route is slow to commit.
          const timer = window.setTimeout(done, 1500);
          pendingResolve = done;
          router.push(href);
        }),
    );
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

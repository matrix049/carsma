'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * SmoothScroll — Lenis-driven smooth scroll that's wired through GSAP's ticker
 * so ScrollTrigger pins/scrubs stay perfectly in sync.
 *
 * Mounts Lenis on the window and shares a single rAF loop with GSAP. Disables
 * itself for users who prefer reduced motion so the experience falls back to
 * native scroll.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // Smooth wheel + touchpad. We leave touch (mobile finger) on native to
      // avoid fighting with iOS momentum scroll.
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Keep ScrollTrigger in lockstep with Lenis's frame.
    const update = () => ScrollTrigger.update();
    lenis.on('scroll', update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', update);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

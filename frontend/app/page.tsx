'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/apiServices';
import WheelLoader from '@/components/WheelLoader';
import PorscheIntro from '@/components/PorscheIntro';

/* ----------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------*/

// useLayoutEffect runs synchronously before paint — but it warns on the server.
// This iso pattern keeps it on the client and silently degrades on the server.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * SplitText — splits a string into per-character spans wrapped in an
 * overflow-hidden line, so a transform-from-below animation reads as a
 * curtain-drop instead of a generic fade.
 */
function SplitText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`split-line block overflow-hidden ${className}`}
      aria-label={text}
    >
      <span className="block">
        {text.split('').map((c, i) => (
          <span
            key={i}
            className="split-char inline-block will-change-transform"
            aria-hidden="true"
          >
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products
  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Master GSAP timeline (hero entrance + scroll-triggered reveals)
  useIsoLayoutEffect(() => {
    if (!rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        // Skip motion — show the final state immediately
        gsap.set(
          [
            '.hero-kicker',
            '.hero-tagline',
            '.hero-cta',
            '.hero-meta',
            '.hero-scroll',
            '.split-char',
            '[data-reveal]',
          ],
          { opacity: 1, y: 0, yPercent: 0 },
        );
        return;
      }

      // ── Hero entrance ──────────────────────────────────────────────────
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from('.hero-kicker', {
        opacity: 0,
        y: 12,
        duration: 0.6,
        ease: 'power2.out',
      })
        .from(
          '.hero-headline .split-char',
          {
            yPercent: 115,
            opacity: 0,
            duration: 0.95,
            stagger: 0.022,
            ease: 'power3.out',
          },
          '<+=0.05',
        )
        .from(
          '.hero-tagline',
          { opacity: 0, y: 16, duration: 0.7, ease: 'power2.out' },
          '-=0.4',
        )
        .from(
          '.hero-cta > *',
          {
            opacity: 0,
            y: 16,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.5',
        )
        .from(
          '.hero-meta > *',
          {
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.3',
        )
        .from(
          '.hero-scroll',
          { opacity: 0, y: -8, duration: 0.5, ease: 'power2.out' },
          '-=0.3',
        );

      // Slow ambient pan on the dot grid (the only "loop" — keeps cost low)
      gsap.to('.bg-dotgrid', {
        backgroundPosition: '24px 24px',
        ease: 'none',
        duration: 8,
        repeat: -1,
      });

      // ── Reveal-on-scroll: simple fade + slide up ──────────────────────
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 85%' },
          opacity: 0,
          y: 30,
          duration: 0.85,
          ease: 'power3.out',
        });
      });

      // Closing headline — letter-by-letter on scroll-in
      gsap.from('.closing-headline .split-char', {
        scrollTrigger: { trigger: '.closing-headline', start: 'top 78%' },
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.018,
        ease: 'power3.out',
      });
    }, rootRef);

    // After fonts swap in (Anton is loaded async), trigger positions can
    // shift — refresh ScrollTrigger so triggers re-measure correctly.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => ctx.revert();
  }, []);

  // Stagger product entrance once the data is in (the cards aren't in the
  // DOM during the master timeline, so this runs separately).
  useEffect(() => {
    if (isLoading) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.product-card',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.products-grid',
            start: 'top 85%',
          },
        },
      );
    }, rootRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [isLoading]);

  return (
    <>
      <PorscheIntro />
      <div ref={rootRef} className="bg-black text-white">
        {/* ───────────────────────────────────────────────────────────────
         * HERO
         * ───────────────────────────────────────────────────────────── */}
        <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
          {/* Subtle dot grid — ambient urban texture */}
          <div
            className="bg-dotgrid absolute inset-0 will-change-[background-position]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Soft blue spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.16)_0%,_transparent_55%)]" />
          {/* Film grain */}
          <div className="grain absolute inset-0" />
          {/* Bottom fade into next section */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />

          {/* Corner meta */}
          <div className="hero-meta pointer-events-none absolute top-28 left-6 right-6 z-10 flex items-center justify-between text-white/45 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-white/30" />
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase">
                N° 001 / Noir
              </span>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase">
                L7it studio — Rabat
              </span>
              <div className="h-px w-10 bg-white/30" />
            </div>
          </div>

          {/* Center copy */}
          <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
            <div className="w-full max-w-7xl">
              <div className="hero-kicker mb-8 inline-flex items-center gap-3 text-blue-500">
                <span className="h-px w-8 bg-blue-500/60" />
                <span className="font-mono text-[10px] tracking-[0.5em] uppercase">
                  Premium / Wall art
                </span>
                <span className="h-px w-8 bg-blue-500/60" />
              </div>

              <h1 className="hero-headline font-display uppercase leading-[0.84] tracking-tight text-white">
                <SplitText
                  text="WALL"
                  className="text-[clamp(5rem,17vw,15rem)]"
                />
                <SplitText
                  text="ART."
                  className="bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-[clamp(5rem,17vw,15rem)] text-transparent"
                />
              </h1>

              <p className="hero-tagline mx-auto mt-10 max-w-xl text-base font-medium leading-relaxed text-zinc-400 md:text-lg">
                Numbered, hand-drawn automotive prints — bolted to the wall,
                made in Rabat.
              </p>

              <div className="hero-cta mt-12 flex flex-col items-center justify-center gap-6 md:flex-row">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-xs font-black uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-blue-500 hover:text-white active:scale-95"
                >
                  Explore Collection
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
                <Link
                  href="/customize"
                  className="group inline-flex items-center gap-2 px-2 py-2 text-xs font-black uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
                >
                  <span>Custom Request</span>
                  <span className="block h-px w-8 origin-left bg-current transition-transform duration-300 group-hover:scale-x-150" />
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="hero-scroll pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/35">
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase">
              scroll
            </span>
            <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────
         * FEATURED COLLECTION
         * ───────────────────────────────────────────────────────────── */}
        <section className="px-6 py-32 md:py-40">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div
                  data-reveal
                  className="mb-4 flex items-center gap-3 text-blue-500"
                >
                  <div className="h-px w-10 bg-blue-500/60" />
                  <span className="font-mono text-[10px] tracking-[0.5em] uppercase">
                    The Collection
                  </span>
                </div>
                <h2
                  data-reveal
                  className="font-display text-[clamp(2.75rem,9vw,8.5rem)] uppercase leading-[0.85] tracking-tight"
                >
                  Featured.
                </h2>
              </div>
              <Link
                data-reveal
                href="/shop"
                className="group inline-flex items-center gap-3 self-start text-xs font-black uppercase tracking-[0.25em] text-blue-500 transition-colors hover:text-blue-400 md:self-end"
              >
                See all
                <span className="block h-px w-10 origin-left bg-current transition-transform duration-300 group-hover:scale-x-150" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <WheelLoader size="lg" />
              </div>
            ) : (
              <div className="products-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 6).map((p) => (
                  <div
                    key={p._id}
                    className="product-card opacity-0"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────
         * CLOSING — bring car / build wall
         * ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 py-32 md:py-48">
          <div className="grain absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.14)_0%,_transparent_60%)]" />

          <div className="relative mx-auto max-w-6xl text-center">
            <div
              data-reveal
              className="mb-8 inline-flex items-center gap-3 text-blue-500"
            >
              <div className="h-px w-10 bg-blue-500/60" />
              <span className="font-mono text-[10px] tracking-[0.5em] uppercase">
                Make it personal
              </span>
              <div className="h-px w-10 bg-blue-500/60" />
            </div>

            <h2 className="closing-headline font-display uppercase leading-[0.85] tracking-tight">
              <SplitText
                text="BRING THE CAR."
                className="text-[clamp(2.5rem,10vw,9rem)]"
              />
              <SplitText
                text="WE BUILD"
                className="text-[clamp(2.5rem,10vw,9rem)]"
              />
              <SplitText
                text="THE WALL."
                className="bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-[clamp(2.5rem,10vw,9rem)] text-transparent"
              />
            </h2>

            <p
              data-reveal
              className="mx-auto mt-10 max-w-xl text-base font-medium leading-relaxed text-zinc-400 md:text-lg"
            >
              Send the angle. Send the color. We&apos;ll draw it, print it, and
              ship it. Numbered for you.
            </p>

            <div
              data-reveal
              className="mt-12 flex flex-col items-center justify-center gap-6 md:flex-row"
            >
              <Link
                href="/customize"
                className="group inline-flex items-center gap-3 rounded-full bg-blue-600 px-10 py-5 text-xs font-black uppercase tracking-[0.25em] text-white transition-all duration-300 hover:bg-blue-500 active:scale-95"
              >
                Request Custom Art
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 px-2 py-2 text-xs font-black uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
              >
                Or browse collection
                <span className="block h-px w-8 origin-left bg-current transition-transform duration-300 group-hover:scale-x-150" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

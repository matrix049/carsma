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
import PorscheCar from '@/components/PorscheCar';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ----------------------------------------------------------------------------
 * Reusable button styles — slightly rounded, large padding, premium hover.
 * Defined once so every CTA on the page reads the same.
 * --------------------------------------------------------------------------*/

const btnPrimary =
  'group inline-flex items-center justify-center gap-3 rounded-md bg-white px-12 py-5 text-sm font-bold uppercase tracking-[0.18em] text-black transition-all duration-300 hover:scale-[1.04] hover:opacity-95 active:scale-[1.00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

const btnAccent =
  'group inline-flex items-center justify-center gap-3 rounded-md bg-blue-600 px-12 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:scale-[1.04] hover:bg-blue-500 active:scale-[1.00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

const btnGhost =
  'group inline-flex items-center justify-center gap-3 rounded-md border border-white/30 bg-transparent px-12 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:scale-[1.04] hover:border-white/60 hover:bg-white/[0.04] active:scale-[1.00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

const ArrowRight = () => (
  <svg
    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // If /porsche-911.png hasn't been added to /public yet, fall back to the
  // hand-drawn SVG silhouette so the hero never breaks.
  const [imgFailed, setImgFailed] = useState(false);

  // Load products
  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Hero entrance + simple section reveals (no scroll hijacking)
  useIsoLayoutEffect(() => {
    if (!rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(['.porsche', '.hero-text > *', '[data-reveal]'], {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: 'none',
        });
        return;
      }

      // 1. Porsche slide-in: left → right, decelerating, with a brief
      //    motion-blur tail that clears as it settles.
      gsap.fromTo(
        '.porsche',
        {
          xPercent: -110,
          opacity: 0.4,
          filter: 'blur(8px)',
          scale: 1.04,
        },
        {
          xPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 2.6,
          ease: 'expo.out',
        },
      );

      // 2. Hero text reveals — softer fade-up, slightly behind the Porsche
      //    so they read in sequence.
      gsap.from('.hero-text > *', {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.12,
        delay: 0.55,
        ease: 'power3.out',
      });

      // 3. Section reveals — generic [data-reveal] elements get a single
      //    fade + slide on first entry. No scrub. No pinning.
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
    }, rootRef);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => ctx.revert();
  }, []);

  // Stagger the product grid once data lands
  useEffect(() => {
    if (isLoading || products.length === 0) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        opacity: 0,
        y: 40,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.products-grid', start: 'top 80%' },
      });
    }, rootRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [isLoading, products.length]);

  return (
    <div ref={rootRef} className="bg-black text-white">
      {/* ─────────────────────────────────────────────────────────────────
       * HERO — full-screen, single cinematic moment
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black">
        {/* Ambient dot grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Soft blue spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.14)_0%,_transparent_60%)]" />
        {/* Film grain */}
        <div className="grain absolute inset-0" />

        {/* Top corner meta */}
        <div className="pointer-events-none absolute top-28 left-6 right-6 z-20 flex items-center justify-between text-white/40 lg:px-6">
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

        {/* Centered hero content — Porsche stacks above the headline */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
          {/* Porsche — slides L → R on load. The wrapper takes the GSAP
              transform; the photo (or SVG fallback) sits inside undisturbed. */}
          <div className="porsche mb-4 flex w-full justify-center will-change-transform md:mb-6">
            {imgFailed ? (
              <div className="w-full max-w-3xl px-6">
                <PorscheCar />
              </div>
            ) : (
              <img
                src="/porsche-911.png"
                alt="Porsche 911"
                loading="eager"
                draggable={false}
                onError={() => setImgFailed(true)}
                className="block h-auto max-h-[42vh] w-auto max-w-3xl select-none object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:max-h-[48vh] md:max-w-4xl"
              />
            )}
          </div>

          {/* Hero text */}
          <div className="hero-text flex flex-col items-center text-center">
            <span className="mb-6 font-mono text-[10px] tracking-[0.5em] text-blue-500 uppercase md:mb-8">
              Premium / Wall art
            </span>
            <h1 className="font-display text-balance text-[clamp(4rem,14vw,12rem)] uppercase leading-[0.85] tracking-tight text-white">
              Wall Art.
            </h1>
            <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-zinc-400 md:mt-8 md:text-lg">
              Numbered automotive prints. Hand-drawn, made in Rabat.
            </p>
            <div className="mt-10 md:mt-12">
              <Link href="/shop" className={btnPrimary}>
                Explore Collection
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/35">
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase">
            scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * FEATURED COLLECTION — clean grid, simple stagger reveal
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
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
                className="font-display text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.85] tracking-tight"
              >
                Featured.
              </h2>
            </div>
            <Link data-reveal href="/shop" className={`${btnGhost} self-start md:self-end`}>
              See all
              <ArrowRight />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <WheelLoader size="lg" />
            </div>
          ) : (
            <div className="products-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((p) => (
                <div key={p._id} className="product-card">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * CLOSING CTA — bold headline, twin buttons
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-24 md:py-40">
        <div className="grain absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.10)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl text-center">
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

          <h2
            data-reveal
            className="font-display text-balance text-[clamp(2.5rem,9vw,9rem)] uppercase leading-[0.85] tracking-tight text-white"
          >
            Bring the car.
            <br />
            We build the wall.
          </h2>

          <p
            data-reveal
            className="mx-auto mt-10 max-w-xl text-base font-medium leading-relaxed text-zinc-400 md:text-lg"
          >
            Send the angle, send the color. We&apos;ll draw it, print it, and
            ship it. Numbered for you.
          </p>

          <div
            data-reveal
            className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6"
          >
            <Link href="/customize" className={btnAccent}>
              Request Custom Art
              <ArrowRight />
            </Link>
            <Link href="/shop" className={btnGhost}>
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

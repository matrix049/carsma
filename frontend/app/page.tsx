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
import SmoothScroll from '@/components/SmoothScroll';

/* ----------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------*/

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * SplitText — per-character spans inside an overflow-hidden line.
 * Pairs with a yPercent: 110 → 0 GSAP tween for a curtain-drop reveal.
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

  // Master GSAP setup. Re-runs when products load so the horizontal showcase
  // can read the actual slide list.
  useIsoLayoutEffect(() => {
    if (!rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [
            '.hero-kicker',
            '.hero-tagline',
            '.hero-cta',
            '.hero-meta',
            '.hero-scroll',
            '.split-char',
            '[data-reveal]',
            '.product-card',
            '.manifesto-word',
          ],
          { opacity: 1, y: 0, yPercent: 0, scale: 1, clipPath: 'none' },
        );
        return;
      }

      const mm = gsap.matchMedia();

      // ── Hero entrance (always plays) ──────────────────────────────────
      const intro = gsap.timeline({ delay: 0.25 });
      intro
        .from('.hero-kicker', {
          opacity: 0,
          y: 12,
          duration: 0.6,
          ease: 'power2.out',
        })
        .from(
          '.hero-headline .split-char',
          {
            yPercent: 130,
            opacity: 0,
            duration: 1,
            stagger: 0.025,
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
          { opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
          '-=0.3',
        )
        .from(
          '.hero-scroll',
          { opacity: 0, y: -8, duration: 0.5, ease: 'power2.out' },
          '-=0.3',
        );

      // Slow ambient pan on the dot grid
      gsap.to('.bg-dotgrid', {
        backgroundPosition: '24px 24px',
        ease: 'none',
        duration: 8,
        repeat: -1,
      });

      // ── Hero scroll-driven SCALE-AND-REVEAL ──────────────────────────
      // As the user scrolls the hero out, the headline scales up and fades,
      // and the hero image bleeds through at full opacity behind it.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '+=110%',
            scrub: 1,
            pin: true,
            pinSpacing: true,
          },
        })
        .to('.hero-content', { scale: 4.2, opacity: 0, ease: 'power2.in' }, 0)
        .to('.hero-image', { opacity: 0.85, scale: 1.06, ease: 'power1.out' }, 0)
        .to('.bg-dotgrid', { opacity: 0, ease: 'none' }, 0)
        .to('.hero-spotlight', { opacity: 0, ease: 'none' }, 0);

      // ── HORIZONTAL PINNED SHOWCASE ───────────────────────────────────
      // Desktop: pin + scrub horizontally through slides.
      // Mobile: skip the pin — fall back to native horizontal scroll-snap.
      mm.add('(min-width: 769px)', () => {
        const slides = gsap.utils.toArray<HTMLElement>('.h-slide');
        if (slides.length === 0) return;

        const totalScroll = (slides.length - 1) * window.innerHeight;

        const horizontalTween = gsap.to('.h-track', {
          x: () => -((slides.length - 1) * window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: '.horizontal-section',
            start: 'top top',
            end: () => `+=${totalScroll}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // Subtle scrub-tied parallax on each slide's image — drives the
        // image counter to its product as the slide passes through.
        slides.forEach((slide) => {
          const img = slide.querySelector('.h-img');
          if (!img) return;
          gsap.fromTo(
            img,
            { xPercent: 12 },
            {
              xPercent: -12,
              ease: 'none',
              scrollTrigger: {
                trigger: slide,
                containerAnimation: horizontalTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );

          const num = slide.querySelector('.h-num');
          if (num) {
            gsap.fromTo(
              num,
              { yPercent: 8, opacity: 0.4 },
              {
                yPercent: 0,
                opacity: 1,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: slide,
                  containerAnimation: horizontalTween,
                  start: 'left center',
                  end: 'center center',
                  scrub: true,
                },
              },
            );
          }
        });

        return () => {
          // matchMedia cleanup — gsap.context handles this for us, but the
          // explicit return keeps the API symmetric.
        };
      });

      // ── KINETIC MARQUEES — react to scroll velocity ──────────────────
      const marquees = gsap.utils.toArray<HTMLElement>('.kinetic-marquee');
      marquees.forEach((m, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        const baseTween = gsap.to(m, {
          xPercent: dir * 50,
          ease: 'none',
          duration: 28,
          repeat: -1,
        });
        baseTween.timeScale(dir);

        let idleTimeout: number | undefined;
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const v = self.getVelocity();
            // Sign follows scroll direction so up-scroll reverses the band.
            const ts =
              dir *
              (v >= 0 ? 1 : -1) *
              Math.min(1 + Math.abs(v) / 600, 5);
            gsap.to(baseTween, {
              timeScale: ts,
              duration: 0.5,
              overwrite: true,
            });

            window.clearTimeout(idleTimeout);
            idleTimeout = window.setTimeout(() => {
              gsap.to(baseTween, {
                timeScale: dir,
                duration: 1,
                overwrite: true,
              });
            }, 220);
          },
        });
      });

      // ── MANIFESTO — scrubbed word-by-word brightening ────────────────
      gsap.fromTo(
        '.manifesto-word',
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.18,
          scrollTrigger: {
            trigger: '.manifesto-line',
            start: 'top 75%',
            end: 'bottom 50%',
            scrub: 0.6,
          },
        },
      );

      // ── Generic data-reveal (fade + slide up) ────────────────────────
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 85%' },
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: 'power3.out',
        });
      });

      // ── Closing letter-by-letter ─────────────────────────────────────
      gsap.from('.closing-headline .split-char', {
        scrollTrigger: { trigger: '.closing-headline', start: 'top 78%' },
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.018,
        ease: 'power3.out',
      });
    }, rootRef);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => ctx.revert();
  }, [products.length]);

  // Stagger product entrance with clip-path mask reveal — runs separately so
  // it can pick up product cards once they actually mount.
  useEffect(() => {
    if (isLoading || products.length === 0) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.product-card',
        {
          opacity: 0,
          y: 40,
          clipPath: 'inset(20% 20% 20% 20%)',
        },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1,
          stagger: 0.09,
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
  }, [isLoading, products.length]);

  // First slides for the horizontal showcase — fall back to a placeholder set
  // if API hasn't returned yet so the layout doesn't shift catastrophically.
  const showcaseSlides =
    products.length >= 4
      ? products.slice(0, Math.min(5, products.length))
      : products;

  return (
    <>
      <PorscheIntro />
      <SmoothScroll>
        <div ref={rootRef} className="overflow-x-hidden bg-black text-white">
          {/* ─────────────────────────────────────────────────────────────
           * HERO — pinned, scale + opacity scrub reveals the bg image
           * ─────────────────────────────────────────────────────────── */}
          <section className="hero relative h-[100svh] min-h-[640px] w-full overflow-hidden">
            {/* Dot grid — ambient texture */}
            <div
              className="bg-dotgrid absolute inset-0 will-change-[background-position,opacity]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Soft spotlight */}
            <div className="hero-spotlight absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.18)_0%,_transparent_55%)]" />
            {/* Grain */}
            <div className="grain absolute inset-0" />

            {/* Hero image — fades in on scroll-out */}
            <div className="hero-image absolute inset-0 z-[1] opacity-0">
              <img
                src="/hero_premium.png"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
            </div>

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
            <div className="hero-content relative z-10 flex h-full w-full items-center justify-center px-6 text-center will-change-transform">
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

          {/* ─────────────────────────────────────────────────────────────
           * HORIZONTAL PINNED SHOWCASE
           * Desktop: pinned + scrubbed.  Mobile: native scroll-snap row.
           * ─────────────────────────────────────────────────────────── */}
          <section className="horizontal-section relative h-[100svh] w-full overflow-hidden bg-black md:overflow-hidden max-md:h-auto max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory">
            {showcaseSlides.length > 0 ? (
              <div
                className="h-track flex h-full will-change-transform max-md:w-max"
                style={{ width: `${showcaseSlides.length * 100}vw` }}
              >
                {showcaseSlides.map((p, i) => (
                  <div
                    key={p._id}
                    className="h-slide relative h-[100svh] w-screen flex-shrink-0 max-md:snap-center"
                  >
                    {/* Slide bg image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={p.image}
                        alt=""
                        className="h-img absolute inset-0 h-full w-[120%] -translate-x-[5%] object-cover opacity-30 saturate-[0.7] will-change-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />
                    </div>

                    {/* Slide content */}
                    <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                      <div className="font-mono text-xs uppercase tracking-[0.5em] text-blue-500">
                        N° {String(i + 1).padStart(2, '0')} /{' '}
                        {String(showcaseSlides.length).padStart(2, '0')}
                      </div>
                      <div className="h-num font-display text-[clamp(8rem,28vw,28rem)] leading-[0.8] tracking-tighter text-white/90 mt-4 will-change-transform">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <h3 className="font-display text-[clamp(1.5rem,3.5vw,3rem)] uppercase tracking-tight text-white mt-2 max-w-3xl">
                        {p.name}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 mt-4">
                        Limited Edition / 1 of 50
                      </p>
                      <Link
                        href={`/product/${p._id}`}
                        className="group mt-10 inline-flex items-center gap-3 rounded-full border border-white/30 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:border-blue-500 hover:bg-blue-500"
                      >
                        View Edition
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
                    </div>

                    {/* Slide index marker — top right */}
                    <div className="absolute top-12 right-6 z-10 hidden items-center gap-3 text-white/35 md:flex lg:right-12">
                      <span className="font-mono text-[10px] tracking-[0.4em] uppercase">
                        Showcase / {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="h-px w-10 bg-white/25" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <WheelLoader size="lg" />
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────────────────────────────
           * KINETIC MARQUEE BAND
           * Two opposing tracks that react to scroll velocity.
           * ─────────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden border-y border-white/5 py-12 md:py-20">
            <div className="space-y-2 md:space-y-4">
              <div className="overflow-hidden">
                <div className="kinetic-marquee flex w-max items-center gap-12 whitespace-nowrap will-change-transform">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={`a-${i}`}
                      className="font-display text-[clamp(3rem,9vw,9rem)] uppercase tracking-tight text-white"
                    >
                      WALL ART
                      <span className="mx-6 inline-block text-blue-500">✦</span>
                      L7IT STUDIO
                      <span className="mx-6 inline-block text-blue-500">✦</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="kinetic-marquee flex w-max items-center gap-12 whitespace-nowrap will-change-transform">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={`b-${i}`}
                      className="font-display text-[clamp(3rem,9vw,9rem)] uppercase tracking-tight text-white/30"
                    >
                      Numbered editions
                      <span className="mx-6 inline-block text-blue-500/60">●</span>
                      Made in Rabat
                      <span className="mx-6 inline-block text-blue-500/60">●</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
           * MANIFESTO — scrubbed word-by-word brightening
           * ─────────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden py-32 md:py-48">
            <div className="grain absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.08)_0%,_transparent_50%)]" />

            <div className="relative mx-auto max-w-6xl px-6">
              <div
                data-reveal
                className="mb-16 flex items-center gap-3 text-blue-500"
              >
                <div className="h-px w-12 bg-blue-500/60" />
                <span className="font-mono text-[10px] tracking-[0.5em] uppercase">
                  Manifesto / 02
                </span>
              </div>

              <p className="manifesto-line font-display text-[clamp(2rem,5.5vw,5.5rem)] uppercase leading-[0.95] tracking-tight text-white">
                {'Drawn by hand. Numbered for the few. Bolted to the wall.'
                  .split(' ')
                  .map((w, i) => (
                    <span
                      key={i}
                      className="manifesto-word inline-block mr-3 will-change-[opacity]"
                    >
                      {w}
                    </span>
                  ))}
              </p>

              <div
                data-reveal
                className="mt-20 grid grid-cols-1 gap-12 border-t border-white/10 pt-12 md:grid-cols-3"
              >
                {[
                  { k: 'Stat / 01', n: '120', s: 'cm gallery format' },
                  { k: 'Stat / 02', n: '1 / 50', s: 'numbered editions' },
                  { k: 'Stat / 03', n: '∞', s: 'pixels redrawn' },
                ].map((row, i) => (
                  <div key={i} className="space-y-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-blue-500/80">
                      {row.k}
                    </span>
                    <div className="font-display text-7xl tracking-tight text-white md:text-8xl">
                      {row.n}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-zinc-400">
                      {row.s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
           * FEATURED COLLECTION — clip-path mask reveal stagger
           * ─────────────────────────────────────────────────────────── */}
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
                      style={{ willChange: 'transform, opacity, clip-path' }}
                    >
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
           * CLOSING — letter-by-letter on scroll
           * ─────────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden px-6 py-32 md:py-48">
            <div className="grain absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.16)_0%,_transparent_60%)]" />

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
                Send the angle. Send the color. We&apos;ll draw it, print it,
                and ship it. Numbered for you.
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
      </SmoothScroll>
    </>
  );
}

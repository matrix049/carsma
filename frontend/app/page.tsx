'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard, { hideBrokenImage } from '@/components/ProductCard';
import TransitionLink from '@/components/TransitionLink';
import NightDrive from '@/components/NightDrive';
import Plate from '@/components/Plate';
import BrandLogo from '@/components/BrandLogo';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { ProductCardSkeleton } from '@/components/Loader';
import { fetchProducts, Product } from '@/lib/apiServices';
import { btnPrimary, btnGhostDark, kickerLabel, h2Display, whatsappLink } from '@/lib/uiStyles';
import { applyPin } from '@/lib/pinnedProducts';
import { NEW_EDITIONS, NewEdition, matchEditions, isNewEdition } from '@/lib/newEditions';
import DuoOffer from '@/components/DuoOffer';
import { brandOf, findBrand } from '@/lib/brands';
import { dimensionsOf } from '@/lib/dimensions';
import { isAvailable, piecesLeft } from '@/lib/stock';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const Arrow = () => (
  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h15" />
  </svg>
);

/** Brands shown before the catalogue has loaded. */
const FALLBACK_BRANDS = ['Porsche', 'Mercedes', 'BMW', 'Audi'];

/* ----------------------------------------------------------------------------
 * Brand rail — emblems along the bottom of the hero, each one a filtered shop
 * --------------------------------------------------------------------------*/

/** Each copy of the row holds at least this many logos, so it's wider than any screen. */
const RAIL_MIN_ITEMS = 14;
/** Seconds each logo adds to one full loop of the slide. */
const RAIL_SECONDS_PER_ITEM = 2.6;
/** The slide picks up again this long after the visitor lets go. */
const RAIL_RESUME_MS = 2500;
/** A press has to move this far to be a drag; less is a tap on the logo. */
const RAIL_DRAG_SLOP_PX = 6;

function BrandRail({ categories }: { categories: string[] }) {
  const repeats = Math.max(1, Math.ceil(RAIL_MIN_ITEMS / categories.length));
  const row = Array.from({ length: repeats }, () => categories).flat();
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Slides by itself until the visitor takes over: drag with the mouse or swipe
  // with a finger, and a flick keeps going for a moment. The track holds two
  // identical copies and x wraps at one copy's width, so it never runs out.
  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    const copy = track?.firstElementChild;
    if (!rail || !track || !copy) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let x = 0;
    let velocity = 0;
    let pausedUntil = 0;
    let hovered = false;
    let focused = false;
    let onScreen = !('IntersectionObserver' in window);
    let pressed = false;
    let dragged = false;
    let pointerId = 0;
    let startX = 0;
    let lastX = 0;
    let lastTime = 0;
    let lastFrame = performance.now();
    let raf = 0;

    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => (onScreen = e.isIntersecting)) : null;
    io?.observe(rail);

    const frame = (now: number) => {
      const dt = Math.min(now - lastFrame, 50) / 1000;
      lastFrame = now;
      const width = copy.getBoundingClientRect().width;
      if (width > 0) {
        if (!pressed && onScreen) {
          if (Math.abs(velocity) > 20) {
            x += velocity * dt;
            velocity *= Math.exp(-3.5 * dt);
            pausedUntil = now + RAIL_RESUME_MS;
          } else if (!hovered && !focused && now >= pausedUntil) {
            x += (width / (row.length * RAIL_SECONDS_PER_ITEM)) * dt;
          }
        }
        x = ((x % width) + width) % width;
        track.style.transform = `translate3d(${-x}px,0,0)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const press = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pressed = true;
      dragged = false;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      lastTime = e.timeStamp;
      velocity = 0;
    };
    const move = (e: PointerEvent) => {
      if (!pressed || e.pointerId !== pointerId) return;
      if (!dragged) {
        if (Math.abs(e.clientX - startX) < RAIL_DRAG_SLOP_PX) return;
        dragged = true;
        rail.setPointerCapture(e.pointerId);
      }
      const dx = e.clientX - lastX;
      x -= dx;
      velocity = 0.7 * velocity + 0.3 * ((-dx * 1000) / Math.max(e.timeStamp - lastTime, 1));
      lastX = e.clientX;
      lastTime = e.timeStamp;
    };
    const release = (e: PointerEvent) => {
      if (!pressed || e.pointerId !== pointerId) return;
      pressed = false;
      // Held still before letting go: that's a stop, not a flick.
      if (e.timeStamp - lastTime > 100) velocity = 0;
      pausedUntil = performance.now() + RAIL_RESUME_MS;
    };
    // Keeps the browser from dragging the link itself, selecting text, or
    // focusing the logo (which would hold the slide paused).
    const mouseDown = (e: MouseEvent) => e.preventDefault();
    // Letting go after a drag must not open the logo it ended on.
    const click = (e: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') hovered = true;
    };
    const leave = () => (hovered = false);
    const focusIn = () => (focused = true);
    const focusOut = () => (focused = false);

    rail.addEventListener('pointerdown', press);
    rail.addEventListener('pointermove', move);
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('pointerenter', enter);
    rail.addEventListener('pointerleave', leave);
    rail.addEventListener('mousedown', mouseDown);
    rail.addEventListener('click', click, true);
    rail.addEventListener('focusin', focusIn);
    rail.addEventListener('focusout', focusOut);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      rail.removeEventListener('pointerdown', press);
      rail.removeEventListener('pointermove', move);
      rail.removeEventListener('pointerup', release);
      rail.removeEventListener('pointercancel', release);
      rail.removeEventListener('pointerenter', enter);
      rail.removeEventListener('pointerleave', leave);
      rail.removeEventListener('mousedown', mouseDown);
      rail.removeEventListener('click', click, true);
      rail.removeEventListener('focusin', focusIn);
      rail.removeEventListener('focusout', focusOut);
    };
  }, [row.length]);

  const item = (category: string, focusable: boolean) => {
    const brand = findBrand(category);
    return (
      <Link
        href={`/shop?category=${encodeURIComponent(category)}`}
        tabIndex={focusable ? undefined : -1}
        className="group flex h-full min-w-[96px] flex-col items-center gap-2.5 rounded-2xl px-4 py-3 text-silver transition-colors hover:bg-white/[0.05] hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon sm:min-w-[120px]"
      >
        <BrandLogo brand={brand ?? category} className="h-8 w-8 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-9 sm:w-9" />
        <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-smoke transition-colors group-hover:text-silver-light">
          {brand?.name ?? category}
        </span>
      </Link>
    );
  };

  return (
    <nav aria-label="Shop by brand" className="w-full">
      <p className="mb-4 text-center font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-smoke">
        Shop by brand <span className="font-ar normal-case tracking-normal">· اختار الماركا</span>
      </p>

      {/* Endless slide — two identical copies. Pauses on hover/focus; grab it to move it by hand. */}
      <div
        ref={railRef}
        className="relative cursor-grab touch-pan-y select-none overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] active:cursor-grabbing motion-reduce:hidden [&_a]:cursor-[inherit]"
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-stretch gap-2 pr-2 sm:gap-4 sm:pr-4">
              {row.map((category, i) => (
                <li key={`${category}-${i}`}>{item(category, copy === 0 && i < categories.length)}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Reduced motion: a still, scrollable row */}
      <div className="no-scrollbar hidden overflow-x-auto motion-reduce:block">
        <ul className="mx-auto flex w-max items-stretch gap-2 px-6 sm:gap-3">
          {categories.map((category) => (
            <li key={category}>{item(category, true)}</li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------------------
 * New drops — the two 3D editions, unveiled like a car launch
 * --------------------------------------------------------------------------*/

const ROTATE_MS = 5000;

/**
 * An edition's photos, one after another every 5 s while the card is on
 * screen (paused on hover, in a background tab, and for reduced motion).
 * The photo on show carries data-vt-img, so tapping morphs it into the page.
 */
function RotatingPhotos({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const count = photos.length;

  useEffect(() => {
    const el = ref.current;
    if (!el || count < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let onScreen = !('IntersectionObserver' in window);
    let hovered = false;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.35 }) : null;
    io?.observe(el);
    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && (hovered = true);
    const leave = () => (hovered = false);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    const timer = window.setInterval(() => {
      if (onScreen && !hovered && !document.hidden) setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(timer);
      io?.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, [count]);

  const shown = index % Math.max(1, count);
  return (
    <div ref={ref} className="absolute inset-0">
      {photos.map((src, i) => (
        <img
          key={src}
          {...(i === shown ? { 'data-vt-img': true } : {})}
          src={src}
          alt={i === 0 ? alt : ''}
          aria-hidden={i !== shown}
          loading={i === 0 ? undefined : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-1000 group-hover:scale-[1.03] ${
            i === shown ? 'opacity-100' : 'opacity-0'
          }`}
          onError={hideBrokenImage}
        />
      ))}
      {count > 1 && (
        <div aria-hidden="true" className="absolute inset-x-0 bottom-3 z-[15] flex justify-center gap-1.5">
          {photos.map((src, i) => (
            <span key={src} className={`h-1.5 rounded-full transition-all duration-500 ${i === shown ? 'w-5 bg-chalk' : 'w-1.5 bg-white/45'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function EditionStage({ edition, product }: { edition: NewEdition; product?: Product }) {
  const brand = brandOf(product ?? { name: edition.title });
  const size = dimensionsOf(product ?? { name: edition.title }).replace(/\s*x\s*/i, ' × ');
  const available = isAvailable(product);
  const left = piecesLeft(product);

  const stage = (
    <div className="relative aspect-[4/3] overflow-hidden bg-carbon-2">
      {/* spotlight + floor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_50%_0%,rgba(242,243,245,0.14),transparent_70%)]" />
      <div className="absolute bottom-[14%] left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-[100%] bg-black/70 blur-xl" />

      {product?.image ? (
        <RotatingPhotos photos={[product.image, ...(product.gallery ?? [])].filter(Boolean)} alt={product.name} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-silver">
          {brand && <BrandLogo brand={brand} className="h-14 w-14 opacity-70" />}
          <span className="font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold uppercase leading-none text-outline stretch-125">
            {edition.mark}
          </span>
        </div>
      )}

      {/* Car cover, pulled off as the panel scrolls in (scroll-driven, progressive) */}
      <div aria-hidden="true" className="sd-uncover absolute inset-0 z-10 bg-[linear-gradient(118deg,#1b1c20_0%,#34363c_22%,#1d1e22_40%,#44464d_58%,#202125_76%,#303237_100%)]" />

      <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-chalk px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-asphalt">
          {product ? 'New · 3D' : 'Coming soon · 3D'}
        </span>
        {product && (
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-chalk backdrop-blur-md">
            {!available ? 'Sold out' : left !== undefined ? `Only ${left} left` : 'In stock'}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <article className="group overflow-hidden rounded-3xl bg-carbon ring-1 ring-white/[0.08]">
      {product ? (
        <TransitionLink href={`/product/${product._id}`} aria-label={`${product.name} — view`}>
          {stage}
        </TransitionLink>
      ) : (
        stage
      )}
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            {brand && <BrandLogo brand={brand} className="h-6 w-6 text-silver" />}
            <h3 className="truncate font-display text-xl font-semibold uppercase text-chalk stretch-125 sm:text-2xl">
              {product?.name ?? edition.title}
            </h3>
          </div>
          <p className="mt-1.5 text-xs text-smoke">
            {size} · one size only <span className="font-ar">· مقاس واحد</span>
          </p>
        </div>
        {product ? (
          <div className="flex items-center justify-between gap-3">
            <Plate size="md" left={product.price} letter="د.م" right="MAD" aria-label={`${product.price} MAD`} />
            <TransitionLink
              href={`/product/${product._id}`}
              className={`${available ? btnPrimary : btnGhostDark} !gap-1.5 !px-3.5 !py-2 !text-[10px] !tracking-[0.12em] sm:!gap-2.5 sm:!px-5 sm:!py-2.5 sm:!text-[12px] sm:!tracking-[0.16em]`}
            >
              {available ? 'Order now' : 'View'}
              <Arrow />
            </TransitionLink>
          </div>
        ) : (
          <a
            href={whatsappLink(`Salam L7it, bghit nreservi ${edition.title} mli tkhrej.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnGhostDark} !px-5 !py-2.5 self-start`}
          >
            <WhatsAppIcon className="h-4 w-4" />
            Reserve <span className="font-ar text-sm normal-case tracking-normal opacity-80">· حجز</span>
          </a>
        )}
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

const PERKS = [
  {
    title: 'Cash on delivery',
    ar: 'الخلاص عند الاستلام',
    icon: <path d="M2.5 6.5h19v11h-19zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM6 10v4M18 10v4" />,
  },
  {
    title: 'Delivery 48h – 3 days',
    ar: 'التوصيل لكاع المغرب',
    icon: <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7M6.5 19.3a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6zM17 19.3a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z" />,
  },
  {
    title: 'Alucobond 3 mm',
    ar: 'جودة عالية',
    icon: <path d="M3 8l9-4.5L21 8l-9 4.5L3 8zM3 12l9 4.5 9-4.5M3 16l9 4.5 9-4.5" />,
  },
  {
    title: 'Made in Salé',
    ar: 'صنع فسلا',
    icon: <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />,
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((data) => {
        if (active) setProducts(applyPin(data));
      })
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const editionProducts = matchEditions(products);
  const grid = products.filter((p) => !isNewEdition(p.name)).slice(0, 8);

  // Brands, most cars on the grid first.
  const brandCounts = new Map<string, number>();
  products.forEach((p) => {
    if (p.category) brandCounts.set(p.category, (brandCounts.get(p.category) || 0) + 1);
  });
  const categories = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);

  return (
    <div className="bg-asphalt text-chalk">
      {/* ─────────────────────────────────────────────────────────────────
       * HERO — the night road, nothing else in the way
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <NightDrive className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,rgba(10,10,11,0.55),transparent_70%),radial-gradient(ellipse_at_50%_50%,transparent_40%,rgba(10,10,11,0.85)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-asphalt" />
        <div className="grain pointer-events-none absolute inset-0" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-8 pt-28 sm:px-6 md:pb-10 md:pt-32 lg:px-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <motion.a
              href="#new-drop"
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-silver ring-1 ring-inset ring-white/10 backdrop-blur-md transition-colors hover:bg-white/[0.1] hover:text-chalk"
            >
              <span className="h-1 w-1 rounded-full bg-xenon shadow-[0_0_6px_#8FCBFF]" />
              New · 3D editions in stock
              <span aria-hidden="true">↓</span>
            </motion.a>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
                show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: EASE } },
              }}
              className="text-metal mt-7 font-display text-[clamp(2.9rem,10.5vw,8.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.01em] stretch-125"
            >
              Hang the
              <br />
              dream.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
              className="mt-5 text-base text-silver sm:text-lg"
            >
              On the wall today. In the garage tomorrow.
              <span className="mt-1 block font-ar text-lg text-smoke sm:text-xl" dir="rtl">
                اليوم فالحيط… وغدا فالكاراج
              </span>
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
              className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
            >
              <a href="#new-drop" className={`${btnPrimary} w-full sm:w-auto`}>
                Discover the 3D editions
                <Arrow />
              </a>
              <Link href="/shop" className={`${btnGhostDark} w-full sm:w-auto`}>
                Shop the collection
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            className="-mx-5 mt-10 sm:-mx-6 lg:-mx-10"
          >
            <BrandRail categories={categories.length ? categories : FALLBACK_BRANDS} />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * NEW DROPS — G-Class 3D + 911 3D
       * ───────────────────────────────────────────────────────────────── */}
      <section id="new-drop" className="scroll-mt-20 px-5 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-20 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="sd-reveal flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={kickerLabel}>
                New drop · in stock <span className="font-ar normal-case tracking-normal">· جديد</span>
              </p>
              <h2 className={`${h2Display} mt-3 text-[clamp(2.2rem,6vw,4.5rem)] text-chalk`}>Now in 3D.</h2>
            </div>
            <p className="max-w-sm text-sm text-silver">
              Real depth, real detail. Limited pieces, ready to ship.
              <span className="mt-1 block font-ar text-smoke" dir="rtl">عمق حقيقي وتفاصيل بزاف — القطع محدودة.</span>
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            {NEW_EDITIONS.map((edition, i) => (
              <div key={edition.key} className="sd-reveal">
                <EditionStage edition={edition} product={editionProducts[i]} />
              </div>
            ))}
          </div>

          <div className="sd-reveal mt-5 md:mt-6">
            <DuoOffer editions={editionProducts} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * Perks
       * ───────────────────────────────────────────────────────────────── */}
      <section aria-label="Delivery and payment" className="border-y border-white/[0.06] px-5 sm:px-6 lg:px-10">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
          {PERKS.map((perk, i) => (
            <li
              key={perk.title}
              className={`flex items-center gap-3 py-6 md:justify-center md:py-8 ${i % 2 === 1 ? 'pl-4 md:pl-0' : ''} ${i > 0 ? 'md:border-l md:border-white/[0.06]' : ''} ${i < 2 ? 'border-b border-white/[0.06] md:border-b-0' : ''}`}
            >
              <svg className="h-6 w-6 shrink-0 text-silver" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                {perk.icon}
              </svg>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-chalk sm:text-sm">{perk.title}</span>
                <span className="block font-ar text-xs text-smoke">{perk.ar}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * MOST WANTED
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 pb-20 sm:px-6 md:pb-28 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="sd-reveal mb-10 flex items-end justify-between gap-6">
            <div>
              <p className={kickerLabel}>
                Collection <span className="font-ar normal-case tracking-normal">· الأكثر طلبا</span>
              </p>
              <h2 className={`${h2Display} mt-3 text-[clamp(2.2rem,6vw,4.5rem)] text-chalk`}>Most wanted.</h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex shrink-0 items-center gap-2 pb-2 text-sm font-medium text-silver transition-colors hover:text-chalk"
            >
              View all
              <Arrow />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
              : grid.map((p, i) => (
                  <div key={p._id} className="sd-reveal">
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * CUSTOM BUILD
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 pb-24 sm:px-6 md:pb-32 lg:px-10">
        <div className="sd-reveal relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-carbon px-6 py-14 ring-1 ring-white/[0.08] sm:px-12 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_10%,rgba(143,203,255,0.10),transparent_60%),radial-gradient(ellipse_50%_60%_at_0%_100%,rgba(242,243,245,0.06),transparent_60%)]" />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={kickerLabel}>Custom build</p>
              <h2 className={`${h2Display} mt-3 text-[clamp(2.2rem,6vw,4.5rem)] text-chalk`}>
                Your car.
                <br />
                <span className="text-metal">Your wall.</span>
              </h2>
              <p className="mt-4 w-fit font-ar text-lg text-smoke" dir="rtl">
                مالقيتيش الطوموبيل ديالك؟ صيفط لينا الموديل.
              </p>
            </div>
            <Link href="/customize" className={btnPrimary}>
              Start a custom build
              <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

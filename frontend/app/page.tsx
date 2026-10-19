'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard, { hideBrokenImage } from '@/components/ProductCard';
import TransitionLink from '@/components/TransitionLink';
import LaunchButton from '@/components/LaunchButton';
import NightDrive from '@/components/NightDrive';
import Plate from '@/components/Plate';
import WheelLoader from '@/components/WheelLoader';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { btnPrimary, btnGhostDark, whatsappLink } from '@/lib/uiStyles';
import { applyPin } from '@/lib/pinnedProducts';
import { NEW_EDITIONS, NewEdition, matchEditions, isNewEdition } from '@/lib/newEditions';
import { dimensionsOf } from '@/lib/dimensions';

const HERO_IMAGE =
  'https://res.cloudinary.com/dwknjjv0b/image/upload/f_auto,q_auto/l7it/site/home-hero-911.png';

const Arrow = () => (
  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h15" />
  </svg>
);

function Kicker({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot ${className}`}>
      <span className="h-[2px] w-8 bg-redline" />
      {children}
    </p>
  );
}

/* ----------------------------------------------------------------------------
 * Hero HUD — a speed readout that "launches" 0 → 299 on load.
 * --------------------------------------------------------------------------*/

function SpeedHud() {
  const speedRef = useRef<HTMLSpanElement>(null);
  const gearRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const set = (v: number) => {
      if (speedRef.current) speedRef.current.textContent = String(v).padStart(3, '0');
      if (gearRef.current) gearRef.current.textContent = String(Math.min(8, 1 + Math.floor((v / 299) * 7.99)));
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      set(299);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + 700;
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - t0) / 2600));
      set(Math.round((1 - Math.pow(1 - p, 3)) * 299));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden="true" className="chamfer-sm hidden items-stretch bg-asphalt/60 font-mono text-chalk shadow-[inset_0_0_0_1px_rgba(244,244,240,0.12)] backdrop-blur-md md:flex">
      <div className="px-4 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-smoke">Ambition</p>
        <p className="font-display text-4xl font-black leading-none tabular-nums stretch-75">
          <span ref={speedRef}>000</span>
          <span className="ml-1 font-mono text-[10px] font-bold text-smoke">KM/H</span>
        </p>
      </div>
      <div className="flex flex-col justify-center border-l border-white/10 px-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-smoke">Gear</p>
        <p className="font-display text-4xl font-black leading-none text-redline-hot stretch-75">
          <span ref={gearRef}>1</span>
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Crossed racing tapes
 * --------------------------------------------------------------------------*/

const TAPE_EN = ['Cash on delivery', 'Delivery 24h – 3 days', 'All Morocco', 'Made in Rabat', 'Ready to hang', 'Alucobond 3 mm'];
const TAPE_AR = ['الخلاص عند الاستلام', 'التوصيل لكاع المغرب', 'صنع فالرباط', 'جاهزة للتعليق', 'علّق الحلم'];

function Tape({ items, className, reverse, arabic }: { items: string[]; className: string; reverse?: boolean; arabic?: boolean }) {
  const row = [...items, ...items, ...items];
  return (
    <div aria-hidden="true" className={`absolute left-[-5%] w-[110%] overflow-hidden py-3 ${className}`}>
      <div className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} [--marquee-duration:42s]`}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {row.map((item, i) => (
              <li
                key={i}
                className={`flex items-center gap-6 pr-6 ${
                  arabic ? 'font-ar text-lg font-bold' : 'font-display text-lg font-black uppercase tracking-[0.06em] stretch-125'
                }`}
              >
                {item}
                <span className="text-sm">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * New drops — the two 3D editions, revealed like a car launch
 * --------------------------------------------------------------------------*/

function EditionStage({ edition, product }: { edition: NewEdition; product?: Product }) {
  const { addToCart } = useCart();

  const stage = (
    <div className="relative aspect-[4/3] overflow-hidden bg-carbon-2">
      {/* spotlight + floor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_50%_0%,rgba(244,244,240,0.16),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black/60" />
      <div className="absolute bottom-[14%] left-1/2 h-6 w-2/3 -translate-x-1/2 rounded-[100%] bg-black/70 blur-xl" />

      {product?.image ? (
        <img
          data-vt-img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          onError={hideBrokenImage}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="whitespace-nowrap font-display text-[13vw] font-black uppercase leading-none text-chalk text-outline stretch-100 sm:text-[clamp(4rem,9vw,8rem)] sm:stretch-125">
            {edition.mark}
          </span>
          <span className="mt-2 rounded-sm bg-volt px-2 py-0.5 font-display text-2xl font-black text-asphalt stretch-150">3D</span>
        </div>
      )}

      {/* Car cover, pulled off as the panel scrolls in (scroll-driven, progressive) */}
      <div aria-hidden="true" className="sd-uncover absolute inset-0 z-10 bg-[linear-gradient(118deg,#1d1d22_0%,#3b3b44_22%,#1f1f25_40%,#4a4a54_58%,#22222a_76%,#34343c_100%)]">
        <div className="flex h-full items-center justify-center">
          <span className="font-display text-5xl font-black uppercase text-white/10 stretch-150">L7IT</span>
        </div>
      </div>

      <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
        <span className="rounded-sm bg-volt px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-asphalt">
          {product ? 'New drop' : 'Dropping soon · قريبا'}
        </span>
        <span className="rounded-sm bg-asphalt/70 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-chalk">
          N°{edition.number} · 3D
        </span>
      </div>
    </div>
  );

  return (
    <article className="group overflow-hidden rounded-2xl bg-carbon ring-1 ring-white/10">
      {product ? (
        <TransitionLink href={`/product/${product._id}`} aria-label={`${product.name} — view`}>
          {stage}
        </TransitionLink>
      ) : (
        stage
      )}
      <div className="flex flex-col gap-4 p-5 sm:p-7">
        <div>
          <h3 className="font-display text-4xl font-black uppercase leading-[0.9] text-chalk stretch-125 sm:text-5xl">
            {product?.name ?? edition.title}
          </h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-smoke">{edition.tagline}</p>
          <p className="mt-1 w-fit font-ar text-base text-chalk/80" dir="rtl">
            {edition.taglineAr}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {product ? (
            <>
              <Plate size="md" left={product.price} letter="د.م" right="MAD" aria-label={`${product.price} MAD`} />
              <TransitionLink href={`/product/${product._id}`} className={btnPrimary}>
                View the build
                <Arrow />
              </TransitionLink>
              {product.inStock && (
                <button
                  onClick={() => addToCart(product, 'M', dimensionsOf(product))}
                  className="px-2 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-chalk underline decoration-redline decoration-2 underline-offset-[6px] hover:text-redline-hot"
                >
                  Add to cart
                </button>
              )}
            </>
          ) : (
            <a
              href={whatsappLink(`Salam L7it, bghit nreservi ${edition.title} mli tkhrej.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2a9.9 9.9 0 00-8.5 15l-1.4 5 5.1-1.3A9.9 9.9 0 1012.04 2zm5.8 14.1c-.25.7-1.45 1.33-2 1.4-.52.08-1.17.11-1.88-.12a17 17 0 01-1.7-.63c-2.98-1.29-4.93-4.3-5.08-4.5-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.2.07.15.12.33.02.53-.1.2-.15.32-.3.5l-.44.52c-.15.15-.3.3-.13.6.17.3.77 1.27 1.66 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.42z" />
              </svg>
              Reserve<span className="hidden sm:inline"> on WhatsApp</span>
              <span className="font-ar text-sm normal-case tracking-normal opacity-90">· حجز</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------
 * Brand marquee — every brand on the grid, links into the filtered garage
 * --------------------------------------------------------------------------*/

function BrandMarquee({ brands }: { brands: string[] }) {
  if (!brands.length) return null;
  const row = brands.length < 6 ? [...brands, ...brands, ...brands] : [...brands, ...brands];
  return (
    <div className="group/marquee relative overflow-hidden border-y border-white/10 py-6 md:py-10">
      <div className="flex w-max animate-marquee [--marquee-duration:55s] group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {row.map((brand, i) => (
              <li key={`${brand}-${i}`} className="flex items-center">
                <Link
                  href={`/shop?category=${encodeURIComponent(brand)}`}
                  tabIndex={copy === 1 || i >= brands.length ? -1 : undefined}
                  className="px-5 font-display text-[clamp(3rem,9vw,7.5rem)] font-black uppercase leading-none text-chalk text-outline transition-colors duration-200 stretch-150 hover:text-redline hover:[-webkit-text-stroke-color:#E5200C] focus-visible:text-redline focus-visible:outline-none md:px-8"
                >
                  {brand}
                </Link>
                <span aria-hidden="true" className="h-3 w-3 rotate-45 bg-redline" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Custom build — type your dream car on a Moroccan plate, send it on WhatsApp
 * --------------------------------------------------------------------------*/

function PlateBuilder() {
  const [car, setCar] = useState('');
  const message = `Salam L7it, bghit lawha custom dyal: ${car.trim() || '...'}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
      }}
      className="flex w-full max-w-2xl flex-col items-stretch gap-4"
    >
      <label htmlFor="dream-car" className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-smoke">
        Type your dream car
        <span className="font-ar text-sm normal-case tracking-normal">· كتب الطوموبيل ديال حلامك</span>
      </label>
      <div
        dir="ltr"
        className="flex items-stretch overflow-hidden rounded-[10px] border-[3px] border-asphalt bg-white text-asphalt shadow-[0_6px_0_rgba(0,0,0,0.5),0_0_0_3px_#F4F4F0] transition-shadow focus-within:shadow-[0_6px_0_rgba(0,0,0,0.5),0_0_0_3px_#F4F4F0,0_0_0_8px_rgba(229,32,12,0.6)]"
      >
        <input
          id="dream-car"
          value={car}
          onChange={(e) => setCar(e.target.value)}
          maxLength={22}
          autoComplete="off"
          placeholder="GOLF 8 R"
          size={1}
          className="w-0 min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-xl font-bold uppercase text-asphalt placeholder:text-asphalt/30 focus:outline-none sm:text-3xl"
        />
        <span aria-hidden="true" className="flex items-center border-x-[3px] border-asphalt px-3 font-ar text-xl font-bold sm:px-4 sm:text-3xl">ح</span>
        <span aria-hidden="true" className="flex items-center px-3 font-mono text-xl font-bold sm:px-5 sm:text-3xl">1</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className={`${btnPrimary} sm:flex-1`}>
          Send it on WhatsApp
          <Arrow />
        </button>
        <Link href="/customize" className={btnGhostDark}>
          Full custom form
        </Link>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

const MANIFESTO = 'Every dream car started as a picture on someone’s wall.';

const STEPS = [
  { n: '01', title: 'Hang it', body: 'Put it where you see it every single morning.', ar: 'علّقها فين كتشوفها كل صباح.' },
  { n: '02', title: 'Chase it', body: 'Early alarms, late nights. Now they have a reason.', ar: 'خدم، صبر، وكل نهار قرّب شوية.' },
  { n: '03', title: 'Park it', body: 'The day the real one is outside, the wall was right.', ar: 'ونهار تولي ديالك، غادي تعقل منين بديتي.' },
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
  const brands = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([b]) => b);

  return (
    <div className="bg-asphalt text-chalk">
      {/* ─────────────────────────────────────────────────────────────────
       * HERO — night drive
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <NightDrive className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,rgba(10,10,11,0.85)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-asphalt" />
        <div className="grain pointer-events-none absolute inset-0" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-8 pt-28 sm:px-6 md:pb-12 md:pt-36 lg:px-10">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-smoke">
            <span>N°001 / Night drive</span>
            <span className="hidden sm:inline">34.02°N 6.84°W · Rabat</span>
          </div>

          <div className="relative flex flex-1 flex-col justify-center py-6 md:py-10">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
              className="relative z-10"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <Kicker>
                  Wall art for car people
                  <span className="hidden font-ar text-[13px] normal-case tracking-normal sm:inline">· لعشاق الطوموبيلات</span>
                </Kicker>
              </motion.div>
              <h1 className="mt-5 font-display font-black uppercase leading-[0.82] tracking-[-0.02em]">
                <motion.span
                  variants={{ hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                  className="block text-[clamp(2.9rem,11vw,9.5rem)] stretch-100 md:stretch-125"
                >
                  Hang the
                </motion.span>
                <motion.span
                  variants={{ hidden: { opacity: 0, x: -120, filter: 'blur(10px)' }, show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}
                  className="block text-[21vw] stretch-100 sm:text-[17vw] sm:stretch-125 lg:text-[15vw] lg:stretch-150 2xl:text-[13.5rem]"
                >
                  Dream<span className="text-redline">.</span>
                </motion.span>
              </h1>
              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="mt-4 font-display text-xl font-extrabold uppercase text-chalk/90 stretch-125 sm:text-2xl md:text-3xl"
              >
                Then go get it.
              </motion.p>
              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="mt-2 w-fit font-ar text-lg text-smoke sm:text-xl"
                dir="rtl"
              >
                علّق الحلم فالحيط… ومن بعد سير جيبو.
              </motion.p>
            </motion.div>

            {/* The car, launching in from the left */}
            <motion.div
              initial={{ x: '-60vw', opacity: 0, filter: 'blur(14px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.6, delay: 0.35, ease: [0.12, 0.9, 0.2, 1] }}
              className="pointer-events-none relative mt-6 w-full md:absolute md:bottom-0 md:right-[-4%] md:mt-0 md:w-[58%] lg:right-0 lg:w-[52%]"
            >
              <div className="absolute inset-x-[12%] bottom-[8%] h-8 rounded-[100%] bg-redline/40 blur-2xl" />
              <img
                src={HERO_IMAGE}
                alt="Porsche 911 GT3 wall art"
                loading="eager"
                draggable={false}
                className="relative w-full select-none object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.6)]"
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SpeedHud />
            <LaunchButton href="/shop" label="Enter the garage" hint="Hold for launch control" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * Crossed racing tapes
       * ───────────────────────────────────────────────────────────────── */}
      <section aria-label="Delivery and payment" className="relative h-36 overflow-hidden md:h-44">
        <Tape items={TAPE_EN} className="top-6 -rotate-[3deg] bg-redline text-white md:top-8" />
        <Tape items={TAPE_AR} arabic reverse className="top-[4.5rem] rotate-[2.5deg] bg-chalk text-asphalt md:top-[5.5rem]" />
        <ul className="sr-only">
          <li>Cash on delivery</li>
          <li>Delivery in 24 hours to 3 days, all over Morocco</li>
          <li>Made in Rabat, ready to hang</li>
        </ul>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * NEW DROPS — G-Class 3D + 911 3D
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-20 sm:px-6 md:py-28 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="sd-reveal flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Kicker>New drop · 3D editions</Kicker>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,8vw,6.5rem)] font-black uppercase leading-[0.86] stretch-125">
                Two icons.
                <br />
                <span className="text-outline-red">Now in 3D.</span>
              </h2>
            </div>
            <p className="w-fit font-ar text-lg text-smoke md:text-xl" dir="rtl">
              جوج ديال الإصدارات الجداد بـ 3D
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
            {NEW_EDITIONS.map((edition, i) => (
              <div key={edition.key} className="sd-reveal">
                <EditionStage edition={edition} product={editionProducts[i]} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * THE GRID — collection
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative bg-carbon px-5 py-20 sm:px-6 md:py-28 lg:px-10">
        <div className="speed-lines pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="sd-reveal mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <Kicker>The grid</Kicker>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,8vw,6.5rem)] font-black uppercase leading-[0.86] stretch-125">
                Pick your <span className="text-redline">pole.</span>
              </h2>
              <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-smoke">
                <span className="rounded-sm bg-timing-purple px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">P1–P4</span>
                Most wanted right now · <span className="font-ar text-base">الأكثر طلبا</span>
              </p>
            </div>
            <Link href="/shop" className={`${btnGhostDark} self-start md:self-end`}>
              See all cars
              <Arrow />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <WheelLoader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
              {grid.map((p, i) => (
                <div key={p._id} className="sd-reveal">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * Brands
       * ───────────────────────────────────────────────────────────────── */}
      <section aria-label="Shop by brand" className="py-6">
        <p className="mb-2 px-5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-smoke sm:px-6 lg:px-10">
          Shop by brand · اختار الماركا
        </p>
        <BrandMarquee brands={brands.length ? brands : ['Porsche', 'Mercedes', 'BMW', 'Audi']} />
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * MANIFESTO — for the ambitious
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-24 sm:px-6 md:py-36 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <Kicker>Manifesto</Kicker>
          <p className="mt-6 max-w-6xl font-display text-[clamp(2.2rem,6.4vw,5.75rem)] font-black uppercase leading-[0.95] stretch-125">
            {MANIFESTO.split(' ').map((word, i) => (
              <span key={i} className="sd-word inline-block pr-[0.28em]">
                {word}
              </span>
            ))}
          </p>
          <p className="mt-6 w-fit font-ar text-xl text-smoke md:text-2xl" dir="rtl">
            كل طوموبيل ديال الحلم بدات بتصويرة فالحيط.
          </p>

          <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s) => (
              <li key={s.n} className="sd-reveal border-t-2 border-redline pt-6">
                <p className="font-mono text-sm font-bold text-redline-hot">{s.n}</p>
                <h3 className="mt-3 font-display text-4xl font-black uppercase stretch-125">{s.title}</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-smoke">{s.body}</p>
                <p className="mt-2 w-fit font-ar text-base text-chalk/75" dir="rtl">
                  {s.ar}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * BUILT LIKE A CAR PART — bento spec sheet
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 pb-24 sm:px-6 md:pb-32 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="sd-reveal mb-10">
            <Kicker>Spec sheet</Kicker>
            <h2 className="mt-4 font-display text-[clamp(2.6rem,8vw,6.5rem)] font-black uppercase leading-[0.86] stretch-125">
              Built like <span className="text-outline">a car part.</span>
            </h2>
          </div>

          <div className="grid auto-rows-[minmax(180px,auto)] gap-3 md:grid-cols-4 md:gap-4">
            {/* Material — big tile with a cross-section */}
            <div className="sd-reveal relative overflow-hidden rounded-2xl bg-carbon p-6 ring-1 ring-white/10 md:col-span-2 md:row-span-2 md:p-8">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot">Material · المادة</p>
              <p className="mt-4 font-display text-[11vw] font-black uppercase leading-[0.9] stretch-100 sm:text-6xl sm:stretch-125 md:text-7xl">
                Alucobond
                <br />3 mm
              </p>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-smoke">
                The aluminium composite used on building façades. Light, rigid, built to last — not paper, not canvas.
              </p>
              <div aria-hidden="true" className="mt-8 max-w-md space-y-1.5">
                {[
                  ['Aluminium skin', 'h-2.5 bg-gradient-to-r from-zinc-300 to-zinc-500'],
                  ['Polymer core', 'h-7 bg-carbon-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'],
                  ['Aluminium skin', 'h-2.5 bg-gradient-to-r from-zinc-300 to-zinc-500'],
                ].map(([label, cls], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`flex-1 rounded-sm ${cls}`} />
                    <span className="w-28 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-smoke">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sd-reveal rounded-2xl bg-carbon p-6 ring-1 ring-white/10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-smoke">Print</p>
              <p className="mt-3 font-display text-3xl font-black uppercase stretch-125">UV · Matte</p>
              <p className="mt-2 text-sm text-smoke">No glare, deep blacks, colours that stay.</p>
            </div>

            <div className="sd-reveal rounded-2xl bg-redline p-6 text-white">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">Mount</p>
              <p className="mt-3 font-display text-3xl font-black uppercase stretch-125">Pre-drilled</p>
              <p className="mt-2 text-sm text-white/85">Ready to bolt to the wall. No frame needed.</p>
            </div>

            <div className="sd-reveal rounded-2xl bg-carbon p-6 ring-1 ring-white/10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-smoke">Delivery · التوصيل</p>
              <p className="mt-3 font-display text-3xl font-black uppercase stretch-125">24h – 3 days</p>
              <p className="mt-2 text-sm text-smoke">Anywhere in Morocco, with a tracking number.</p>
            </div>

            <div className="sd-reveal flex flex-col justify-between gap-4 rounded-2xl bg-chalk p-6 text-asphalt">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-asphalt/60">Payment</p>
                <p className="mt-3 font-display text-3xl font-black uppercase stretch-125">Cash on delivery</p>
              </div>
              <p className="w-fit font-ar text-lg font-semibold" dir="rtl">
                كتخلص فاش توصلك للدار
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * CUSTOM BUILD — plate builder
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 px-5 py-24 sm:px-6 md:py-32 lg:px-10">
        <div className="hazard pointer-events-none absolute inset-x-0 top-0 h-2 opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(229,32,12,0.16),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-2">
          <div className="sd-reveal min-w-0">
            <Kicker>Custom build</Kicker>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,9vw,7rem)] font-black uppercase leading-[0.84] stretch-125">
              Your car.
              <br />
              <span className="text-redline">Your wall.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-smoke md:text-lg">
              Not on the grid? Send the model, the angle, the colour. We draw it, print it and deliver it — built for you only.
            </p>
            <p className="mt-2 w-fit font-ar text-lg text-chalk/80" dir="rtl">
              مالقيتيش الطوموبيل ديالك؟ صيفط لينا الماركا والموديل.
            </p>
          </div>
          <div className="sd-reveal min-w-0">
            <PlateBuilder />
          </div>
        </div>
      </section>
    </div>
  );
}

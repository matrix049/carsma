'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import WheelLoader from '@/components/WheelLoader';
import WheelButton from '@/components/WheelButton';
import Marquee from '@/components/Marquee';
import RevealText from '@/components/RevealText';
import MagneticLink from '@/components/MagneticLink';

/* ----------------------------------------------------------------------------
 * Hero
 * --------------------------------------------------------------------------*/

function Hero() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);

  // Scroll-driven parallax for the hero image + copy
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Cursor-tracked spotlight glow (subtle, only inside hero)
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const glowX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const glowY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const glowBackground = useMotionTemplate`radial-gradient(600px circle at ${glowX}% ${glowY}%, rgba(37,99,235,0.18), transparent 65%)`;

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black grain"
    >
      {/* Parallaxed image with slow ken-burns layered on top */}
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <div className="kenburn h-full w-full">
          <img
            src="/hero_premium.png"
            alt=""
            className="h-full w-full object-cover brightness-[0.42] contrast-110 saturate-[0.85]"
          />
        </div>
        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.55)_70%,_#000_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
      </motion.div>

      {/* Cursor-tracked aurora glow */}
      <motion.div
        style={{ background: glowBackground }}
        className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
      />

      {/* Aurora pulse anchored behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl pulse-glow"
      />

      {/* Top-left edition tag */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute top-28 left-6 lg:left-12 z-20 flex items-center gap-3 text-white/60"
      >
        <div className="h-px w-10 bg-white/30" />
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase">
          N° 001 / Noir Edition
        </span>
      </motion.div>

      {/* Top-right meta */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute top-28 right-6 lg:right-12 z-20 hidden items-center gap-3 text-white/60 md:flex"
      >
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase">
          Crafted in Rabat — MA
        </span>
        <div className="h-px w-10 bg-white/30" />
      </motion.div>

      {/* Hero copy */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center"
      >
        <div className="max-w-5xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <span className="text-shimmer text-[10px] font-black uppercase tracking-[0.4em]">
                {t('exclusiveTitle')}
              </span>
            </span>
          </motion.div>

          <h1 className="font-jakarta text-balance text-[clamp(3rem,9vw,8rem)] font-black leading-[0.85] tracking-tighter text-white uppercase">
            <RevealText
              as="span"
              text={t('premiumWall')}
              className="block"
              stagger={0.08}
            />
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(37,99,235,0.35)]"
              >
                {t('wallCollection')}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mx-auto max-w-xl text-base font-medium leading-relaxed text-zinc-300/90 md:text-lg"
          >
            {t('heroDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 pt-4 md:gap-6 md:pt-6"
          >
            <WheelButton href="/shop" variant="primary">
              <span className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-2">
                  {t('exploreGallery')}
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
                </span>
                <span className="text-xs opacity-80">شوف اللوحات</span>
              </span>
            </WheelButton>
            <WheelButton href="/customize" variant="secondary">
              <span className="flex flex-col items-center gap-1">
                <span>{t('customizeYourDesign')}</span>
                <span className="text-xs opacity-80">طلب تصميم خاص</span>
              </span>
            </WheelButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom marquee strip — brand list in muted serif-ish caps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-16 md:bottom-20 left-0 right-0 z-10"
      >
        <Marquee speed="normal" className="border-y border-white/5 py-5">
          {[
            'Porsche',
            'Lamborghini',
            'Ferrari',
            'McLaren',
            'Mercedes-AMG',
            'BMW M',
            'Pagani',
            'Bugatti',
            'Aston Martin',
            'Koenigsegg',
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-12 px-6 text-white/30">
              <span className="font-jakarta text-2xl font-black uppercase tracking-tight md:text-4xl">
                {b}
              </span>
              <span className="text-blue-500">●</span>
            </div>
          ))}
        </Marquee>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-white/40"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase">scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Manifesto — large-format quote that reveals word-by-word
 * --------------------------------------------------------------------------*/

function Manifesto() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] grain">
      <div className="container relative z-10 mx-auto max-w-6xl px-6 py-32 md:py-48">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          className="mb-12 flex items-center gap-4 text-blue-500"
        >
          <div className="h-px w-12 bg-blue-500/60" />
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em]">
            Manifesto / 02
          </span>
        </motion.div>

        <RevealText
          as="h2"
          text="Not posters. Not prints. Quiet declarations bolted to the wall — drawn for the obsessed, finished for the few."
          className="font-jakarta text-balance text-[clamp(2rem,5.5vw,5.5rem)] font-black uppercase leading-[0.95] tracking-tighter text-white"
          stagger={0.04}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 gap-12 border-t border-white/10 pt-12 md:grid-cols-3"
        >
          {[
            {
              k: 'Stat / 01',
              n: '120',
              s: 'cm — gallery format, vertical-grain canvas',
            },
            {
              k: 'Stat / 02',
              n: '1 / 50',
              s: 'numbered editions — every piece signed by hand',
            },
            {
              k: 'Stat / 03',
              n: '∞',
              s: 'pixels redrawn — twice. then once more.',
            },
          ].map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.7 }}
              className="space-y-3"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-blue-500/80 uppercase">
                {row.k}
              </span>
              <div className="font-jakarta text-7xl font-black tracking-tighter text-white">
                {row.n}
              </div>
              <p className="text-sm leading-relaxed text-zinc-400 font-medium">
                {row.s}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Featured Selection — refined header + auto-scrolling carousel
 * --------------------------------------------------------------------------*/

function FeaturedSection({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  const { t } = useLanguage();

  return (
    <section className="container mx-auto max-w-7xl px-6 py-32 md:py-40">
      <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 text-blue-600"
          >
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em]">
              Selection / 03
            </span>
            <div className="h-px w-12 bg-blue-600/40" />
          </motion.div>
          <RevealText
            as="h2"
            text={t('featuredSelection')}
            className="font-jakarta text-[clamp(2.5rem,8vw,8rem)] font-black uppercase leading-[0.85] tracking-tighter text-zinc-900 dark:text-zinc-50"
            stagger={0.05}
          />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-1.5 w-24 origin-left rounded-full bg-blue-600"
          />
        </div>

        <MagneticLink href="/shop" className="group inline-flex flex-col items-start gap-2">
          <span className="flex items-center gap-4 text-xl font-black uppercase tracking-widest text-blue-600 hover:text-blue-500">
            {t('exploreGallery')}
            <svg
              className="h-7 w-7 transition-transform group-hover:translate-x-2"
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
          </span>
          <span className="text-base font-medium tracking-normal text-blue-600 opacity-80 normal-case">
            شوف اللوحات
          </span>
        </MagneticLink>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <WheelLoader size="lg" />
          <p className="mt-8 text-sm font-black uppercase tracking-widest text-zinc-600">
            Loading Premium Collection...
          </p>
        </div>
      ) : (
        <div className="relative -mx-6 overflow-hidden">
          {/* Edge fades for cleaner carousel framing */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent dark:from-[#0a0a0a]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent dark:from-[#0a0a0a]" />

          <Marquee speed="slow" pauseOnHover className="px-6 py-2">
            {products.map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                className="mx-3 w-[260px] flex-shrink-0 md:w-[300px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Process — vertical stepper with animated connector
 * --------------------------------------------------------------------------*/

function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 60%'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const steps = [
    {
      n: '01',
      label: 'Drawn',
      copy: 'Every silhouette is hand-traced from reference, then redrawn vector-clean. No filters. No AI brush packs.',
    },
    {
      n: '02',
      label: 'Pressed',
      copy: 'Printed on archival 240 gsm matte canvas with pigment ink — built to outlive the trends.',
    },
    {
      n: '03',
      label: 'Inspected',
      copy: 'Each piece is checked under daylight, signed, numbered, and rolled in a black tube.',
    },
    {
      n: '04',
      label: 'Shipped',
      copy: 'Tracked door-to-door across Morocco. Packaged so the only thing it meets is your wall.',
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#050505] py-32 md:py-48">
      <div className="container mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 flex items-center gap-3 text-blue-500"
        >
          <div className="h-px w-12 bg-blue-500/60" />
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em]">
            Process / 04
          </span>
        </motion.div>

        <RevealText
          as="h2"
          text="From sketch to your wall — four hands, four checks, zero shortcuts."
          className="mb-24 font-jakarta text-balance text-[clamp(2rem,5vw,4.5rem)] font-black uppercase leading-[0.95] tracking-tighter text-white"
          stagger={0.04}
        />

        <div ref={ref} className="relative pl-8 md:pl-16">
          {/* Track */}
          <div className="absolute left-3 top-2 h-full w-px bg-white/10 md:left-7" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-3 top-2 w-px origin-top bg-gradient-to-b from-blue-400 via-blue-600 to-blue-700 md:left-7"
          />

          <div className="space-y-20">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20%' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Node dot */}
                <span
                  className="absolute -left-[1.65rem] top-2 grid h-6 w-6 place-items-center rounded-full bg-blue-600 shadow-[0_0_24px_rgba(37,99,235,0.55)] md:-left-[2.45rem]"
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>

                <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-12">
                  <div className="font-jakarta text-6xl font-black tracking-tighter text-white/10 md:text-8xl">
                    {step.n}
                  </div>
                  <div className="max-w-xl space-y-4">
                    <h3 className="font-jakarta text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                      {step.label}
                    </h3>
                    <p className="text-base font-medium leading-relaxed text-zinc-400">
                      {step.copy}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Closing CTA — large headline, magnetic link, secondary marquee
 * --------------------------------------------------------------------------*/

function ClosingCTA() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full overflow-hidden bg-blue-600 text-white">
      {/* Top hairline */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />

      {/* Top marquee — sub-brand statement */}
      <Marquee speed="fast" className="border-b border-white/15 py-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-8 text-white/80">
            <span className="font-jakarta text-xl font-black uppercase tracking-tight md:text-2xl">
              Make it personal
            </span>
            <span className="text-white/50">✦</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/60">
              طلب تصميم خاص
            </span>
            <span className="text-white/50">✦</span>
          </div>
        ))}
      </Marquee>

      <div className="container mx-auto max-w-6xl px-6 py-32 text-center md:py-48">
        <RevealText
          as="h2"
          text="Bring your car. We'll build the wall."
          className="mx-auto max-w-4xl font-jakarta text-balance text-[clamp(2.5rem,8vw,8rem)] font-black uppercase leading-[0.9] tracking-tighter"
          stagger={0.05}
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mx-auto mt-10 max-w-xl text-base font-medium leading-relaxed text-white/80 md:text-lg"
        >
          Send the chassis number, the angle, the color you remember it in — we'll draw it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-14 flex flex-col items-center justify-center gap-6 md:flex-row"
        >
          <MagneticLink
            href="/customize"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-12 py-6 text-xs font-black uppercase tracking-widest text-blue-700 shadow-2xl"
          >
            <span className="flex items-center gap-3">
              {t('customizeYourDesign')}
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
            </span>
          </MagneticLink>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors"
          >
            <span>{t('exploreGallery')}</span>
            <span className="block h-px w-10 origin-left bg-current transition-transform group-hover:scale-x-150" />
          </Link>
        </motion.div>
      </div>

      {/* Bottom marquee */}
      <Marquee speed="normal" reverse className="border-t border-white/15 py-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-8 text-white/70">
            <span className="font-jakarta text-xl font-black uppercase tracking-tight md:text-2xl">
              L7it Studio
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">
              EST. Rabat — MA
            </span>
            <span className="text-white/50">●</span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        if (active) setFeaturedProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex w-full flex-col bg-white dark:bg-[#0a0a0a]">
      <Hero />
      <Manifesto />
      <FeaturedSection products={featuredProducts} isLoading={isLoading} />
      <ProcessSection />
      <ClosingCTA />
    </div>
  );
}

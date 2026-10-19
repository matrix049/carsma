'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard, { hideBrokenImage } from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import WheelLoader from '@/components/WheelLoader';
import { btnDark, btnGhostLight, whatsappLink } from '@/lib/uiStyles';
import { applyPin } from '@/lib/pinnedProducts';
import { NEW_EDITIONS, NewEdition, matchEditions, isNewEdition } from '@/lib/newEditions';

const HERO_IMAGE =
  'https://res.cloudinary.com/dwknjjv0b/image/upload/f_auto,q_auto/l7it/site/home-hero-911.png';

const ArrowRight = () => (
  <svg
    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

/** Fade-up on first scroll into view. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  kicker,
  title,
  arabic,
  align = 'left',
}: {
  kicker: string;
  title: React.ReactNode;
  arabic?: string;
  align?: 'left' | 'center';
}) {
  const centered = align === 'center';
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : ''}>
      <div className={`mb-4 flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
        <span className="h-px w-8 bg-brass-light" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brass">{kicker}</span>
        {centered && <span className="h-px w-8 bg-brass-light" />}
      </div>
      <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.02] tracking-tight text-ink">
        {title}
      </h2>
      {arabic && (
        <p className={`mt-3 w-fit font-ar text-lg text-stone md:text-xl ${centered ? 'mx-auto' : ''}`} dir="rtl">
          {arabic}
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * New edition spotlight — real product once it exists, "coming soon" before
 * --------------------------------------------------------------------------*/

function EditionPanel({ edition, product }: { edition: NewEdition; product?: Product }) {
  const { addToCart } = useCart();
  const dimensions = (product?.dimensions || '').trim() || '120cm x 35cm';

  const visual = (
    <div className="wall-light relative aspect-[4/3] overflow-hidden ring-1 ring-line">
      {product?.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
          onError={hideBrokenImage}
        />
      ) : (
        <div className="zellige absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-[clamp(4.5rem,13vw,9.5rem)] font-semibold leading-none text-transparent"
            style={{ WebkitTextStroke: '1.25px #16130F' }}
          >
            {edition.mark}
          </span>
          <span className="mt-1 font-display text-3xl italic text-brass md:text-4xl">in 3D</span>
        </div>
      )}
      <span className="absolute left-4 top-4 bg-ivory px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink">
        {product ? 'New edition' : 'Coming soon · قريبا'}
      </span>
    </div>
  );

  return (
    <article className="group flex flex-col">
      {product ? <Link href={`/product/${product._id}`}>{visual}</Link> : visual}

      <div className="mt-6 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brass">
          Edition N° {edition.number}
        </p>
        <h3 className="mt-2 font-display text-4xl font-medium leading-none text-ink md:text-5xl">
          {product?.name ?? edition.title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone">{edition.tagline}</p>
        <p className="mt-1 w-fit font-ar text-base text-stone" dir="rtl">
          {edition.taglineAr}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          {product ? (
            <>
              <span className="text-2xl font-semibold text-ink">
                {product.price} <span className="text-sm font-medium text-stone">MAD</span>
              </span>
              <Link href={`/product/${product._id}`} className={btnDark}>
                View the piece
                <ArrowRight />
              </Link>
              {product.inStock && (
                <button
                  onClick={() => addToCart(product, 'M', dimensions)}
                  className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink underline decoration-brass-light underline-offset-[6px] hover:text-brass"
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
              className={btnDark}
            >
              Reserve on WhatsApp
              <span className="font-ar text-sm normal-case tracking-normal opacity-80">· حجز</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

const TRUST = [
  {
    title: 'Cash on delivery',
    ar: 'الخلاص عند الاستلام',
    icon: 'M3 7h18v10H3zM7 12h.01M17 12h.01M12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  },
  {
    title: '24h – 3 days delivery',
    ar: 'التوصيل لكاع المغرب',
    icon: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  },
  {
    title: 'Ready to mount',
    ar: 'جاهزة للتعليق',
    icon: 'M4 5h16v12H4zM9 21h6M12 17v4M8 9h.01M16 9h.01',
  },
  {
    title: 'Made in Rabat',
    ar: 'صنع فالرباط',
    icon: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
  },
];

const CRAFT = [
  {
    n: '01',
    title: 'Drawn',
    body: 'Every car is redrawn by hand in our Rabat studio — lines, reflections, stance.',
    ar: 'كل طوموبيل كترسم باليد فالأتولي ديالنا فالرباط.',
  },
  {
    n: '02',
    title: 'Printed',
    body: 'UV-printed with a matte finish on 3 mm Alucobond aluminium composite — light, rigid, built to last.',
    ar: 'طباعة UV ماط على ألوكوبوند 3 ملم، خفيفة وقوية.',
  },
  {
    n: '03',
    title: 'Delivered',
    body: 'Pre-drilled and ready to hang. Delivered in 24h to 3 days — you pay when it arrives.',
    ar: 'مثقوبة وجاهزة، كتوصلك من 24 ساعة ل 3 أيام وكتخلص فالدار.',
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
  const collection = products.filter((p) => !isNewEdition(p.name)).slice(0, 8);

  return (
    <div className="bg-ivory text-ink">
      {/* ─────────────────────────────────────────────────────────────────
       * HERO — headline + the 911 hung on a gallery wall
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="container mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-12 lg:px-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
            className="md:col-span-6"
          >
            {[
              <div key="k" className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-brass-light" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brass">
                  Maison L7it · Rabat
                </span>
              </div>,
              <h1
                key="h"
                className="font-display text-[clamp(3rem,6.2vw,5.5rem)] font-medium leading-[0.98] tracking-tight text-ink"
              >
                Automotive art,
                <br />
                <em className="font-normal text-brass">made for your wall.</em>
              </h1>,
              <p key="ar" className="mt-6 w-fit font-ar text-xl leading-relaxed text-ink/80 md:text-2xl" dir="rtl">
                لوحات ديال الطوموبيلات لي كتعجبك، مصنوعة فالمغرب للحيط ديالك.
              </p>,
              <p key="p" className="mt-4 max-w-md text-base leading-relaxed text-stone md:text-lg">
                Hand-drawn pieces, UV-printed on 3&nbsp;mm Alucobond. Pre-drilled, delivered to your door, paid on arrival.
              </p>,
              <div key="cta" className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className={btnDark}>
                  Discover the collection
                  <ArrowRight />
                </Link>
                <Link href="/customize" className={btnGhostLight}>
                  Your own car
                </Link>
              </div>,
            ].map((child, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-6"
          >
            <div className="wall-light relative flex aspect-[5/4] items-center justify-center overflow-hidden ring-1 ring-line">
              {/* floor line + contact shadow */}
              <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-b from-[#E2D9C9] to-[#D9CFBD]" />
              <motion.img
                src={HERO_IMAGE}
                alt="Porsche 911 wall art"
                loading="eager"
                draggable={false}
                initial={{ x: '-12%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="relative z-10 -mt-[8%] w-[92%] select-none object-contain drop-shadow-[0_28px_28px_rgba(22,19,15,0.28)]"
              />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-stone">
              <span>N° 001 — Porsche 911</span>
              <span>120 × 35 cm · Alucobond</span>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * TRUST STRIP
       * ───────────────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-paper">
        <ul className="container mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-5 py-7 md:grid-cols-4 lg:px-10">
          {TRUST.map((item) => (
            <li key={item.title} className="flex items-center gap-3 md:justify-center">
              <svg className="h-6 w-6 flex-none text-brass" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d={item.icon} />
              </svg>
              <div className="leading-tight">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink">{item.title}</p>
                <p className="font-ar text-sm text-stone">{item.ar}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * NEW EDITIONS — the two pieces we're focusing on
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-24 md:py-32 lg:px-10">
        <div className="container mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              kicker="New editions"
              title={
                <>
                  Two icons, <em className="font-normal text-brass">now in 3D.</em>
                </>
              }
              arabic="جوج ديال الإصدارات الجداد بتقنية 3D"
            />
          </Reveal>

          <div className="mt-14 grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-14">
            {NEW_EDITIONS.map((edition, i) => (
              <Reveal key={edition.key} delay={i * 0.12}>
                <EditionPanel edition={edition} product={editionProducts[i]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * THE COLLECTION
       * ───────────────────────────────────────────────────────────────── */}
      <section className="bg-paper px-5 py-24 md:py-32 lg:px-10">
        <div className="container mx-auto max-w-7xl">
          <Reveal className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading kicker="The collection" title="From the gallery" arabic="من الݣالوري ديالنا" />
            <Link href="/shop" className={`${btnGhostLight} self-start md:self-end`}>
              See all pieces
              <ArrowRight />
            </Link>
          </Reveal>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <WheelLoader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
              {collection.map((p, i) => (
                <Reveal key={p._id} delay={(i % 4) * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * CRAFT — how a piece is made
       * ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink px-5 py-24 text-ivory md:py-32 lg:px-10">
        <div className="zellige pointer-events-none absolute inset-0 opacity-40" />
        <div className="container relative mx-auto max-w-7xl">
          <Reveal className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-brass-light" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brass-light">The making</span>
            </div>
            <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.02] tracking-tight">
              Made by hand, <em className="font-normal text-brass-light">built to last.</em>
            </h2>
            <p className="mt-3 w-fit font-ar text-lg text-ivory/60 md:text-xl" dir="rtl">
              من الرسم حتى للحيط ديالك
            </p>
          </Reveal>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
            {CRAFT.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1} className="border-t border-ivory/15 pt-8">
                <p className="font-display text-5xl italic text-brass-light">{step.n}</p>
                <h3 className="mt-4 font-display text-3xl font-medium">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ivory/65">{step.body}</p>
                <p className="mt-2 w-fit font-ar text-base text-ivory/45" dir="rtl">
                  {step.ar}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
       * CUSTOM ORDER
       * ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-24 md:py-36 lg:px-10">
        <Reveal className="container mx-auto max-w-4xl text-center">
          <SectionHeading
            align="center"
            kicker="Made to order"
            title={
              <>
                Bring the car. <em className="font-normal text-brass">We build the wall.</em>
              </>
            }
            arabic="مالقيتيش الطوموبيل لي كتعجبك؟ صيفط لينا الماركا والموديل."
          />
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone md:text-lg">
            Send us the model, the angle and the colour. We draw it, print it and deliver it — a piece made for you alone.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/customize" className={btnDark}>
              Request custom art
              <ArrowRight />
            </Link>
            <a
              href={whatsappLink('Salam L7it, bghit lawha custom dyal tomobil dyali.')}
              target="_blank"
              rel="noopener noreferrer"
              className={btnGhostLight}
            >
              Ask on WhatsApp
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

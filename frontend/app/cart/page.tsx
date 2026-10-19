'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { btnPrimary, h1Display, h2Display, kickerLabel } from '@/lib/uiStyles';
import Plate from '@/components/Plate';
import TransitionLink from '@/components/TransitionLink';
import { hideBrokenImage } from '@/components/ProductCard';
import { dimensionsOf, shortDimensions } from '@/lib/dimensions';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Graphite panel with a hairline ring. */
const PANEL = 'relative overflow-hidden rounded-2xl bg-carbon ring-1 ring-white/[0.08]';

/** 44px stepper / icon buttons with an inset focus ring. */
const stepBtn =
  'flex h-11 w-11 items-center justify-center text-chalk transition-colors hover:bg-white/[0.06] active:bg-white/10 aria-disabled:cursor-not-allowed aria-disabled:text-smoke aria-disabled:hover:bg-transparent focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_#8FCBFF]';

/** Index-free React keys, so removing a row doesn't remount (and re-animate) every row after it. */
function rowKeys(items: { _id: string; selectedSize?: string }[]): string[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = `${item._id}-${item.selectedSize || 'default'}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  });
}

/* ------------------------------------------------------------------ *
 * Icons — decorative, always paired with visible text or an aria-label.
 * ------------------------------------------------------------------ */

type IconProps = { className?: string };

const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

function ArrowIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON} strokeWidth={2.5} className={className}>
      <path d="M13 5l7 7-7 7M4 12h15" />
    </svg>
  );
}

function MinusIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON} strokeWidth={2.5} className={className}>
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON} strokeWidth={2.5} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON} className={className}>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l.9 12.1a1.5 1.5 0 001.5 1.4h6.2a1.5 1.5 0 001.5-1.4L17.5 7M10 11v6M14 11v6" />
    </svg>
  );
}

function CashIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...ICON} strokeWidth={1.8} className={className}>
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 10v4M18 10v4" />
    </svg>
  );
}

function TruckIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON} strokeWidth={1.8} className={className}>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

function RouteIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON} strokeWidth={1.8} className={className}>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h7.5a3 3 0 000-6h-7a3 3 0 010-6H16" />
    </svg>
  );
}

function FlagIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...ICON} strokeWidth={1.8} className={className}>
      <path d="M5 21V4M5 4.5h12l-2.5 4 2.5 4H5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const STEPS = ['Cart', 'Details', 'Done'];

/** Cart → checkout → done. */
function PitLane() {
  return (
    <nav aria-label="Checkout steps">
      <ol className="flex flex-wrap items-center gap-x-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === 0 ? 'step' : undefined}
            className={`flex min-h-[44px] items-center gap-1.5 ${i === 0 ? 'text-chalk' : 'text-smoke'}`}
          >
            {i > 0 && <span aria-hidden="true" className="h-px w-3 bg-white/20 sm:w-6" />}
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                i === 0 ? 'bg-chalk text-asphalt' : 'bg-white/[0.06] text-smoke'
              }`}
            >
              {i + 1}
            </span>
            <span className="ms-0.5">{label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Top-down parking bay with a dashed "your next car" outline. */
function EmptyBay({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 240 180" fill="none" aria-hidden="true" className={className}>
      <path d="M44 8v164M196 8v164" stroke="#F2F3F5" strokeOpacity="0.4" strokeWidth="4" />
      <rect x="94" y="12" width="52" height="8" rx="2" fill="#C3C8CF" />
      <motion.g
        stroke="#F2F3F5"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeDasharray="7 7"
        animate={reduce ? undefined : { strokeDashoffset: [0, -28] }}
        transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}
      >
        <rect x="80" y="30" width="80" height="138" rx="28" />
        <path d="M89 74q31-11 62 0l-7 22H96z" />
        <path d="M96 132h48l6 18q-30 8-60 0z" />
      </motion.g>
      <g fill="#F2F3F5" fillOpacity="0.22">
        <rect x="72" y="48" width="7" height="24" rx="3" />
        <rect x="161" y="48" width="7" height="24" rx="3" />
        <rect x="72" y="126" width="7" height="24" rx="3" />
        <rect x="161" y="126" width="7" height="24" rx="3" />
      </g>
    </svg>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, calculateTotal } = useCart();
  const { t } = useLanguage();

  // Display-only values derived from the cart.
  const keys = rowKeys(cart);
  const pieces = cart.reduce((n, item) => n + item.quantity, 0);
  const total = calculateTotal().toFixed(0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate min-h-dvh overflow-x-clip bg-asphalt pb-24 pt-28 text-chalk md:pt-32 lg:pb-20">
        <div aria-hidden="true" className="speed-lines pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(60%_55%_at_12%_0%,rgba(143,203,255,0.08),transparent_70%)]"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <PitLane />
            <p className={`${kickerLabel} mt-6 sm:mt-8`}>{t('shoppingCart')}</p>
            <h1 className={`${h1Display} mt-3 text-[clamp(2.5rem,7vw,5rem)] text-chalk`}>
              Your <span className="text-metal">garage</span>
            </h1>
            <p className="mt-3 w-fit font-ar text-xl font-semibold text-smoke sm:text-2xl" dir="rtl">
              الكاراج ديالك
            </p>
          </motion.header>

          {cart.length === 0 ? (
            /* Empty garage — fades in late so the brief empty render before the
               saved cart loads never flashes on screen. */
            <motion.section
              aria-labelledby="empty-garage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
              className={`${PANEL} mt-10 overflow-hidden px-5 pb-12 pt-14 text-center sm:px-10 sm:pb-16 lg:mt-14`}
            >
              <EmptyBay className="mx-auto h-36 w-auto sm:h-44" />
              <h2 id="empty-garage" className={`${h2Display} mt-6 text-[clamp(2rem,8vw,4rem)] text-chalk`}>
                Empty garage
              </h2>
              <p className="mx-auto mt-3 w-fit font-ar text-xl font-semibold text-smoke sm:text-2xl" dir="rtl">
                الكاراج خاوي — ختار الطوموبيل ديالك
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-smoke sm:text-base">
                {t('emptyCart')}. Pick a car and park it here.
              </p>
              <Link href="/shop" className={`${btnPrimary} mt-8`}>
                {t('continueShopping')}
                <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100" />
              </Link>
            </motion.section>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-12 lg:items-start lg:gap-12">
              {/* Line items */}
              <section aria-labelledby="garage-lineup" className="lg:col-span-7 xl:col-span-8">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <h2 id="garage-lineup" className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-chalk">
                    Lineup · {pieces} {pieces === 1 ? 'piece' : 'pieces'}
                  </h2>
                </div>

                <ul className="mt-4 space-y-4">
                  <AnimatePresence>
                    {cart.map((item, index) => {
                      const size = shortDimensions(item.sizeLabel || dimensionsOf(item));
                      return (
                        <motion.li
                          key={keys[index]}
                          layout="position"
                          initial={{ opacity: 0, y: 24 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.5, ease: EASE, delay: Math.min(index, 5) * 0.07 },
                          }}
                          exit={{ opacity: 0, x: 72, transition: { duration: 0.28, ease: 'easeIn' } }}
                          transition={{ layout: { duration: 0.35, ease: EASE } }}
                          className={PANEL}
                        >
                          <TransitionLink
                            href={`/product/${item._id}`}
                            className="group/row flex gap-3 p-3 ps-4 focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_#8FCBFF] sm:gap-5 sm:p-4 sm:ps-6"
                          >
                            <span className="relative block aspect-[4/3] w-28 shrink-0 self-start overflow-hidden bg-carbon-2 sm:w-44">
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center justify-center font-display text-sm font-black uppercase text-white/10 stretch-150"
                              >
                                L7IT
                              </span>
                              {item.image && (
                                <img
                                  data-vt-img
                                  src={item.image}
                                  alt={item.name}
                                  loading="lazy"
                                  onError={hideBrokenImage}
                                  className="relative h-full w-full object-cover transition-transform duration-500 ease-out group-hover/row:scale-105"
                                />
                              )}
                            </span>

                            <span className="block min-w-0 flex-1 py-0.5">
                              <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-smoke">
                                <span className="truncate">{item.category}</span>
                              </span>
                              <h3 className="mt-1.5 line-clamp-2 font-display text-base font-semibold uppercase leading-[1.1] text-chalk stretch-125 transition-colors group-hover/row:text-silver-light sm:text-2xl">
                                {item.name}
                              </h3>
                              <span className="mt-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-smoke">
                                {size}
                                <span className="hidden sm:inline"> · Alu 3 mm · UV matte</span>
                              </span>
                              <span className="mt-1 block font-mono text-[11px] tabular-nums text-smoke">
                                {item.price} MAD × {item.quantity}
                              </span>
                            </span>
                          </TransitionLink>

                          {/* Telemetry strip: quantity · line total · remove */}
                          <div className="flex items-stretch border-t border-white/10">
                            <div
                              role="group"
                              aria-label={`Quantity, ${item.name}`}
                              className="flex items-center border-e border-white/10"
                            >
                              <button
                                type="button"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                aria-disabled={item.quantity <= 1}
                                aria-label={`Decrease quantity of ${item.name}`}
                                className={stepBtn}
                              >
                                <MinusIcon />
                              </button>
                              <span
                                aria-live="polite"
                                className="min-w-[2.25rem] text-center font-mono text-sm font-bold tabular-nums text-chalk"
                              >
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                aria-label={`Increase quantity of ${item.name}`}
                                className={stepBtn}
                              >
                                <PlusIcon />
                              </button>
                            </div>

                            <p className="flex min-w-0 flex-1 items-center justify-end gap-1.5 px-3 sm:px-4">
                              <span className="sr-only">Line total</span>
                              <span className="font-display text-lg font-semibold tabular-nums text-chalk sm:text-xl">
                                {(item.price * item.quantity).toFixed(0)}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-smoke">MAD</span>
                            </p>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item._id)}
                              className="flex min-h-[44px] min-w-[3rem] items-center justify-center gap-2 border-s border-white/10 pe-4 ps-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-smoke transition-colors hover:bg-white/[0.04] hover:text-chalk focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_#8FCBFF] sm:pe-5 sm:ps-4"
                            >
                              <TrashIcon />
                              <span className="sr-only sm:not-sr-only">{t('remove')}</span>
                              <span className="sr-only"> {item.name}</span>
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </section>

              {/* Summary — telemetry box */}
              <motion.aside
                aria-labelledby="garage-summary"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
                className="lg:sticky lg:top-32 lg:col-span-5 xl:col-span-4"
              >
                <div className={`${PANEL} overflow-hidden`}>
                  <div className="p-5 sm:p-7">
                    <h2
                      id="garage-summary"
                      className="font-display text-2xl font-semibold uppercase leading-none text-chalk stretch-125"
                    >
                      {t('orderSummary')}
                    </h2>

                    <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-smoke">{t('subtotal')}</dt>
                        <dd className="tabular-nums text-chalk">{total} MAD</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-smoke">{t('shipping')}</dt>
                        <dd className="text-chalk">Free</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-smoke">Pieces</dt>
                        <dd className="tabular-nums text-chalk">{pieces}</dd>
                      </div>
                    </dl>

                    <div className="mt-6">
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-chalk stretch-125">
                          {t('total')}
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                          MAD · order total
                        </span>
                      </p>
                      <Plate
                        className="mt-3"
                        size="lg"
                        left={total}
                        letter="د.م"
                        right="MAD"
                        aria-label={`${t('total')}: ${total} MAD`}
                      />
                    </div>

                    <p className="mt-6 flex items-center gap-3 rounded-xl bg-carbon-2 px-4 py-3 text-sm font-semibold text-chalk">
                      <CashIcon className="h-5 w-5 shrink-0 text-silver" />
                      <span>
                        Cash on delivery{' '}
                        <span className="font-ar font-medium text-smoke">· الخلاص عند الاستلام</span>
                      </span>
                    </p>

                    {/* On phones the sticky bar below carries the checkout button. */}
                    <div className="mt-5 hidden lg:block">
                      <Link href="/checkout" className={`${btnPrimary} w-full`}>
                        {t('proceedToCheckout')}
                        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100" />
                      </Link>
                    </div>

                    <Link
                      href="/shop"
                      className="mt-2 flex min-h-[44px] items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-smoke transition-colors hover:text-chalk focus-visible:text-chalk focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline-none"
                    >
                      <ArrowIcon className="h-3.5 w-3.5 -scale-x-100 rtl:scale-x-100" />
                      {t('continueShopping')}
                    </Link>

                    <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-smoke">
                      <li className="flex items-center gap-2.5">
                        <TruckIcon className="h-4 w-4 shrink-0 text-chalk" />
                        Delivery 24h – 3 days · all Morocco
                      </li>
                      <li className="flex items-center gap-2.5">
                        <RouteIcon className="h-4 w-4 shrink-0 text-chalk" />
                        Tracking number on every order
                      </li>
                      <li className="flex items-center gap-2.5">
                        <FlagIcon className="h-4 w-4 shrink-0 text-chalk" />
                        Made in Rabat · ready to hang
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.aside>
            </div>
          )}
        </div>

        {/* Phones: total + checkout always within thumb reach. Sits below the
            WhatsApp bubble (which floats ~140px up). */}
        {cart.length > 0 && (
          <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-asphalt/90 backdrop-blur-xl lg:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-smoke">
                  {t('total')} <span className="text-smoke">· COD</span>
                </p>
                <p className="truncate font-display text-2xl font-semibold leading-tight tabular-nums text-chalk">
                  {total}
                  <span className="ms-1 font-mono text-[11px] font-bold text-smoke">MAD</span>
                </p>
              </div>
              <Link href="/checkout" className={`${btnPrimary} shrink-0 !gap-2 !px-6`}>
                {t('checkout')}
                <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

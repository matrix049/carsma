'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import Plate from '@/components/Plate';
import { hideBrokenImage } from '@/components/ProductCard';
import { btnPrimary, kickerLabel } from '@/lib/uiStyles';
import { DUO_LABEL_AR, DUO_PRICE, duoPricing } from '@/lib/bundles';
import { dimensionsOf } from '@/lib/dimensions';
import { isAvailable } from '@/lib/stock';
import { NEW_EDITIONS } from '@/lib/newEditions';

/**
 * "Take both" — the G-Class 3D + 911 3D for one price. Adds whichever of the
 * two isn't in the cart yet and opens the cart, where the offer comes off.
 * Hidden unless both editions are on sale.
 */
export default function DuoOffer({ editions, compact = false }: { editions: (Product | undefined)[]; compact?: boolean }) {
  const router = useRouter();
  const { cart, addToCart } = useCart();
  if (editions.length !== NEW_EDITIONS.length || !editions.every((p): p is Product => !!p && isAvailable(p))) return null;
  const pair = editions as Product[];
  const { full, saving } = duoPricing(pair);
  if (!saving) return null;

  const addBoth = () => {
    for (const p of pair) {
      if (!cart.some((item) => item._id === p._id)) addToCart(p, 'M', dimensionsOf(p));
    }
    router.push('/cart');
  };

  const thumbs = (
    <div className={`flex flex-none ${compact ? '-space-x-5' : '-space-x-8'}`} aria-hidden="true">
      {pair.map((p, i) => (
        <div
          key={p._id}
          className={`overflow-hidden rounded-xl bg-carbon-2 ring-2 ring-asphalt ${compact ? 'h-16 w-16' : 'h-24 w-24 sm:h-28 sm:w-28'} ${i ? 'rotate-3' : '-rotate-3'}`}
        >
          {p.image && <img src={p.image} alt="" loading="lazy" onError={hideBrokenImage} className="h-full w-full object-cover" />}
        </div>
      ))}
    </div>
  );

  const price = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <Plate size={compact ? 'sm' : 'md'} left={DUO_PRICE} letter="د.م" right="MAD" aria-label={`${DUO_PRICE} MAD for both`} />
      <span className="font-mono text-sm text-smoke line-through">{full} MAD</span>
      <span className="rounded-full bg-xenon/10 px-2.5 py-0.5 text-xs font-semibold text-xenon ring-1 ring-inset ring-xenon/30">−{saving} MAD</span>
    </div>
  );

  if (compact) {
    return (
      <div className="mt-5 rounded-2xl bg-carbon p-4 ring-1 ring-xenon/25">
        <div className="flex items-center gap-4">
          {thumbs}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-smoke">
              Take both <span className="font-ar normal-case tracking-normal">· {DUO_LABEL_AR}</span>
            </p>
            <p className="mt-0.5 text-sm font-semibold text-chalk">G-Class 3D + 911 3D</p>
          </div>
        </div>
        <div className="mt-3">{price}</div>
        <button type="button" onClick={addBoth} className={`${btnPrimary} mt-4 w-full`}>
          Add both to cart <span className="font-ar text-sm normal-case tracking-normal opacity-70">· زيد الجوج</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-carbon p-5 ring-1 ring-xenon/25 sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_50%,rgba(143,203,255,0.08),transparent_70%)]" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        {thumbs}
        <div className="min-w-0 flex-1">
          <p className={kickerLabel}>
            3D duo offer <span className="font-ar normal-case tracking-normal">· {DUO_LABEL_AR}</span>
          </p>
          <p className="mt-2 font-display text-2xl font-semibold uppercase leading-tight text-chalk stretch-125 sm:text-3xl">Take both, pay less.</p>
          <p className="mt-1 text-sm text-silver">G-Class 3D + 911 3D</p>
          <div className="mt-3">{price}</div>
        </div>
        <button type="button" onClick={addBoth} className={`${btnPrimary} w-full md:w-auto`}>
          Add both to cart <span className="font-ar text-sm normal-case tracking-normal opacity-70">· زيد الجوج</span>
        </button>
      </div>
    </div>
  );
}

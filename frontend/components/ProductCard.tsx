'use client';

import React, { useRef } from 'react';
import { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPinnedIndex } from '@/lib/pinnedProducts';
import { isNewEdition } from '@/lib/newEditions';
import { dimensionsOf, parseDimensions } from '@/lib/dimensions';
import TransitionLink from '@/components/TransitionLink';

interface ProductCardProps {
  product: Product;
  /** Position in the list — printed as the card number ("N°07"). */
  index?: number;
}

/** Hide a broken image so the carbon panel behind it shows instead. */
export function hideBrokenImage(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.visibility = 'hidden';
}

/**
 * Collectable "trading card": tilts toward the cursor with a holographic
 * foil sweep (mouse only), spec strip like a homologation sheet, F1 timing
 * badges — purple P1–P4 for the most wanted, volt for new drops.
 */
export default function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  const isNew = isNewEdition(product.name);
  const pin = getPinnedIndex(product.name);
  const dimensions = dimensionsOf(product);
  const dims = parseDimensions(dimensions);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 'M', dimensions);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((x - 0.5) * 11).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  };

  const onPointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <article className="group relative flex h-full flex-col">
      <TransitionLink href={`/product/${product._id}`} className="flex flex-1 flex-col focus-visible:outline-none">
        <div
          ref={cardRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="holo-card relative overflow-hidden rounded-xl bg-carbon ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 ease-out [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] group-hover:shadow-[0_28px_60px_-28px_rgba(229,32,12,0.6)] group-hover:ring-white/25 group-focus-visible:ring-2 group-focus-visible:ring-redline"
        >
          {/* Card header */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-smoke sm:text-[10px]">
            <span>{index !== undefined ? `N°${String(index + 1).padStart(2, '0')}` : 'L7IT'}</span>
            <span className="truncate">{product.category}</span>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden bg-carbon-2">
            {product.image && (
              <img
                data-vt-img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                onError={hideBrokenImage}
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

            {pin >= 0 && (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-timing-purple px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-[0_0_14px_rgba(176,75,255,0.55)]">
                P{pin + 1}
                <span className="hidden font-sans text-[9px] font-semibold uppercase tracking-wider opacity-90 sm:inline">most wanted</span>
              </span>
            )}
            {isNew && (
              <span className="absolute left-2 top-2 rounded-sm bg-volt px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-asphalt">
                New drop · 3D
              </span>
            )}

            {!product.inStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-asphalt/70 backdrop-blur-[2px]">
                <span className="chamfer-sm bg-chalk px-3 py-1 font-display text-[11px] font-black uppercase tracking-[0.14em] text-asphalt stretch-125">
                  {t('outOfStock')}
                </span>
              </div>
            )}
          </div>

          {/* Spec strip */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-smoke sm:text-[9px]">
            <span className="truncate px-1 py-1.5">
              {dims ? (
                <>
                  {dims.w}×{dims.h}
                  <span className="hidden sm:inline"> cm</span>
                </>
              ) : (
                dimensions
              )}
            </span>
            <span className="truncate px-1 py-1.5">Alu 3 mm</span>
            <span className="truncate px-1 py-1.5">UV matte</span>
          </div>

          <div aria-hidden="true" className="holo-foil pointer-events-none absolute inset-0" />
        </div>

        <div className="flex flex-1 flex-col pt-3">
          <h3 className="font-display text-[15px] font-extrabold uppercase leading-[1.05] text-chalk stretch-125 line-clamp-2 sm:text-lg">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-display text-lg font-black text-chalk sm:text-xl">
              {product.price}
              <span className="ml-1 font-mono text-[10px] font-bold text-smoke">MAD</span>
            </span>
            <span className="font-mono text-[11px] text-smoke/80 line-through">{Math.ceil(product.price * 1.2)}</span>
          </div>
        </div>
      </TransitionLink>

      <button
        onClick={handleAddToCart}
        disabled={!product.inStock}
        className="chamfer-sm mt-3 inline-flex w-full items-center justify-center gap-2 bg-white/[0.05] px-3 py-2.5 font-display text-[10px] font-extrabold uppercase tracking-[0.12em] text-chalk shadow-[inset_0_0_0_1px_rgba(244,244,240,0.18)] transition-colors duration-200 stretch-125 hover:bg-redline hover:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/[0.05] sm:text-[11px]"
      >
        {product.inStock ? (
          <>
            <span className="whitespace-nowrap">{t('addToCart')}</span>
            <span className="hidden whitespace-nowrap font-ar text-[12px] font-semibold normal-case tracking-normal opacity-80 sm:inline">· زيد للسلة</span>
          </>
        ) : (
          t('unavailable')
        )}
      </button>
    </article>
  );
}

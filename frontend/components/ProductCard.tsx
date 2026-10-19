'use client';

import React from 'react';
import { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPinnedIndex } from '@/lib/pinnedProducts';
import { isNewEdition } from '@/lib/newEditions';
import { dimensionsOf, parseDimensions } from '@/lib/dimensions';
import { brandOf } from '@/lib/brands';
import TransitionLink from '@/components/TransitionLink';
import BrandLogo from '@/components/BrandLogo';
import Plate from '@/components/Plate';

interface ProductCardProps {
  product: Product;
  /** Position in the list (kept for callers; not shown). */
  index?: number;
}

/** Hide a broken image so the carbon panel behind it shows instead. */
export function hideBrokenImage(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.visibility = 'hidden';
}

/**
 * Showroom card: brand emblem + size on top, the piece, then the name and
 * the price on a Moroccan plate.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const isNew = isNewEdition(product.name);
  const pin = getPinnedIndex(product.name);
  const dimensions = dimensionsOf(product);
  const dims = parseDimensions(dimensions);
  const brand = brandOf(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 'M', dimensions);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <TransitionLink href={`/product/${product._id}`} className="flex flex-1 flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon focus-visible:ring-offset-4 focus-visible:ring-offset-asphalt">
        <div className="relative overflow-hidden rounded-2xl bg-carbon ring-1 ring-white/[0.08] transition-[box-shadow,transform] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] group-hover:ring-white/20">
          <div className="relative aspect-[4/3] overflow-hidden bg-carbon-2">
            {product.image && (
              <img
                data-vt-img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                onError={hideBrokenImage}
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

            {/* Emblem + size */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-2.5 sm:p-3">
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-black/45 py-1 pl-1.5 pr-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-silver-light backdrop-blur-md sm:text-[11px]">
                <BrandLogo brand={brand ?? product.category} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">{brand?.name ?? product.category}</span>
              </span>
              {dims && (
                <span className="hidden shrink-0 rounded-full bg-black/45 px-2 py-1 font-mono text-[10px] text-silver backdrop-blur-md sm:inline">
                  {dims.w}×{dims.h}
                </span>
              )}
            </div>

            {(isNew || pin >= 0) && (
              <span className="absolute bottom-2.5 left-2.5 rounded-full bg-chalk px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-asphalt sm:bottom-3 sm:left-3">
                {isNew ? 'New · 3D' : 'Most wanted'}
              </span>
            )}

            {!product.inStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-asphalt/70 backdrop-blur-[2px]">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk ring-1 ring-white/20">
                  {t('outOfStock')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 pt-3.5">
          <h3 className="line-clamp-2 font-display text-[14px] font-semibold uppercase leading-[1.15] tracking-[0.01em] text-chalk stretch-125 sm:text-base">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center gap-2">
            <Plate size="sm" left={product.price} letter="د.م" right="MAD" aria-label={`${product.price} MAD`} />
            <span className="font-mono text-[11px] text-smoke/80 line-through">{Math.ceil(product.price * 1.2)}</span>
          </div>
        </div>
      </TransitionLink>

      <button
        onClick={handleAddToCart}
        disabled={!product.inStock}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/[0.04] px-3 py-2.5 text-[12px] font-semibold text-chalk ring-1 ring-inset ring-white/15 transition-colors duration-200 hover:bg-chalk hover:text-asphalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/[0.04] disabled:hover:text-chalk"
      >
        {product.inStock ? (
          <>
            <span className="whitespace-nowrap">{t('addToCart')}</span>
            <span className="hidden whitespace-nowrap font-ar text-[12px] font-normal opacity-70 sm:inline">· زيد للسلة</span>
          </>
        ) : (
          t('unavailable')
        )}
      </button>
    </article>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPinnedIndex } from '@/lib/pinnedProducts';
import { isNewEdition } from '@/lib/newEditions';

const DEFAULT_DIMENSIONS = '120cm x 35cm';

interface ProductCardProps {
  product: Product;
  /** `lg` adds the description line — used where cards get more room. */
  size?: 'md' | 'lg';
}

/** Hide a broken image so the paper mat behind it shows instead. */
export function hideBrokenImage(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.visibility = 'hidden';
}

export default function ProductCard({ product, size = 'md' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const isNew = isNewEdition(product.name);
  const isPopular = !isNew && getPinnedIndex(product.name) >= 0;
  const dimensions = (product.dimensions || '').trim() || DEFAULT_DIMENSIONS;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 'M', dimensions);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/product/${product._id}`} className="flex flex-1 flex-col">
        {/* Paper mat — the artwork floats on it like a gallery print */}
        <div className="relative aspect-square w-full overflow-hidden bg-paper ring-1 ring-line transition-shadow duration-500 group-hover:shadow-[0_24px_50px_-28px_rgba(22,19,15,0.45)]">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              onError={hideBrokenImage}
            />
          )}

          {(isNew || isPopular) && (
            <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 bg-ivory/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
              <span className={`h-1.5 w-1.5 rounded-full ${isNew ? 'bg-brass' : 'bg-ink'}`} />
              {isNew ? 'New 3D' : 'Most popular'}
            </span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-ivory/70 backdrop-blur-[2px]">
              <span className="bg-ink px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-3 sm:pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone">
            {product.category}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium leading-tight text-ink line-clamp-2 sm:text-2xl">
            {product.name}
          </h3>
          {size === 'lg' && product.description && (
            <p className="mt-2 text-sm leading-relaxed text-stone line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-ink sm:text-lg">
              {product.price} <span className="text-[11px] font-medium text-stone">MAD</span>
            </span>
            <span className="text-xs text-stone/80 line-through">
              {Math.ceil(product.price * 1.2)}
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={!product.inStock}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-ink/20 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink sm:text-[11px]"
      >
        {product.inStock ? (
          <>
            {t('addToCart')}
            <span className="font-ar text-[12px] normal-case tracking-normal opacity-70">· زيد للسلة</span>
          </>
        ) : (
          t('unavailable')
        )}
      </button>
    </article>
  );
}

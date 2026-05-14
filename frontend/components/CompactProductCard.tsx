'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompactProductCardProps {
  product: Product;
  /** When true, render a "Most Popular" accent badge in the top-right corner. */
  mostPopular?: boolean;
}

export default function CompactProductCard({ product, mostPopular = false }: CompactProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const imageUrl = product.image || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 relative">
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1 cursor-pointer">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 transition-transform duration-500 group-hover:-translate-y-1">
             <span className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0.5 md:px-3 md:py-1 text-[7px] md:text-[8px] font-black tracking-widest text-white uppercase shadow-xl">
               Limited Edition
             </span>
          </div>

          {mostPopular && (
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 transition-transform duration-500 group-hover:-translate-y-1">
              <span className="rounded-full bg-blue-600 border border-blue-400/40 px-2 py-0.5 md:px-3 md:py-1 text-[7px] md:text-[8px] font-black tracking-widest text-white uppercase shadow-xl shadow-blue-500/30 inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                Most Popular
              </span>
            </div>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[4px] z-20">
               <span className="rounded-full bg-red-600 px-4 py-1.5 text-[9px] font-black tracking-widest text-white uppercase shadow-2xl">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col p-3 md:p-4 flex-1">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <h3 className="font-display text-base md:text-xl tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">
              {product.name}
            </h3>
            <div className="flex flex-col items-end">
              <span className="text-[8px] md:text-[9px] font-black text-zinc-400 line-through tracking-widest decoration-blue-500/50 leading-none">
                {Math.ceil(product.price * 1.2)}<span className="text-[6px] md:text-[7px] ml-0.5">MAD</span>
              </span>
              <span className="font-display text-sm md:text-base text-blue-600 shrink-0 leading-none mt-1">
                {product.price}<span className="text-[8px] md:text-[9px] ml-0.5">MAD</span>
              </span>
            </div>
          </div>
          
          <p className="text-[8px] md:text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3 md:mb-4">
             {product.category}
          </p>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`group/btn mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 active:scale-[1.00] ${
              product.inStock
                ? 'bg-zinc-900 text-white hover:scale-[1.04] hover:opacity-95 dark:bg-white dark:text-black'
                : 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600'
            }`}
          >
            {product.inStock ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                {t('addToCart')}
              </>
            ) : t('unavailable')}
          </button>
        </div>
      </Link>
    </div>
  );
}

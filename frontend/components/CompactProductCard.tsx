'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompactProductCardProps {
  product: Product;
}

export default function CompactProductCard({ product }: CompactProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const imageUrl = product.image || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 w-full relative">
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1 cursor-pointer">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
            }}
          />
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
               <span className="rounded-full bg-red-600 px-3 py-1 text-[8px] font-bold tracking-widest text-white uppercase shadow-lg">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col p-4 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <span className="text-sm font-black text-blue-600 shrink-0">
              {product.price} <span className="text-[10px]">MAD</span>
            </span>
          </div>
          
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3">
             {product.category}
          </p>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
              product.inStock
                ? 'bg-black text-white hover:bg-zinc-800 active:scale-[0.96] dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            {product.inStock ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                {t('addToCart')}
              </>
            ) : t('unavailable')}
          </button>
        </div>
      </Link>
    </div>
  );
}

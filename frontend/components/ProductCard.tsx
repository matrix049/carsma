'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const imageUrl = product.image || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="group flex flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 w-full relative">
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1 cursor-pointer">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {!product.inStock && (
            <div className="absolute top-4 right-4 rounded-full bg-red-600/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold tracking-widest text-white shadow-lg uppercase">
              {t('outOfStock')}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
              {product.category}
            </p>
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              {product.price} <span className="text-sm font-bold text-zinc-400 ml-1">MAD</span>
            </span>
          </div>
          <h3 className="mb-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="mb-8 flex-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
            {product.description || t('exploreSelection')}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`mt-auto flex w-full items-center justify-center gap-2 rounded-2xl py-4.5 font-bold transition-all z-10 relative overflow-hidden group/btn ${
              product.inStock
                ? 'bg-black text-white hover:bg-zinc-800 hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                : 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {product.inStock ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  {t('addToCart')}
                </>
              ) : t('unavailable')}
            </span>
          </button>
        </div>
      </Link>
    </div>
  );
}

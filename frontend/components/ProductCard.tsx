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
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 w-full relative">
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1 cursor-pointer">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
            }}
          />
          {!product.inStock && (
            <div className="absolute top-3 right-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              {t('outOfStock')}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              {product.category}
            </p>
            <span className="text-xl font-black text-black dark:text-white">
              {product.price} MAD
            </span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {product.name}
          </h3>
          <p className="mb-6 flex-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description || 'No description available for this product.'}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`mt-auto flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all z-10 relative ${
              product.inStock
                ? 'bg-black text-white hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                : 'cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
            }`}
          >
            {product.inStock ? t('addToCart') : t('unavailable')}
          </button>
        </div>
      </Link>
    </div>
  );
}

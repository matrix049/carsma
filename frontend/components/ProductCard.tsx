'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add with default medium size
    addToCart({ ...product, price: product.price + 150 }, 'M', '50x70cm');
  };

  const imageUrl = product.image || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 w-full relative"
    >
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1 cursor-pointer">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-all duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-6 left-6 z-10">
             <span className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 text-[8px] font-black tracking-widest text-white uppercase shadow-2xl">
                <div className="h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Limited Edition
             </span>
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[4px] z-20">
               <span className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-2xl">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
              {product.category}
            </p>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-zinc-400 line-through tracking-widest decoration-blue-500/50">
                {Math.ceil(product.price * 1.5)} <span className="text-[8px]">MAD</span>
              </span>
              <span className="text-3xl font-black text-zinc-900 dark:text-white font-jakarta">
                {product.price} <span className="text-[10px] font-black text-zinc-500 ml-0.5 uppercase">MAD</span>
              </span>
            </div>
          </div>
          <h3 className="mb-4 text-2xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 transition-colors font-jakarta uppercase">
            {product.name}
          </h3>
          <p className="mb-10 flex-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
            {product.description || t('exploreSelection')}
          </p>
          <div className="flex gap-3 mt-auto">
            <Link
              href={`/product/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center rounded-2xl py-5 px-5 text-[10px] font-black uppercase tracking-widest transition-all bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-[0.98] dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-3 rounded-2xl py-5 text-[10px] font-black uppercase tracking-widest transition-all z-10 relative overflow-hidden group/btn ${
                product.inStock
                  ? 'bg-zinc-900 text-white hover:bg-black hover:shadow-2xl active:scale-[0.98] dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  : 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    {t('addToCart')}
                  </>
                ) : t('unavailable')}
              </span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

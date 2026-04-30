'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import AnalyticsService from '@/lib/analyticsService';
import { btnAccent, btnDark } from '@/lib/uiStyles';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single standard size — every product ships at the same fixed dimensions.
  const standardSize = { id: 'M', label: '120cm x 35cm' };
  const [quantity, setQuantity] = useState<number>(1);
  const unitPrice = product ? product.price : 0;
  const totalPrice = unitPrice * quantity;

  useEffect(() => {
    async function loadProduct() {
      try {
        const products = await fetchProducts();
        const found = products.find(p => p._id === id);
        if (found) {
          setProduct(found);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  // Track product view when product loads successfully
  useEffect(() => {
    if (product && !isLoading && !error) {
      // Track the product view asynchronously
      const trackView = async () => {
        try {
          await AnalyticsService.trackProductView(product._id);
        } catch (error) {
          // Analytics failures should not affect user experience
          console.warn('Product view tracking failed:', error);
        }
      };
      
      trackView();
    }
  }, [product, isLoading, error]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent shadow-[0_0_15px_rgba(37,99,235,0.5)]"
         />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-6 py-48 text-center bg-black min-h-screen">
        <h1 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter">{error || 'Product not found'}</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-500 font-black uppercase tracking-widest text-[10px]">
          &larr; {t('backToArtworks')}
        </Link>
      </div>
    );
  }

  const imageUrl = product.image || 'https://via.placeholder.com/800x600?text=No+Image';
  const alignIconClass = language === 'ar' ? 'ml-2 rotate-180' : 'mr-2';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <div className="container mx-auto px-6 py-20 md:py-32 lg:py-48 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 md:mb-16"
        >
          <Link href="/shop" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-blue-600 transition-colors group">
            <svg className={`${alignIconClass} h-3.5 w-3.5 transition-transform group-hover:-translate-x-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t('backToArtworks')}
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-24 lg:gap-32">
          {/* Kinetic Image Reveal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative aspect-square w-full max-w-md md:max-w-none mx-auto md:mx-0 overflow-hidden rounded-3xl md:rounded-[4rem] bg-zinc-900 border border-zinc-800 shadow-4xl group"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center grayscale-[0.2] transition-all duration-1000 group-hover:grayscale-0 brightness-[0.9] group-hover:brightness-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Unavailable';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-1000" />
            
            <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12">
               <span className="flex items-center gap-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 text-[10px] font-black tracking-[0.4em] text-white uppercase shadow-3xl">
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,1)]" />
                  Limited Edition
               </span>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            <motion.div variants={itemVariants} className="space-y-3 mb-4 md:space-y-8 md:mb-16">
              <span className="inline-block font-mono text-xs md:text-[10px] tracking-[0.35em] md:tracking-[0.5em] text-blue-600 uppercase">
                {product.category}
              </span>
              <h1 className="font-display text-[clamp(2.25rem,7vw,11rem)] uppercase leading-[0.85] tracking-tight text-zinc-900 dark:text-zinc-50">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-zinc-500 line-through leading-none">
                  {Math.ceil(product.price * 1.2)} MAD
                </span>
                <p className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white leading-none">
                  {unitPrice} <span className="text-base font-black text-zinc-400">MAD</span>
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2 mb-3 md:space-y-4 md:mb-10">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Size
              </label>
              <div className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
                {standardSize.label}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 mb-4 md:space-y-4 md:mb-16">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Quantity
              </label>
              <div className="inline-flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-700 px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2.5rem] text-center text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-3 md:mb-16">
              <p className="text-sm md:text-xl text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium max-w-xl">
                {product.description || 'Syynthesized automotive fidelity architected for high-end curation. Every detail captured with museum-grade precision.'}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart(
                      { ...product, price: unitPrice },
                      standardSize.id,
                      standardSize.label
                    );
                  }
                }}
                disabled={!product.inStock}
                className={`${btnAccent} flex w-full`}
              >
                {product.inStock ? (
                  <>
                    <span>Add to Cart • زيد للسلة</span>
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </>
                ) : t('unavailable')}
              </button>

              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart(
                      { ...product, price: unitPrice },
                      standardSize.id,
                      standardSize.label
                    );
                  }
                  router.push('/checkout');
                }}
                disabled={!product.inStock}
                className={`${btnDark} flex w-full`}
              >
                {product.inStock ? (
                  <>
                    <span>Buy Now • شري دابا</span>
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                ) : t('unavailable')}
              </button>

              {/* Secure Transaction Note */}
              <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                 <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 {t('codAvailability')}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

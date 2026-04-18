'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import MovingCarsBackground from '@/components/MovingCarsBackground';
import WheelLoader from '@/components/WheelLoader';
import WheelButton from '@/components/WheelButton';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        // Get all products instead of just first 4
        setFeaturedProducts(data);
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="flex w-full flex-col bg-white dark:bg-[#0a0a0a] relative">
      {/* Moving Cars Background */}
      <MovingCarsBackground />
      
      {/* Immersive Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center text-center px-4">
        {/* Background Image with Overlay */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="/hero_premium.png" 
            alt="Premium Automotive Art" 
            className="h-full w-full object-cover grayscale-[0.2] brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#0a0a0a]" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="z-10 max-w-5xl mx-auto space-y-12"
        >
          <div className="space-y-6">
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="inline-block rounded-full bg-blue-600/10 px-6 py-2 text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase backdrop-blur-md border border-blue-500/20"
            >
              {t('exclusiveTitle')}
            </motion.span>
            <h1 className="text-6xl font-black tracking-tighter text-white sm:text-8xl lg:text-[10rem] uppercase font-jakarta leading-[0.85]">
              {t('premiumWall')}<br /><span className="text-blue-600 drop-shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:drop-shadow-[0_0_50px_rgba(37,99,235,0.6)]">{t('wallCollection')}</span>
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-xl text-zinc-400 font-medium leading-relaxed">
            {t('heroDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-8">
            <WheelButton href="/shop" variant="primary">
              <span className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-2">
                  {t('exploreGallery')}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
                <span className="text-xs opacity-80">شوف اللوحات</span>
              </span>
            </WheelButton>
            <WheelButton href="/customize" variant="secondary">
              <span className="flex flex-col items-center gap-1">
                <span>{t('customizeYourDesign')}</span>
                <span className="text-xs opacity-80">طلب تصميم خاص</span>
              </span>
            </WheelButton>
          </div>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
        </motion.div>
      </section>

      {/* Featured Selection Header */}
      <section className="container mx-auto px-6 py-32 max-w-7xl">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
          className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Noir Selection</span>
            <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 sm:text-8xl uppercase font-jakarta">
              {t('featuredSelection')}
            </h2>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Link 
              href="/shop" 
              className="group inline-flex flex-col items-start gap-1 text-xs font-black text-blue-600 hover:text-blue-500 transition-all uppercase tracking-widest"
            >
              <span className="flex items-center gap-3">
                {t('exploreGallery')}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
              <span className="text-xs opacity-80 normal-case tracking-normal">شوف اللوحات</span>
            </Link>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <WheelLoader size="lg" />
            <p className="mt-8 text-sm font-black uppercase tracking-widest text-zinc-600">
              Loading Premium Collection...
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            {/* Auto-sliding carousel */}
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={containerVariants}
              className="flex gap-12 animate-scroll"
              style={{
                width: `${featuredProducts.length * 400}px`,
              }}
            >
              {/* Duplicate products for seamless loop */}
              {[...featuredProducts, ...featuredProducts].map((product, index) => (
                <motion.div 
                  key={`${product._id}-${index}`} 
                  variants={itemVariants}
                  className="flex-shrink-0 w-[350px]"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </section>

      {/* Custom Design CTA Section */}
      <section className="container mx-auto px-6 py-40 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-[4rem] bg-zinc-950 px-12 py-32 text-left shadow-4xl border border-zinc-900"
        >
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="h-full w-full bg-[radial-gradient(circle_at_70%_50%,#2563eb_0%,transparent_60%)] opacity-20"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl space-y-12">
            <h2 className="text-5xl font-black tracking-tighter text-white sm:text-8xl leading-[0.9] uppercase font-jakarta">
              {t('customDesignTitle')}
            </h2>
            <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-xl">
              {t('customDesignDesc')}
            </p>
            <div className="pt-8">
              <WheelButton href="/customize" variant="primary">
                <span className="flex flex-col items-center gap-1">
                  <span className="flex items-center gap-2">
                    {t('contactUsNow')}
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                  <span className="text-xs opacity-80">طلب تصميم خاص</span>
                </span>
              </WheelButton>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

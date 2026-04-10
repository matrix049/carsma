'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        // Just take the first 4 for the home page teaser
        setFeaturedProducts(data.slice(0, 4));
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="flex w-full flex-col">
      {/* Immersive Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center text-center px-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero_premium.png" 
            alt="Premium Automotive Art" 
            className="h-full w-full object-cover grayscale-[0.2] brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>
        
        <div className="z-10 max-w-5xl mx-auto space-y-10">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-blue-600/20 px-4 py-1.5 text-[10px] font-bold tracking-[0.3em] text-blue-400 uppercase backdrop-blur-md border border-blue-500/30">
              {t('exclusiveTitle')}
            </span>
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl uppercase">
              {t('premiumWall')} <span className="text-blue-500">{t('wallCollection')}</span>
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-xl text-zinc-300 font-medium leading-relaxed">
            {t('heroDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-4 text-center">
            <Link
              href="/shop"
              className="group relative rounded-full bg-blue-600 px-10 py-5 text-sm font-bold text-white shadow-2xl transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {t('exploreGallery')}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <Link
              href="/customize"
              className="rounded-full bg-white/10 backdrop-blur-xl border border-white/20 px-10 py-5 text-sm font-bold text-white shadow-xl transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              {t('customizeYourDesign')}
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* Trust Features Section */}
      <section className="bg-white dark:bg-black py-24 border-b border-zinc-100 dark:border-zinc-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="h-20 w-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{t('qualityTitle')}</h3>
              <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-[280px] leading-relaxed font-medium">{t('qualityDesc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="h-20 w-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{t('deliveryTitle')}</h3>
              <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-[280px] leading-relaxed font-medium">{t('deliveryDesc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="h-20 w-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 0 002-2v-7" /></svg>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{t('exclusiveTitle')}</h3>
              <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-[280px] leading-relaxed font-medium">{t('exclusiveDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Selection Teaser */}
      <section className="container mx-auto px-4 py-32 sm:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl uppercase">
              {t('featuredSelection')}
            </h2>
            <div className="h-2 w-24 bg-blue-600 rounded-full" />
          </div>
          <Link 
            href="/shop" 
            className="group inline-flex items-center gap-2 text-lg font-black text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-widest"
          >
            {t('exploreGallery')}
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Custom Design CTA Section */}
      <section className="container mx-auto px-4 py-24 sm:px-6 max-w-7xl pb-32">
        <div className="relative overflow-hidden rounded-[4rem] bg-zinc-950 px-8 py-24 sm:px-16 sm:py-32 text-left shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-zinc-800/50">
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="h-full w-full bg-[radial-gradient(circle_at_70%_50%,#3b82f6_0%,transparent_60%)] opacity-30"></div>
            <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl space-y-10">
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-7xl leading-tight uppercase">
              {t('customDesignTitle')}
            </h2>
            <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-xl">
              {t('customDesignDesc')}
            </p>
            <div className="pt-6">
              <Link
                href="/customize"
                className="group inline-flex items-center justify-center rounded-full bg-white px-12 py-5 text-lg font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-2xl"
              >
                {t('contactUsNow')}
                <svg className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

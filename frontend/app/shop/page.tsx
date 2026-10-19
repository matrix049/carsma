'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/ProductCard';
import WheelLoader from '@/components/WheelLoader';
import { btnPrimary, btnGhostDark, whatsappLink } from '@/lib/uiStyles';
import { applyPin } from '@/lib/pinnedProducts';

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProducts();
        setAllProducts(applyPin(data));
      } catch (err: any) {
        console.error('Failed to load shop products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.category))).filter(Boolean),
    [allProducts],
  );

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)),
      );
    }
    // Pinned products always float to the top of whatever's left.
    return applyPin(filtered);
  }, [selectedCategory, inStockOnly, searchQuery, allProducts]);

  const pill = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
      active ? 'border-ink bg-ink text-ivory' : 'border-line bg-paper text-stone hover:border-ink hover:text-ink'
    }`;

  return (
    <div className="bg-ivory">
      <div className="container mx-auto max-w-7xl px-5 pb-24 pt-32 md:pt-40 lg:px-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-8 border-b border-line pb-10 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-brass-light" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brass">The collection</span>
            </div>
            <h1 className="font-display text-[clamp(3.25rem,8vw,6.5rem)] font-medium leading-[0.95] tracking-tight text-ink">
              The Gallery
            </h1>
            <p className="mt-2 font-ar text-xl text-stone">الݣالوري ديال L7it</p>
          </div>

          {/* Search */}
          <label className="relative block w-full md:max-w-sm">
            <span className="sr-only">Search</span>
            <svg className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a car or brand… قلب على طوموبيل"
              className="w-full border-0 border-b border-ink/25 bg-transparent py-3 pl-8 pr-8 text-base text-ink placeholder:text-stone/70 focus:border-ink focus:outline-none focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </label>
        </motion.header>

        {/* Filters */}
        <div className="sticky top-16 z-30 -mx-5 flex items-center gap-3 bg-ivory/90 px-5 py-4 backdrop-blur-md md:top-20 lg:-mx-10 lg:px-10">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            <button onClick={() => setSelectedCategory('all')} className={pill(selectedCategory === 'all')}>
              {t('allCategories')}
            </button>
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)} className={pill(selectedCategory === category)}>
                {category}
              </button>
            ))}
          </div>
          <label className="hidden shrink-0 cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone sm:flex">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={() => setInStockOnly((v) => !v)}
              className="h-4 w-4 rounded-sm border-line text-ink focus:ring-brass"
            />
            In stock only
          </label>
        </div>

        {!isLoading && !error && (
          <p className="mb-8 mt-2 text-sm text-stone">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <WheelLoader size="lg" />
          </div>
        ) : error ? (
          <p className="py-32 text-center text-stone">{error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}

            {/* Custom design card — always last */}
            <Link
              href="/customize"
              className="group flex aspect-square flex-col justify-between bg-ink p-5 text-ivory sm:p-7"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brass-light">Custom order</p>
              <div>
                <h3 className="font-display text-2xl font-medium leading-tight sm:text-4xl">
                  Don&apos;t see your car?
                </h3>
                <p className="mt-2 font-ar text-sm text-ivory/60 sm:text-base">مالقيتيش الطوموبيل ديالك؟</p>
              </div>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Request it
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>

            {filteredProducts.length === 0 && (
              <p className="col-span-full py-24 text-center font-display text-3xl text-stone">{t('noArtworks')}</p>
            )}
          </div>
        )}
      </div>

      {/* Custom design CTA */}
      <section className="relative overflow-hidden bg-ink px-5 py-24 text-ivory md:py-32 lg:px-10">
        <div className="zellige pointer-events-none absolute inset-0 opacity-40" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brass-light">Made to order</p>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[1.02] tracking-tight">
            {t('customDesignTitle')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/65 md:text-lg">{t('customDesignDesc')}</p>
          <p className="mt-3 font-ar text-lg text-ivory/55" dir="rtl">
            مالقيتيش الطوموبيل لي كتعجبك؟ صيفط لينا الماركا والموديل لي بغيتي.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/customize" className={btnPrimary}>
              {t('contactUsNow')}
            </Link>
            <a
              href={whatsappLink('Salam L7it, bghit lawha custom dyal tomobil dyali.')}
              target="_blank"
              rel="noopener noreferrer"
              className={btnGhostDark}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

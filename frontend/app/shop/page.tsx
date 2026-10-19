'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

  // Brand deep links from the home page: /shop?category=Porsche
  useEffect(() => {
    if (!categories.length) return;
    const wanted = new URLSearchParams(window.location.search).get('category');
    if (!wanted) return;
    const match = categories.find((c) => c.toLowerCase() === wanted.toLowerCase());
    if (match) setSelectedCategory(match);
  }, [categories]);

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    if (category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  };

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

  const resetFilters = () => {
    selectCategory('all');
    setInStockOnly(false);
    setSearchQuery('');
  };

  const pill = (active: boolean) =>
    `chamfer-sm shrink-0 min-h-[40px] px-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
      active ? 'bg-redline text-white' : 'bg-white/[0.05] text-smoke shadow-[inset_0_0_0_1px_rgba(244,244,240,0.12)] hover:text-chalk'
    }`;

  return (
    <div className="bg-asphalt">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="speed-lines pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(229,32,12,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 pb-10 pt-32 sm:px-6 md:pb-14 md:pt-40 lg:px-10">
          <p className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot">
            <span className="h-[2px] w-8 bg-redline" />
            {isLoading ? 'Warming up' : `${allProducts.length} cars on the grid`}
          </p>
          <h1 className="mt-4 font-display text-[17vw] font-black uppercase leading-[0.82] text-chalk stretch-100 sm:text-[13vw] sm:stretch-125 lg:text-[11rem] lg:stretch-150">
            The <span className="text-outline-red">Garage</span>
          </h1>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="font-ar text-xl text-smoke md:text-2xl">الكاراج — ختار الطوموبيل ديال حلامك</p>

            {/* HUD search */}
            <label className="relative block w-full md:max-w-md">
              <span className="sr-only">Search</span>
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-redline-hot" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your dream car… قلب على طوموبيل"
                className="chamfer-sm min-h-[52px] w-full bg-carbon py-3 pl-12 pr-12 font-mono text-sm text-chalk shadow-[inset_0_0_0_1px_rgba(244,244,240,0.12)] placeholder:text-smoke focus:shadow-[inset_0_0_0_2px_#E5200C] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-smoke hover:text-chalk"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </label>
          </div>
        </div>
      </header>

      {/* Filters — sticks under the navbar */}
      <div className="sticky top-[67px] z-30 border-b border-white/10 bg-asphalt/85 backdrop-blur-xl md:top-[75px]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-3 sm:px-6 lg:px-10">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto" role="toolbar" aria-label="Brands">
            <button onClick={() => selectCategory('all')} aria-pressed={selectedCategory === 'all'} className={pill(selectedCategory === 'all')}>
              All cars
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                aria-pressed={selectedCategory === category}
                className={pill(selectedCategory === category)}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="hidden shrink-0 cursor-pointer items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-smoke sm:flex">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={() => setInStockOnly((v) => !v)}
              className="h-4 w-4 accent-[#E5200C]"
            />
            In stock only
          </label>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-8 sm:px-6 lg:px-10">
        {!isLoading && !error && (
          <p className="mb-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-smoke">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'car' : 'cars'}
            {selectedCategory !== 'all' && <span className="text-chalk"> · {selectedCategory}</span>}
          </p>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <WheelLoader size="lg" />
          </div>
        ) : error ? (
          <p className="py-32 text-center text-smoke">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-carbon py-24 text-center ring-1 ring-white/10">
            <p className="font-display text-4xl font-black uppercase text-chalk stretch-125">{t('noArtworks')}</p>
            <p className="font-ar text-lg text-smoke">ماكاين حتى طوموبيل بهاد الفيلتر</p>
            <button onClick={resetFilters} className={btnGhostDark}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}

            {/* Custom design card — always last */}
            <Link
              href="/customize"
              className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-xl bg-carbon p-4 ring-1 ring-white/10 transition-colors hover:ring-redline sm:p-6"
            >
              <div aria-hidden="true" className="hazard absolute inset-x-0 top-0 h-2" />
              <p className="pt-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-redline-hot">Custom build</p>
              <div>
                <h3 className="font-display text-2xl font-black uppercase leading-[0.9] text-chalk stretch-125 sm:text-4xl">
                  Don&apos;t see your ride?
                </h3>
                <p className="mt-2 font-ar text-sm text-smoke sm:text-base">مالقيتيش الطوموبيل ديالك؟</p>
              </div>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-chalk">
                We&apos;ll build it
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h15" />
                </svg>
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Custom design CTA */}
      <section className="relative overflow-hidden border-t border-white/10 px-5 py-24 sm:px-6 md:py-32 lg:px-10">
        <div className="speed-lines pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(229,32,12,0.2),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot">Made to order</p>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,8vw,6rem)] font-black uppercase leading-[0.88] text-chalk stretch-125">
            {t('customDesignTitle')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-smoke md:text-lg">{t('customDesignDesc')}</p>
          <p className="mx-auto mt-3 w-fit font-ar text-lg text-chalk/75" dir="rtl">
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

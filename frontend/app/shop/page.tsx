'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/ProductCard';
import NightDrive from '@/components/NightDrive';
import BrandLogo from '@/components/BrandLogo';
import { ProductCardSkeleton } from '@/components/Loader';
import { btnGhostDark, kickerLabel } from '@/lib/uiStyles';
import { applyPin } from '@/lib/pinnedProducts';
import { findBrand } from '@/lib/brands';

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

  // Brands with the most cars first.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    allProducts.forEach((p) => {
      if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => ({ category: c, count: n }));
  }, [allProducts]);

  // Brand deep links from the home page: /shop?category=Porsche
  useEffect(() => {
    if (!categories.length) return;
    const wanted = new URLSearchParams(window.location.search).get('category');
    if (!wanted) return;
    const match = categories.find(({ category }) => category.toLowerCase() === wanted.toLowerCase());
    if (match) setSelectedCategory(match.category);
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

  const chip = (active: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full py-2 pl-2.5 pr-4 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon ${
      active ? 'bg-chalk text-asphalt' : 'bg-white/[0.04] text-silver ring-1 ring-inset ring-white/10 hover:text-chalk hover:ring-white/25'
    }`;

  return (
    <div className="bg-asphalt">
      {/* Header — the same night road, dimmed */}
      <header className="relative overflow-hidden">
        <NightDrive className="absolute inset-0 h-full w-full opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-asphalt/40 via-asphalt/60 to-asphalt" />
        <div className="relative mx-auto max-w-[1440px] px-5 pb-10 pt-28 sm:px-6 md:pb-14 md:pt-40 lg:px-10">
          <p className={kickerLabel}>
            {isLoading ? 'Loading the garage' : `${allProducts.length} cars`} <span className="font-ar normal-case tracking-normal">· الكاراج</span>
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-metal font-display text-[clamp(2.75rem,9vw,7rem)] font-semibold uppercase leading-[0.95] stretch-125">
              The Garage
            </h1>

            <label className="relative block w-full md:max-w-sm">
              <span className="sr-only">Search</span>
              <svg className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-smoke" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a car… قلب على طوموبيل"
                className="min-h-[52px] w-full rounded-full bg-white/[0.05] py-3 pl-12 pr-12 text-base text-chalk ring-1 ring-inset ring-white/10 backdrop-blur-md placeholder:text-smoke focus:outline-none focus:ring-2 focus:ring-xenon/70 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-smoke hover:text-chalk"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </label>
          </div>
        </div>
      </header>

      {/* Brand filter — sticks under the navbar */}
      <div className="sticky top-[65px] z-30 border-y border-white/[0.06] bg-asphalt/85 backdrop-blur-xl md:top-[73px]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-3 sm:px-6 lg:px-10">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto" role="toolbar" aria-label="Brands">
            <button onClick={() => selectCategory('all')} aria-pressed={selectedCategory === 'all'} className={chip(selectedCategory === 'all')}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
                <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
                <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
                <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
              </svg>
              All
            </button>
            {categories.map(({ category, count }) => {
              const brand = findBrand(category);
              const active = selectedCategory === category;
              return (
                <button key={category} onClick={() => selectCategory(category)} aria-pressed={active} className={chip(active)}>
                  <BrandLogo brand={brand ?? category} className="h-5 w-5" />
                  {brand?.name ?? category}
                  <span className={`font-mono text-[10px] ${active ? 'text-asphalt/60' : 'text-smoke'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <label className="hidden shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-smoke sm:flex">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={() => setInStockOnly((v) => !v)}
              className="h-4 w-4 accent-[#C3C8CF]"
            />
            In stock only
          </label>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-8 sm:px-6 lg:px-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="py-32 text-center text-smoke">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-carbon py-24 text-center ring-1 ring-white/[0.08]">
            <p className="font-display text-3xl font-semibold uppercase text-chalk stretch-125">{t('noArtworks')}</p>
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
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl bg-carbon p-4 ring-1 ring-white/[0.08] transition-colors hover:ring-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon sm:p-6"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_100%_0%,rgba(143,203,255,0.10),transparent_60%)]" />
              <p className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-smoke">Custom build</p>
              <div className="relative">
                <h3 className="font-display text-lg font-semibold uppercase leading-[1.05] text-chalk stretch-125 sm:text-2xl">
                  Don&apos;t see your car?
                </h3>
                <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-silver">
                  We&apos;ll make it
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h15" />
                  </svg>
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

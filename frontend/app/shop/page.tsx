'use client';

import { useEffect, useState } from 'react';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';
import CompactProductCard from '@/components/CompactProductCard';

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProducts();
        setAllProducts(data);
        setFilteredProducts(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(p => p.category))).filter(Boolean);
        setCategories(uniqueCategories);
      } catch (err: any) {
        console.error('Failed to load shop products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, allProducts]);

  return (
    <div className="container mx-auto px-4 py-24 sm:px-6 max-w-7xl min-h-screen">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl uppercase">
            {t('shop')}
          </h1>
          <div className="h-2 w-24 bg-blue-600 rounded-full" />
          <p className="max-w-xl text-lg text-zinc-500 dark:text-zinc-400 font-medium">
             {t('exploreSelection')}
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">{t('categories')}</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
              }`}
            >
              {t('allCategories')}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all border ${
                  selectedCategory === category
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="rounded-[2.5rem] border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-red-800 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col animate-pulse">
                <div className="aspect-square w-full rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-4 space-y-2">
                   <div className="h-4 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                   <div className="h-3 w-1/2 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
                <p className="text-xl font-bold text-zinc-400 uppercase tracking-widest">{t('noArtworks')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {filteredProducts.map((product) => (
                  <CompactProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

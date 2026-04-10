'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
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
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-zinc-950 py-24 sm:py-32 flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        <div className="z-10 max-w-4xl max-auto space-y-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl/tight">
            {t('premiumWall')} <span className="text-blue-500">{t('wallCollection')}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            {t('heroDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all cursor-pointer"
            >
              {t('shopCollection')}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="products" className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t('featuredArtworks')}</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t('exploreSelection')}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-red-800 dark:text-red-400 font-medium">Failed to load products: {error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((placeholder) => (
              <div key={placeholder} className="flex flex-col animate-pulse">
                <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-4 flex flex-col gap-2 p-2">
                  <div className="h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-6 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
                  <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {products.length === 0 && !error ? (
              <div className="py-20 text-center">
                <p className="text-lg text-zinc-600 dark:text-zinc-400">{t('noArtworks')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">{error || 'Product not found'}</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium">
          &larr; {t('backToArtworks')}
        </Link>
      </div>
    );
  }

  const imageUrl = product.image || 'https://via.placeholder.com/800x600?text=No+Image';

  // Handle RTL alignment
  const alignIconClass = language === 'ar' ? 'ml-2 rotate-180' : 'mr-2';

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:py-24 max-w-7xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white mb-8 transition-colors">
        <svg className={`${alignIconClass} h-4 w-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {t('backToArtworks')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <div className="relative aspect-[4/3] md:aspect-square w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Unavailable';
            }}
          />
        </div>

        <div className="flex flex-col pt-4 md:pt-10">
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase dark:text-zinc-400 mb-3">
            {product.category}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight mb-4">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8">
            {product.price} MAD
          </p>
          
          <div className="prose prose-zinc dark:prose-invert prose-lg mb-10 text-zinc-600 dark:text-zinc-400">
            <p className="leading-relaxed">
              {product.description || 'Experience the essence of automotive engineering wrapped into a stunning visual presentation. Perfect for enthusiasts and modern spaces.'}
            </p>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={`cursor-pointer mt-auto w-full md:w-auto px-12 py-5 rounded-full text-lg font-bold shadow-lg transition-all transform hover:-translate-y-1 ${
              product.inStock
                ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 hover:shadow-xl'
                : 'cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 shadow-none hover:transform-none'
            }`}
          >
            {product.inStock ? t('addToCart') : t('unavailable')}
          </button>

          <p className="mt-6 text-sm text-green-600 dark:text-green-500 font-medium flex items-center">
            <svg className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {t('freeShipping')}
          </p>
        </div>
      </div>
    </div>
  );
}

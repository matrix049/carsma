'use client';

import React, { useEffect, useState } from 'react';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';
import CompactProductCard from '@/components/CompactProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProducts();
        setAllProducts(data);
        setFilteredProducts(data);
        
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
    let filtered = allProducts;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, inStockOnly, allProducts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <div className="container mx-auto px-6 py-32 sm:px-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Sidebar Filters */}
          <motion.aside 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-72 shrink-0 space-y-16"
          >
            <div className="space-y-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{t('categories')}</h3>
               <nav className="flex flex-col gap-5">
                 <button
                   onClick={() => setSelectedCategory('all')}
                   className={`flex items-center justify-between group py-2 transition-all ${selectedCategory === 'all' ? 'text-blue-600' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                 >
                   <span className="text-xs font-black uppercase tracking-widest">{t('allCategories')}</span>
                   <motion.div 
                    animate={{ scale: selectedCategory === 'all' ? 1 : 0 }}
                    className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" 
                   />
                 </button>
                 {categories.map((category) => (
                   <button
                     key={category}
                     onClick={() => setSelectedCategory(category)}
                     className={`flex items-center justify-between group py-2 transition-all ${selectedCategory === category ? 'text-blue-600' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                   >
                     <span className="text-xs font-black uppercase tracking-widest">{category}</span>
                     <motion.div 
                        animate={{ scale: selectedCategory === category ? 1 : 0 }}
                        className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" 
                     />
                   </button>
                 ))}
               </nav>
            </div>
            
            <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 space-y-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Inventory Status</h3>
               <nav className="flex flex-col gap-6">
                 <button 
                   onClick={() => setInStockOnly(!inStockOnly)}
                   className="flex items-center gap-4 cursor-pointer group w-full"
                 >
                    <div className={`h-6 w-6 rounded-xl border-2 transition-all flex items-center justify-center ${inStockOnly ? 'bg-blue-600 border-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'border-zinc-800 bg-zinc-900 group-hover:border-zinc-700'}`}>
                       {inStockOnly && (
                         <motion.svg 
                           initial={{ scale: 0 }} animate={{ scale: 1 }}
                           className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"
                         >
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                         </motion.svg>
                       )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${inStockOnly ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                      In Stock Only
                    </span>
                 </button>
                 
                 <div className="flex items-center gap-4 opacity-40 cursor-not-allowed group">
                    <div className="h-6 w-6 rounded-xl border-2 border-zinc-800 bg-zinc-900" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                      Limited Edition
                    </span>
                 </div>
               </nav>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-16">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Digital Gallery</span>
                <h1 className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 sm:text-8xl uppercase font-jakarta">
                  {t('shop')}
                </h1>
                <div className="h-2 w-32 bg-blue-600 rounded-full" />
              </div>
              <p className="max-w-2xl text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">
                 Synthesized automotive art, architected for the contemporary collector. Staged with precision.
              </p>
            </motion.div>

            {/* Mobile Filters */}
            <div className="lg:hidden space-y-6">
               <p className="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase">{t('categories')}</p>
               <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`shrink-0 rounded-2xl px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-3xl shadow-blue-500/30'
                        : 'bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800'
                    }`}
                  >
                    {t('allCategories')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 rounded-2xl px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border ${
                        selectedCategory === category
                          ? 'bg-blue-600 border-blue-500 text-white shadow-3xl shadow-blue-500/30'
                          : 'bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
               </div>
            </div>

            {/* Grid Content */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col space-y-8 animate-pulse">
                      <div className="aspect-[4/5] w-full rounded-[3rem] bg-zinc-100 dark:bg-zinc-900" />
                      <div className="space-y-4">
                         <div className="h-6 w-3/4 rounded-full bg-zinc-100 dark:bg-zinc-900" />
                         <div className="h-4 w-1/2 rounded-full bg-zinc-50 dark:bg-zinc-900/50" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key={selectedCategory}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 mb-32"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product._id} variants={itemVariants}>
                      <CompactProductCard product={product} />
                    </motion.div>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                    <motion.div 
                      variants={itemVariants}
                      className="col-span-full py-48 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[4rem]"
                    >
                      <p className="text-2xl font-black text-zinc-400 uppercase tracking-widest">{t('noArtworks')}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

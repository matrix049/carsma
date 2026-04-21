'use client';

import React, { useEffect, useState } from 'react';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useLanguage } from '@/contexts/LanguageContext';
import CompactProductCard from '@/components/CompactProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import WheelLoader from '@/components/WheelLoader';

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by stock
    if (inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, inStockOnly, searchQuery, allProducts]);

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
              
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by car name, brand, or model... ابحث عن السيارة"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-5 pl-14 text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-400"
                />
                <svg 
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Mobile Filters */}
            <div className="lg:hidden space-y-4">
               <p className="text-[9px] font-black tracking-[0.3em] text-zinc-400 uppercase">{t('categories')}</p>
               <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`shrink-0 rounded-xl px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/30'
                        : 'bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800'
                    }`}
                  >
                    {t('allCategories')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 rounded-xl px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border ${
                        selectedCategory === category
                          ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/30'
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
                  className="flex flex-col items-center justify-center py-32"
                >
                  <WheelLoader size="lg" />
                  <p className="mt-8 text-sm font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-600">
                    Loading Collection...
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key={selectedCategory}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-12 mb-32"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product._id} variants={itemVariants}>
                      <CompactProductCard product={product} />
                    </motion.div>
                  ))}

                  {/* Custom Design Card - always shown at end of grid */}
                  {!isLoading && (
                    <motion.div variants={itemVariants}>
                      <a
                        href="/customize"
                        className="group flex flex-col justify-between h-full min-h-[280px] sm:min-h-[360px] rounded-2xl sm:rounded-3xl border-2 border-dashed border-blue-600/40 bg-blue-600/5 hover:bg-blue-600/10 hover:border-blue-500 transition-all duration-500 p-5 sm:p-8 overflow-hidden relative"
                      >
                        {/* Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.08),transparent_70%)]" />

                        <div className="relative z-10 flex flex-col h-full gap-4">
                          {/* Icon */}
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>

                          {/* Text */}
                          <div className="flex-1">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Custom Order</p>
                            <h3 className="text-lg sm:text-2xl font-black tracking-tighter text-white uppercase leading-tight font-jakarta">
                              Don't see your car?
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-2 leading-relaxed">
                              مالقيتيش الطوموبيل لي كاتعجبك؟ صيفط لينا الماركا و الموضيل
                            </p>
                          </div>

                          {/* CTA */}
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 group-hover:text-blue-400 transition-colors">
                            <span>Request Custom Design</span>
                            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  )}
                  
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

      {/* Custom Design CTA Section */}
      <section className="container mx-auto px-6 py-20 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 1 }}
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
            <p className="text-lg text-blue-400 font-medium leading-relaxed max-w-xl border-t border-zinc-800 pt-6">
              مالقيتيش الطوموبيل لي كاتعجبك ، صيفط لينا الماركا و الموضيل لي بغيتي
            </p>
            <div className="pt-8">
              <a 
                href="/customize"
                className="inline-flex items-center gap-4 rounded-2xl bg-blue-600 px-12 py-6 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-blue-500 shadow-3xl shadow-blue-500/20 active:scale-[0.98]"
              >
                <span className="flex flex-col items-center gap-1">
                  <span className="flex items-center gap-2">
                    {t('contactUsNow')}
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                  <span className="text-xs opacity-80">طلب تصميم خاص</span>
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

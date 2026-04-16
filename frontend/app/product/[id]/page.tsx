'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  
  const sizes = [
    { id: 'S', label: '30x40cm', priceMod: 0 },
    { id: 'M', label: '50x70cm', priceMod: 150 },
    { id: 'L', label: '70x100cm', priceMod: 400 },
  ];

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
      <div className="flex min-h-screen items-center justify-center bg-black">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent shadow-[0_0_15px_rgba(37,99,235,0.5)]"
         />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-6 py-48 text-center bg-black min-h-screen">
        <h1 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter">{error || 'Product not found'}</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-500 font-black uppercase tracking-widest text-[10px]">
          &larr; {t('backToArtworks')}
        </Link>
      </div>
    );
  }

  const imageUrl = product.image || 'https://via.placeholder.com/800x600?text=No+Image';
  const alignIconClass = language === 'ar' ? 'ml-2 rotate-180' : 'mr-2';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <div className="container mx-auto px-6 py-32 lg:py-48 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-16"
        >
          <Link href="/shop" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-blue-600 transition-colors group">
            <svg className={`${alignIconClass} h-3.5 w-3.5 transition-transform group-hover:-translate-x-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t('backToArtworks')}
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32">
          {/* Kinetic Image Reveal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-[4rem] bg-zinc-900 border border-zinc-800 shadow-4xl group"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center grayscale-[0.2] transition-all duration-1000 group-hover:grayscale-0 brightness-[0.9] group-hover:brightness-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Unavailable';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-1000" />
            
            <div className="absolute bottom-12 left-12">
               <span className="flex items-center gap-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 text-[10px] font-black tracking-[0.4em] text-white uppercase shadow-3xl">
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,1)]" />
                  Limited Edition
               </span>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            <motion.div variants={itemVariants} className="space-y-8 mb-16">
              <span className="inline-block text-[10px] font-black tracking-[0.6em] text-blue-600 uppercase">
                {product.category}
              </span>
              <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter leading-[0.85] uppercase font-jakarta">
                {product.name}
              </h1>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-zinc-600 line-through tracking-widest decoration-blue-500/40">
                    {Math.ceil((product.price * 1.5) + (sizes.find(s => s.id === selectedSize)?.priceMod || 0))} <span className="text-[10px]">MAD</span>
                  </span>
                  <div className="rounded-full bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 text-[8px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
                    Collector's Discount
                  </div>
                </div>
                <p className="text-5xl sm:text-7xl font-black text-zinc-950 dark:text-white leading-none">
                  {product.price + (sizes.find(s => s.id === selectedSize)?.priceMod || 0)} <span className="text-sm">MAD</span>
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-8 mb-16">
              <div className="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Dimensions</h3>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest group cursor-pointer hover:underline underline-offset-8">Sizing Protocol &rarr;</span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`flex flex-col items-center gap-3 rounded-3xl border-2 py-6 transition-all duration-500 ${
                      selectedSize === size.id
                        ? 'border-blue-600 bg-blue-600/5 text-blue-600 shadow-[0_15px_40px_-10px_rgba(37,99,235,0.2)]'
                        : 'border-zinc-100 dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <span className="text-lg font-black uppercase tracking-tighter">{size.id}</span>
                    <span className="text-[9px] font-black opacity-50 uppercase tracking-widest">{size.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-16">
              <p className="text-xl text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium max-w-xl">
                {product.description || 'Syynthesized automotive fidelity architected for high-end curation. Every detail captured with museum-grade precision.'}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <button
                onClick={() => {
                  const selectedSizeData = sizes.find(s => s.id === selectedSize);
                  addToCart(
                    { ...product, price: product.price + (selectedSizeData?.priceMod || 0) },
                    selectedSize,
                    selectedSizeData?.label
                  );
                }}
                disabled={!product.inStock}
                className={`hidden md:flex items-center justify-center gap-4 w-full px-12 py-8 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-4xl transition-all active:scale-[0.98] ${
                  product.inStock
                    ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/40 shadow-blue-600/20'
                    : 'cursor-not-allowed bg-zinc-900 text-zinc-700'
                }`}
              >
                {product.inStock ? (
                  <>
                    <span>Add to Cart • زيد للسلة</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </>
                ) : t('unavailable')}
              </button>

              <button
                onClick={() => {
                  const selectedSizeData = sizes.find(s => s.id === selectedSize);
                  addToCart(
                    { ...product, price: product.price + (selectedSizeData?.priceMod || 0) },
                    selectedSize,
                    selectedSizeData?.label
                  );
                  router.push('/checkout');
                }}
                disabled={!product.inStock}
                className={`hidden md:flex items-center justify-center gap-4 w-full px-12 py-8 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-4xl transition-all active:scale-[0.98] ${
                  product.inStock
                    ? 'bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                    : 'cursor-not-allowed bg-zinc-900 text-zinc-700'
                }`}
              >
                {product.inStock ? (
                  <>
                    <span>Buy Now • شري دابا</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                ) : t('unavailable')}
              </button>

              {/* Secure Transaction Note */}
              <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                 <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 {t('codAvailability')}
              </div>
            </motion.div>

            {/* Mobile Fixed CTA */}
            <AnimatePresence>
              <motion.div 
                initial={{ y: 100 }} animate={{ y: 0 }}
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-3xl border-t border-zinc-900 p-4 pb-6"
              >
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Size: {selectedSize} ({sizes.find(s => s.id === selectedSize)?.label})</span>
                       <span className="text-xl font-black text-white">{product.price + (sizes.find(s => s.id === selectedSize)?.priceMod || 0)} MAD</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <button
                     onClick={() => {
                       const selectedSizeData = sizes.find(s => s.id === selectedSize);
                       addToCart(
                         { ...product, price: product.price + (selectedSizeData?.priceMod || 0) },
                         selectedSize,
                         selectedSizeData?.label
                       );
                     }}
                     disabled={!product.inStock}
                     className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                       product.inStock
                         ? 'bg-blue-600 text-white'
                         : 'bg-zinc-800 text-zinc-600'
                     }`}
                   >
                     {product.inStock ? (
                       <div className="flex flex-col items-center gap-0.5">
                         <span>ADD TO CART</span>
                         <span className="text-[8px] opacity-70">زيد للسلة</span>
                       </div>
                     ) : t('unavailable')}
                   </button>
                   <button
                     onClick={() => {
                       const selectedSizeData = sizes.find(s => s.id === selectedSize);
                       addToCart(
                         { ...product, price: product.price + (selectedSizeData?.priceMod || 0) },
                         selectedSize,
                         selectedSizeData?.label
                       );
                       router.push('/checkout');
                     }}
                     disabled={!product.inStock}
                     className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                       product.inStock
                         ? 'bg-white text-black'
                         : 'bg-zinc-800 text-zinc-600'
                     }`}
                   >
                     {product.inStock ? (
                       <div className="flex flex-col items-center gap-0.5">
                         <span>BUY NOW</span>
                         <span className="text-[8px] opacity-70">شري دابا</span>
                       </div>
                     ) : t('unavailable')}
                   </button>
                 </div>
              </motion.div>
            </AnimatePresence>

            {/* Curator's Insight */}
            <motion.div variants={itemVariants} className="mt-24 p-12 rounded-[4rem] bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Architectural Insight</span>
                 <p className="text-xl text-zinc-400 font-medium italic leading-relaxed">
                   "This piece is more than art; it's a structural tribute. The interplay of shadows against the matte black gradients evokes the sheer force of the machine. It defines the room."
                 </p>
                 <div className="flex items-center gap-5 pt-8">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-500 font-black text-xs">HA</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white">Hamza Alaoui</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lead Strategist</p>
                    </div>
                 </div>
               </div>
               <div className="absolute -bottom-10 -right-10 p-12 opacity-5 scale-150 transition-transform group-hover:scale-110 duration-1000">
                 <svg className="w-48 h-48 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14C19.017 11.2386 16.7784 9 14.017 9V7C17.883 7 21.017 10.134 21.017 14V21H14.017ZM3.017 21V18C3.017 16.8954 3.91243 16 5.017 16H8.017V14C8.017 11.2386 5.77843 9 3.017 9V7C6.883 7 10.017 10.134 10.017 14V21H3.017Z" /></svg>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

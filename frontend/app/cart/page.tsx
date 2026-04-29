'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { btnAccent } from '@/lib/uiStyles';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, calculateTotal } = useCart();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 sm:mb-20 space-y-3 sm:space-y-4"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-blue-600">Your Selection</span>
          <h1 className="font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.85] tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('shoppingCart')}
          </h1>
          <div className="h-1.5 sm:h-2 w-24 sm:w-32 bg-blue-600 rounded-full" />
        </motion.div>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[4rem] border-2 border-dashed border-zinc-100 bg-zinc-50 py-32 text-center dark:border-zinc-900 dark:bg-[#0d0d0d] shadow-2xl"
          >
            <div className="mb-10 flex justify-center">
              <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-8">
                <svg className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-8">{t('emptyCart')}</h2>
            <Link href="/shop" className={btnAccent}>
              {t('continueShopping')}
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16 items-start">
            {/* Cart Items */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1 }}
              className="lg:col-span-8 space-y-4 sm:space-y-8"
            >
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div 
                    key={`${item._id}-${item.selectedSize || 'default'}-${index}`} 
                    variants={itemVariants}
                    transition={{ duration: 0.6 }}
                    layout
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                    className="group relative flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] bg-zinc-50 dark:bg-[#0d0d0d] border border-zinc-100 dark:border-zinc-900 hover:border-blue-500/30 transition-all duration-500 shadow-xl"
                  >
                    <div className="h-28 w-full sm:h-40 sm:w-40 flex-shrink-0 overflow-hidden rounded-xl sm:rounded-[2rem] bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 group-hover:border-blue-500/40 transition-colors">
                      <img
                        src={item.image || 'https://via.placeholder.com/400x400?text=L7IT'}
                        alt={item.name}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    
                    <div className="flex flex-1 flex-col justify-between w-full">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="space-y-0.5 sm:space-y-1">
                          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600">
                            {item.category}
                            {item.selectedSize && ` • ${item.sizeLabel || item.selectedSize}`}
                          </p>
                          <h3 className="text-base sm:text-2xl font-display tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">{item.name}</h3>
                        </div>
                        <p className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white font-serif">
                          {(item.price * item.quantity).toFixed(0)} <span className="text-[8px] sm:text-[10px] text-zinc-500 uppercase">MAD</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 sm:mt-8">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-black rounded-xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-900 p-1 sm:p-1.5 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                          </button>
                          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group/remove"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Cart Summary */}
            <motion.aside 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 sticky top-32"
            >
              <div className="rounded-2xl sm:rounded-[3rem] border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-[#0d0d0d] p-6 sm:p-10 shadow-3xl overflow-hidden relative group">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-blue-600/5 blur-3xl" />
                
                <h2 className="font-display text-2xl sm:text-4xl text-zinc-900 dark:text-zinc-50 uppercase tracking-tight mb-6 sm:mb-10">{t('orderSummary')}</h2>
                
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{t('subtotal')}</span>
                    <span className="text-base sm:text-lg font-black font-serif text-zinc-900 dark:text-zinc-100">{calculateTotal().toFixed(0)} <span className="text-[7px] sm:text-[8px] uppercase">MAD</span></span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                     <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{t('shipping')}</span>
                     <span className="text-[9px] sm:text-[10px] font-black text-green-400 uppercase tracking-widest">FREE 🎁</span>
                  </div>
                  <div className="pt-4 sm:pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
                    <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">{t('total')}</span>
                    <div className="text-right">
                       <p className="text-3xl sm:text-4xl font-black text-blue-600 font-serif leading-none">{calculateTotal().toFixed(0)}</p>
                       <p className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1.5 sm:mt-2">MAD (Order Total)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <Link href="/checkout" className={`${btnAccent} w-full`}>
                    {t('proceedToCheckout')}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                  
                  <Link 
                    href="/shop" 
                    className="flex w-full items-center justify-center py-3 sm:py-4 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                  >
                    &larr; {t('continueShopping')}
                  </Link>
                </div>
                
                <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-blue-600/5 border border-blue-500/10">
                   <p className="text-[8px] sm:text-[9px] font-black uppercase leading-relaxed text-blue-500/80 tracking-widest text-center">
                     Gallery pieces are archived securely and dispatched within 48 hours. Secure Settlement via Cash on Delivery.
                   </p>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </div>
    </div>
  );
}

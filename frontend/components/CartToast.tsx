'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartToast() {
  const { toastMessage } = useCart();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-32 sm:bottom-12 right-6 sm:right-12 z-[100]"
        >
          <div className="flex items-center gap-5 rounded-[2rem] bg-black/90 px-8 py-5 shadow-4xl backdrop-blur-2xl border border-white/10">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_15px_rgba(37,99,235,1)]" />
              <div className="absolute inset-0 h-3 w-3 rounded-full bg-blue-600 animate-ping opacity-40" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {toastMessage}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

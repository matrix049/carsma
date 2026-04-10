'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';

export default function CartToast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300 sm:bottom-4 sm:right-4">
      <div className="flex items-center gap-3 rounded-2xl bg-black/90 px-6 py-4 shadow-xl backdrop-blur-md dark:bg-white/90 border border-zinc-800 dark:border-zinc-200">
        <svg className="h-6 w-6 text-green-400 dark:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium text-white dark:text-black">
          {toastMessage}
        </span>
      </div>
    </div>
  );
}

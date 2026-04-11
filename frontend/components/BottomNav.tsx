'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  const navItems = [
    {
      label: t('home'),
      href: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    },
    {
      label: t('shop'),
      href: '/shop',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      )
    },
    {
      label: t('shoppingCart'),
      href: '/cart',
      icon: (
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-sm">
              {itemCount}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 px-4 pb-safe pt-2 dark:bg-black/80 dark:border-zinc-800/50">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1.5 p-2 transition-all active:scale-90 ${active ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
            >
              {item.icon}
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

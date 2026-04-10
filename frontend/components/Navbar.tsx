'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Highlight active links
  const isActive = (path: string) => pathname === path ? 'text-blue-600 font-semibold dark:text-blue-400' : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white';

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-black/90">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" onClick={closeMenu} className="flex items-center space-x-2">
            <span className="inline-block font-bold text-2xl tracking-tighter">CARSMA</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center flex-1 justify-center">
          <Link href="/" className={`${isActive('/')} transition-colors text-sm font-medium`}>
            {t('home')}
          </Link>
          <Link href="/contact" className={`${isActive('/contact')} transition-colors text-sm font-medium`}>
            {t('contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-zinc-100 rounded-lg p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {(['en', 'fr', 'ar'] as const).map(l => (
              <button 
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === l ? 'bg-white shadow text-black dark:bg-zinc-800 dark:text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <Link href="/cart" onClick={closeMenu} className="relative p-2 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                {itemCount}
              </span>
            )}
            <span className="sr-only">{t('shoppingCart')}</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            type="button" 
            className="md:hidden p-2 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-zinc-200 dark:bg-black dark:border-zinc-800 shadow-lg px-4 py-6 flex flex-col gap-6">
          <Link href="/" onClick={closeMenu} className={`text-lg hover:text-blue-600 dark:hover:text-blue-400 font-medium ${pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {t('home')}
          </Link>
          <Link href="/contact" onClick={closeMenu} className={`text-lg hover:text-blue-600 dark:hover:text-blue-400 font-medium ${pathname === '/contact' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {t('contact')}
          </Link>
          
          <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {(['en', 'fr', 'ar'] as const).map(l => (
              <button 
                key={l}
                onClick={() => { setLanguage(l); closeMenu(); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors border ${language === l ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600' : 'border-transparent text-zinc-500 bg-zinc-50 dark:bg-zinc-900'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

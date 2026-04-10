'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (isLangOpen && !(event.target as HTMLElement).closest('.lang-dropdown')) {
        setIsLangOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangOpen]);

  // Highlight active links
  const isActive = (path: string) => pathname === path ? 'text-blue-600 font-semibold dark:text-blue-400' : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white';

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsLangOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b border-zinc-200/50 ${scrolled ? 'bg-white/80 backdrop-blur-xl py-0 shadow-sm dark:bg-black/80 dark:border-zinc-800/50' : 'bg-transparent py-2 border-transparent'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" onClick={closeMenu} className="inline-block font-black text-3xl tracking-tighter text-blue-600">
            L7it
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center flex-1 justify-center">
          <Link href="/" className={`${isActive('/')} transition-colors text-sm font-medium`}>
            {t('home')}
          </Link>
          <Link href="/shop" className={`${isActive('/shop')} transition-colors text-sm font-medium`}>
            {t('shop')}
          </Link>
          <Link href="/contact" className={`${isActive('/contact')} transition-colors text-sm font-medium`}>
            {t('contact')}
          </Link>
          {isAuthenticated && (
            <>
              <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
              <Link href="/admin/dashboard" className={`${isActive('/admin/dashboard')} transition-colors text-sm font-medium`}>
                Dashboard
              </Link>
              <Link href="/admin/custom-orders" className={`${isActive('/admin/custom-orders')} transition-colors text-sm font-medium`}>
                {t('adminCustomOrders')}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Desktop Language Dropdown */}
          <div className="relative lang-dropdown hidden sm:block">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/50 px-4 py-2 text-xs font-bold transition-all hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800"
            >
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              {language.toUpperCase()}
              <svg className={`w-3 h-3 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-3 w-32 origin-top-right overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200 dark:border-zinc-800 dark:bg-zinc-950/90">
                {(['en', 'fr', 'ar'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l); setIsLangOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${language === l ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}
                  >
                    {l === 'en' && 'English'}
                    {l === 'fr' && 'Français'}
                    {l === 'ar' && 'Darija / العربية'}
                    {language === l && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
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
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-b border-zinc-200 dark:border-zinc-800 px-4 py-8 flex flex-col gap-8 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            <Link href="/" onClick={closeMenu} className={`text-2xl font-black transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-zinc-900 dark:text-white'}`}>
              {t('home')}
            </Link>
            <Link href="/shop" onClick={closeMenu} className={`text-2xl font-black transition-colors ${pathname === '/shop' ? 'text-blue-600' : 'text-zinc-900 dark:text-white'}`}>
              {t('shop')}
            </Link>
            <Link href="/contact" onClick={closeMenu} className={`text-2xl font-black transition-colors ${pathname === '/contact' ? 'text-blue-600' : 'text-zinc-900 dark:text-white'}`}>
              {t('contact')}
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/admin/dashboard" onClick={closeMenu} className={`text-2xl font-black transition-colors ${pathname === '/admin/dashboard' ? 'text-blue-600' : 'text-zinc-900 dark:text-white'}`}>
                  {t('adminDashboard')}
                </Link>
                <Link href="/admin/custom-orders" onClick={closeMenu} className={`text-2xl font-black transition-colors ${pathname === '/admin/custom-orders' ? 'text-blue-600' : 'text-zinc-900 dark:text-white'}`}>
                  {t('adminCustomOrders')}
                </Link>
              </>
            )}
          </div>
          
          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 space-y-5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">{t('selectLanguage')}</p>
            <div className="grid grid-cols-1 gap-2">
              {(['en', 'fr', 'ar'] as const).map(l => (
                <button 
                  key={l}
                  onClick={() => { setLanguage(l); closeMenu(); }}
                  className={`flex items-center justify-between py-4 px-6 text-sm font-bold rounded-2xl transition-all border ${language === l ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'border-zinc-100 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'}`}
                >
                  {l === 'en' && 'English'}
                  {l === 'fr' && 'Français'}
                  {l === 'ar' && 'Darija / العربية'}
                  {language === l && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

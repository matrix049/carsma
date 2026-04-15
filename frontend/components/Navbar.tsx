'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Highlight active links with a subtle dot or glow
  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsLangOpen(false);
  };

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('shop'), path: '/shop' },
    { name: t('contact'), path: '/contact' },
    { name: t('customizationRequest'), path: '/customize' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-2xl py-2 border-b border-zinc-900 shadow-2xl' : 'bg-transparent py-6 border-b border-transparent'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/" onClick={closeMenu} className="inline-block font-black text-4xl tracking-tighter text-white font-jakarta group">
            L7IT<span className="text-blue-600 transition-all group-hover:drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">.</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 items-center">
          {navLinks.map((link, idx) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                href={link.path} 
                className={`relative px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-white ${isActive(link.path) ? 'text-white' : 'text-zinc-500'}`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="nav-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,1)]"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <div className="relative lang-dropdown hidden lg:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/50 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:text-white hover:border-zinc-700 hover:bg-zinc-800"
            >
              {language}
              <svg className={`w-3 h-3 transition-transform duration-500 ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </motion.button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-4 w-48 origin-top-right overflow-hidden rounded-[2rem] border border-zinc-800 bg-black p-2 shadow-3xl backdrop-blur-2xl"
                >
                  {(['en', 'fr', 'ar'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => { setLanguage(l); setIsLangOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${language === l ? 'bg-blue-600/10 text-blue-500' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}
                    >
                      {l === 'en' ? 'English' : l === 'fr' ? 'Français' : 'العربية'}
                      {language === l && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,1)]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative p-2 text-zinc-500 hover:text-white transition-all hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-[8px] font-black leading-none text-white bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            <button 
              className="md:hidden p-2 text-zinc-400 hover:text-white" 
              onClick={toggleMenu}
            >
              <div className="space-y-1.5">
                <motion.div animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="h-0.5 w-6 bg-current origin-center" />
                <motion.div animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="h-0.5 w-6 bg-current" />
                <motion.div animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="h-0.5 w-6 bg-current origin-center" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-3xl md:hidden flex flex-col items-center justify-center p-12"
          >
            <div className="flex flex-col gap-12 text-center w-full">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={link.path} onClick={closeMenu} className={`text-5xl font-black tracking-tighter font-jakarta uppercase transition-all ${isActive(link.path) ? 'text-blue-600' : 'text-white'}`}>
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-24 pt-12 border-t border-zinc-900 w-full"
            >
              <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6">{t('selectLanguage')}</p>
              <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
                {(['en', 'fr', 'ar'] as const).map(l => (
                  <button 
                    key={l}
                    onClick={() => { setLanguage(l); closeMenu(); }}
                    className={`flex items-center justify-between py-4 px-6 text-sm font-bold rounded-2xl transition-all border ${language === l ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

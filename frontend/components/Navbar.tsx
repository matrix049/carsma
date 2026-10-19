'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      const scrollY = document.body.dataset.scrollY;
      document.body.style.overflow = '';
      document.body.style.height = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
        delete document.body.dataset.scrollY;
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      delete document.body.dataset.scrollY;
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => pathname === path;
  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { name: t('home'), ar: 'الرئيسية', path: '/' },
    { name: t('shop'), ar: 'الݣالوري', path: '/shop' },
    { name: t('customizationRequest'), ar: 'طلب خاص', path: '/customize' },
    { name: 'FAQ', ar: 'أسئلة', path: '/faq' },
    { name: t('contact'), ar: 'تواصل معانا', path: '/contact' },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] w-full">
      {/* Service bar — collapses once the visitor starts scrolling */}
      <div
        className={`relative z-10 overflow-hidden bg-ink text-ivory transition-[max-height] duration-500 ${
          scrolled ? 'max-h-0' : 'max-h-10'
        }`}
      >
        <p className="flex h-8 items-center justify-center gap-3 px-4 text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px]">
          <span>Cash on delivery</span>
          <span className="text-brass-light">·</span>
          <span className="hidden sm:inline">Delivery 24h – 3 days, all Morocco</span>
          <span className="font-ar text-[12px] normal-case tracking-normal sm:hidden">التوصيل لكاع المغرب</span>
        </p>
      </div>

      <div
        className={`relative z-10 border-b transition-all duration-500 ${
          scrolled
            ? 'border-line bg-ivory/90 shadow-[0_8px_30px_-20px_rgba(22,19,15,0.35)] backdrop-blur-xl'
            : 'border-transparent bg-ivory/70 backdrop-blur-md'
        }`}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 lg:px-10">
          <Link href="/" onClick={closeMenu} className="group flex items-baseline gap-2.5 text-ink">
            <span className="font-display text-[1.9rem] font-semibold leading-none tracking-[0.06em] md:text-[2.2rem]">
              L7IT
            </span>
            <span className="font-ar text-sm text-brass transition-opacity group-hover:opacity-70">الحيط</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative py-2 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-ink ${
                  isActive(link.path) ? 'text-ink' : 'text-stone'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.span
                    layoutId="nav-active-bar"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-brass"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-brass"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l-1 13H7L6 7z" />
                <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
              </svg>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-0.5 top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brass px-1 text-[10px] font-semibold leading-none text-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            <button
              className="flex h-11 w-11 items-center justify-center text-ink lg:hidden"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="space-y-1.5">
                <motion.div animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="h-px w-6 origin-center bg-current" />
                <motion.div animate={isMobileMenuOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }} className="h-px w-6 origin-center bg-current" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 flex flex-col bg-ivory px-6 pb-10 pt-32 lg:hidden"
          >
            <nav className="flex flex-col divide-y divide-line border-y border-line">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.05 }}
                >
                  <Link
                    href={link.path}
                    onClick={closeMenu}
                    className="flex items-baseline justify-between py-5"
                  >
                    <span className={`font-display text-4xl font-medium ${isActive(link.path) ? 'text-brass' : 'text-ink'}`}>
                      {link.name}
                    </span>
                    <span className="font-ar text-base text-stone">{link.ar}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto space-y-1 text-center text-xs text-stone">
              <p className="uppercase tracking-[0.18em]">Cash on delivery · 24h – 3 days</p>
              <p className="font-ar text-sm">الخلاص عند الاستلام · التوصيل لكاع المغرب</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

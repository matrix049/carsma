'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollProgress from '@/components/ScrollProgress';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { whatsappLink } from '@/lib/uiStyles';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the menu on any route change (cart icon, back button, …). Drop the
  // saved offset first so the new page isn't scrolled to the old position.
  useEffect(() => {
    delete document.body.dataset.scrollY;
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const isActive = (path: string) => (path === '/' ? pathname === '/' : !!pathname?.startsWith(path));
  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { name: t('home'), ar: 'الرئيسية', path: '/' },
    { name: t('shop'), ar: 'الكاراج', path: '/shop' },
    { name: 'Custom build', ar: 'طلب خاص', path: '/customize' },
    { name: 'FAQ', ar: 'أسئلة', path: '/faq' },
    { name: t('contact'), ar: 'تواصل', path: '/contact' },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] w-full">
      <div
        className={`relative z-10 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled || isMobileMenuOpen
            ? 'border-b border-white/[0.08] bg-asphalt/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-asphalt/80 to-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 md:h-[72px] lg:px-10">
          <Link href="/" onClick={closeMenu} aria-label="L7IT — home" className="group flex items-baseline gap-2.5">
            <span className="text-metal font-display text-[26px] font-semibold uppercase leading-none tracking-[0.04em] stretch-150 md:text-[28px]">
              L7IT
            </span>
            <span className="font-ar text-sm font-medium text-smoke transition-colors group-hover:text-silver">الحيط</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navLinks.slice(1).map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-4 py-2 text-[13px] font-medium tracking-[0.02em] transition-colors hover:text-chalk ${
                    active ? 'text-chalk' : 'text-smoke'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-silver to-transparent"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/cart"
              aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-chalk transition-colors hover:bg-white/[0.06]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 7h12l-1 13H7L6 7z" />
                <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
              </svg>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute right-0.5 top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-chalk px-1 font-mono text-[10px] font-bold leading-none text-asphalt"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            <button
              className="flex h-11 w-11 items-center justify-center rounded-full text-chalk transition-colors hover:bg-white/[0.06] lg:hidden"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="space-y-1.5">
                <motion.div animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="h-[1.5px] w-6 origin-center bg-current" />
                <motion.div animate={isMobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} className="h-[1.5px] w-6 origin-center bg-current" />
              </div>
            </button>
          </div>
        </div>
        <ScrollProgress />
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 flex flex-col overflow-y-auto overscroll-contain bg-asphalt px-5 pb-10 pt-24 lg:hidden"
          >
            <nav className="flex shrink-0 flex-col" aria-label="Mobile">
              {navLinks.map((link, idx) => {
                const active = isActive(link.path);
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-white/[0.08]"
                  >
                    <Link href={link.path} onClick={closeMenu} className="flex items-center gap-4 py-5">
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-xenon shadow-[0_0_8px_#8FCBFF]' : 'bg-white/15'}`}
                      />
                      <span className={`flex-1 font-display text-[1.7rem] font-semibold uppercase leading-none stretch-125 ${active ? 'text-chalk' : 'text-silver'}`}>
                        {link.name}
                      </span>
                      <span className="font-ar text-base text-smoke">{link.ar}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <div className="mt-auto shrink-0 space-y-3 pt-10">
              <a
                href={whatsappLink('Salam L7it!')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-full bg-white/[0.05] py-4 text-sm font-semibold text-chalk ring-1 ring-inset ring-white/15"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp <span className="font-ar text-base font-normal text-smoke">· كلمنا</span>
              </a>
              <p className="text-center text-xs text-smoke">Cash on delivery · 48h – 3 days</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

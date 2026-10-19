'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import ShiftLights from '@/components/ShiftLights';
import { setSoundOn, useSoundOn } from '@/lib/engineAudio';
import { whatsappLink } from '@/lib/uiStyles';

const TICKER = [
  'Cash on delivery',
  'الخلاص عند الاستلام',
  'Delivery 24h – 3 days · all Morocco',
  'التوصيل لكاع المغرب',
  'Made in Rabat',
  'Ready to hang',
];

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="flex w-max animate-marquee [--marquee-duration:38s]">
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-5 pr-5 font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
              <span className={/[؀-ۿ]/.test(item) ? 'font-ar text-[12px] normal-case tracking-normal' : ''}>{item}</span>
              <span className="text-white/60">✦</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

function SoundToggle() {
  const on = useSoundOn();
  return (
    <button
      type="button"
      onClick={() => setSoundOn(!on)}
      aria-pressed={on}
      aria-label={on ? 'Engine sound on — turn off' : 'Engine sound off — turn on'}
      title={on ? 'Engine sound: on' : 'Engine sound: off'}
      className="flex h-11 items-center gap-2 px-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-smoke transition-colors hover:text-chalk"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 10v4h4l5 4V6L8 10H4z" />
        {on ? (
          <>
            <path d="M16.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 6a8.5 8.5 0 0 1 0 12" />
          </>
        ) : (
          <path d="M17 9l5 6M22 9l-5 6" />
        )}
      </svg>
      <span className="hidden xl:inline">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}

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

  // Links are numbered like gears.
  const navLinks = [
    { gear: '1', name: t('home'), ar: 'الرئيسية', path: '/' },
    { gear: '2', name: t('shop'), ar: 'الكاراج', path: '/shop' },
    { gear: '3', name: 'Custom build', ar: 'طلب خاص', path: '/customize' },
    { gear: '4', name: 'FAQ', ar: 'أسئلة', path: '/faq' },
    { gear: '5', name: t('contact'), ar: 'تواصل', path: '/contact' },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] w-full">
      {/* Ticker — collapses once the visitor starts scrolling */}
      <div
        className={`relative z-10 overflow-hidden bg-redline text-white transition-[max-height] duration-500 ${
          scrolled ? 'max-h-0' : 'max-h-8'
        }`}
      >
        <div className="flex h-7 items-center">
          <Ticker />
        </div>
      </div>

      <div
        className={`relative z-10 border-b transition-colors duration-500 ${
          scrolled ? 'border-white/10 bg-asphalt/85 backdrop-blur-xl' : 'border-transparent bg-asphalt/50 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 md:h-[72px] lg:px-10">
          <Link href="/" onClick={closeMenu} aria-label="L7IT — home" className="group flex items-end gap-2">
            <span className="font-display text-[28px] font-black uppercase leading-none tracking-[-0.02em] text-chalk stretch-150 [transform:skewX(-8deg)] md:text-[32px]">
              L7IT
              <span className="text-redline transition-colors group-hover:text-redline-hot">/</span>
            </span>
            <span className="mb-0.5 font-ar text-sm font-semibold text-redline-hot">الحيط</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-chalk ${
                    active ? 'text-chalk' : 'text-smoke'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-sm text-[10px] ${active ? 'bg-redline text-white' : 'bg-white/[0.06] text-smoke'}`}>
                    {link.gear}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <SoundToggle />
            <Link
              href="/cart"
              aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              className="relative flex h-11 w-11 items-center justify-center text-chalk transition-colors hover:text-redline-hot"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 7h12l-1 13H7L6 7z" />
                <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
              </svg>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute right-0 top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-redline px-1 font-mono text-[10px] font-bold leading-none text-white shadow-[0_0_12px_rgba(229,32,12,0.7)]"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            <button
              className="flex h-11 w-11 items-center justify-center text-chalk lg:hidden"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="space-y-1.5">
                <motion.div animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="h-[2px] w-6 origin-center bg-current" />
                <motion.div animate={isMobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} className="h-[2px] w-6 origin-center bg-current" />
              </div>
            </button>
          </div>
        </div>
        <ShiftLights />
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="speed-lines fixed inset-0 z-0 flex flex-col overflow-y-auto overscroll-contain bg-asphalt px-5 pb-10 pt-28 lg:hidden"
          >
            <nav className="flex shrink-0 flex-col" aria-label="Mobile">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-white/10"
                >
                  <Link href={link.path} onClick={closeMenu} className="flex items-center gap-4 py-4">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm font-mono text-sm font-bold ${isActive(link.path) ? 'bg-redline text-white' : 'bg-white/[0.06] text-smoke'}`}>
                      {link.gear}
                    </span>
                    <span className="flex-1 font-display text-[2.1rem] font-black uppercase leading-none text-chalk stretch-125">
                      {link.name}
                    </span>
                    <span className="font-ar text-base text-smoke">{link.ar}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto shrink-0 space-y-3 pt-10">
              <a
                href={whatsappLink('Salam L7it!')}
                target="_blank"
                rel="noopener noreferrer"
                className="chamfer flex items-center justify-center gap-2 bg-[#1FAF55] py-4 font-display text-sm font-black uppercase tracking-[0.12em] text-white stretch-125"
              >
                WhatsApp us <span className="font-ar text-base normal-case tracking-normal">· كلمنا</span>
              </a>
              <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-smoke">
                Cash on delivery · 24h – 3 days
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white pt-24 pb-32 md:pb-12 border-t border-zinc-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="inline-block font-display text-5xl leading-none tracking-tight text-blue-600">
              L7IT
            </Link>
            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
              Premium automotive wall art for the modern enthusiast. Exclusive designs, gallery-grade quality, and worldwide shipping from Morocco.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">{t('home')}</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">{t('featuredArtworks')}</Link></li>
              <li><Link href="/shop" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">{t('shop')}</Link></li>
              <li><Link href="/customize" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">{t('customizationRequest')}</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">{t('supportLabel')}</h3>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">{t('contact')}</Link></li>
              <li><span className="text-zinc-400 text-xs font-medium uppercase tracking-widest">{t('shippingToMoroccoOnly')}</span></li>
              <li className="text-zinc-500 text-[10px] font-medium flex items-center gap-3">
                <svg className="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 0 0 0-2-2H5a2 0 0 0-2 2v10a2 0 0 0 2 2z" /></svg>
                support@l7it.com
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            © {year} L7it STUDIO. {language === 'en' ? 'All rights reserved.' : language === 'fr' ? 'Tous droits réservés.' : 'جميع الحقوق محفوظة.'}
          </p>
          <div className="flex gap-8">
             <span className="text-zinc-600 text-[10px] font-black tracking-tighter uppercase">Rabat</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

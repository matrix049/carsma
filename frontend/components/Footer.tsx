'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white pt-24 pb-12 border-t border-zinc-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="inline-block font-black text-3xl tracking-tighter text-blue-600">
              L7it
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              Premium automotive wall art for the modern enthusiast. Exclusive designs, gallery-grade quality, and worldwide shipping.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500">{t('home')}</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{t('featuredArtworks')}</Link></li>
              <li><Link href="/customize" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{t('customizationRequest')}</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500">{t('supportLabel')}</h3>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{t('contact')}</Link></li>
              <li><span className="text-zinc-400 text-sm font-medium">{t('shippingToMoroccoOnly')}</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500">{t('connect')}</h3>
            <ul className="space-y-4">
              <li className="text-zinc-400 text-sm font-medium flex items-center gap-3">
                <svg className="w-5 h-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 0/0 2 2z" /></svg>
                support@l7it.com
              </li>
              <li className="text-zinc-400 text-sm font-medium flex items-center gap-3">
                <svg className="w-5 h-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +212 777 780 778
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">
            © {year} L7it STUDIO. {language === 'en' ? 'All rights reserved.' : language === 'fr' ? 'Tous droits réservés.' : 'جميع الحقوق محفوظة.'}
          </p>
          <div className="flex gap-8">
             <span className="text-zinc-600 text-[10px] font-black tracking-tighter uppercase">Rabat / Casablanca / Morocco</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

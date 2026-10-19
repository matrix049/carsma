'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHATSAPP_NUMBER } from '@/lib/uiStyles';

export default function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  const linkClass = 'text-sm text-ivory/60 transition-colors hover:text-ivory';

  return (
    <footer className="bg-ink pb-32 pt-20 text-ivory md:pb-12">
      <div className="container mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid grid-cols-1 gap-12 border-b border-ivory/10 pb-16 md:grid-cols-12">
          {/* Brand */}
          <div className="space-y-5 md:col-span-5">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="font-display text-5xl font-semibold tracking-[0.06em]">L7IT</span>
              <span className="font-ar text-lg text-brass-light">الحيط</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-ivory/60">
              Automotive wall art, drawn and finished in Rabat. Printed on 3 mm Alucobond, ready to hang.
            </p>
            <p className="w-fit max-w-sm font-ar text-base leading-relaxed text-ivory/50" dir="rtl">
              لوحات ديال الطوموبيلات، مصنوعة فالرباط وجاهزة تعلقها فالحيط.
            </p>
          </div>

          <div className="space-y-5 md:col-span-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brass-light">{t('shop')}</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className={linkClass}>{t('featuredArtworks')}</Link></li>
              <li><Link href="/customize" className={linkClass}>{t('customizationRequest')}</Link></li>
              <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-5 md:col-span-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brass-light">{t('supportLabel')}</h3>
            <ul className="space-y-3">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp · +212 765 810 304
                </a>
              </li>
              <li><Link href="/contact" className={linkClass}>{t('contact')}</Link></li>
              <li><a href="mailto:support@l7it.com" className={linkClass}>support@l7it.com</a></li>
              <li className="text-sm text-ivory/60">Cash on delivery · 24h – 3 days</li>
              <li className="text-sm text-ivory/60">{t('shippingToMoroccoOnly')}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[11px] uppercase tracking-[0.2em] text-ivory/40 md:flex-row">
          <p>
            © {year} L7it Studio. {language === 'en' ? 'All rights reserved.' : language === 'fr' ? 'Tous droits réservés.' : 'جميع الحقوق محفوظة.'}
          </p>
          <p>Made in Rabat, Morocco</p>
        </div>
      </div>
    </footer>
  );
}

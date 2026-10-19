'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHATSAPP_NUMBER } from '@/lib/uiStyles';
import Plate from '@/components/Plate';

export default function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  const linkClass = 'text-sm text-smoke transition-colors hover:text-chalk';
  const headClass = 'font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-silver-dark';

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-asphalt pb-32 pt-16 text-chalk md:pb-10 md:pt-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
          <div className="col-span-2 space-y-5 md:col-span-5">
            <Plate size="md" left="L7IT" letter="ح" right="1" aria-label="L7IT" />
            <div className="space-y-1 text-sm text-smoke">
              <p>Automotive wall art, made in Rabat.</p>
              <p className="w-fit font-ar" dir="rtl">علّق الحلم ديالك.</p>
            </div>
          </div>

          <div className="space-y-4 md:col-span-3">
            <p className={headClass}>{t('shop')}</p>
            <ul className="space-y-3">
              <li><Link href="/shop" className={linkClass}>All cars</Link></li>
              <li><Link href="/customize" className={linkClass}>Custom build</Link></li>
              <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-4 md:col-span-4">
            <p className={headClass}>{t('supportLabel')}</p>
            <ul className="space-y-3">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp
                </a>
              </li>
              <li><Link href="/contact" className={linkClass}>{t('contact')}</Link></li>
              <li><a href="mailto:support@l7it.com" className={linkClass}>support@l7it.com</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <p
        aria-hidden="true"
        className="pointer-events-none mt-14 select-none whitespace-nowrap text-center font-display text-[26vw] font-semibold uppercase leading-[0.78] text-transparent stretch-150 [-webkit-text-stroke:1px_rgba(242,243,245,0.08)] md:text-[22vw]"
      >
        L7IT
      </p>

      <div className="mx-auto mt-8 flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 text-xs text-smoke sm:px-6 md:flex-row lg:px-10">
        <p>
          © {year} L7it Studio. {language === 'en' ? 'All rights reserved.' : language === 'fr' ? 'Tous droits réservés.' : 'جميع الحقوق محفوظة.'}
        </p>
        <p>Cash on delivery · {t('shippingToMoroccoOnly')}</p>
      </div>
    </footer>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHATSAPP_NUMBER } from '@/lib/uiStyles';
import Plate from '@/components/Plate';

/** "Your lap" — time on site, ticking like a timing screen while visible. */
function LapTimer() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const fmt = (ms: number) => {
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const t = Math.floor(ms % 1000);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(t).padStart(3, '0')}`;
    };
    const tick = () => {
      el.textContent = fmt(performance.now());
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf) raf = requestAnimationFrame(tick);
      if (!entry.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-1.5 animate-pulse-led rounded-full bg-timing-purple" />
      Your lap <span ref={ref} className="tabular-nums text-timing-purple">00:00.000</span>
    </span>
  );
}

export default function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  const linkClass = 'text-sm text-smoke transition-colors hover:text-chalk';
  const headClass = 'font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-redline-hot';

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-asphalt pb-32 pt-20 text-chalk md:pb-10">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="space-y-5 md:col-span-5">
            <p className={headClass}>Pit wall</p>
            <p className="max-w-sm font-display text-2xl font-extrabold uppercase leading-tight stretch-125">
              Wall art for people who dream in horsepower.
            </p>
            <p className="w-fit max-w-sm font-ar text-base leading-relaxed text-smoke" dir="rtl">
              لوحات الطوموبيلات، مصنوعة فالرباط — علّق الحلم ديالك.
            </p>
            <Plate left="L7IT" letter="ح" right="1" aria-label="Made in Rabat plate" />
          </div>

          <div className="space-y-5 md:col-span-3">
            <p className={headClass}>{t('shop')}</p>
            <ul className="space-y-3">
              <li><Link href="/shop" className={linkClass}>All cars</Link></li>
              <li><Link href="/customize" className={linkClass}>Custom build · طلب خاص</Link></li>
              <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-5 md:col-span-4">
            <p className={headClass}>{t('supportLabel')}</p>
            <ul className="space-y-3">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp · +212 765 810 304
                </a>
              </li>
              <li><Link href="/contact" className={linkClass}>{t('contact')}</Link></li>
              <li><a href="mailto:support@l7it.com" className={linkClass}>support@l7it.com</a></li>
              <li className="text-sm text-smoke">Cash on delivery · 24h – 3 days</li>
              <li className="text-sm text-smoke">{t('shippingToMoroccoOnly')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <p
        aria-hidden="true"
        className="pointer-events-none mt-16 select-none whitespace-nowrap text-center font-display text-[27vw] font-black uppercase leading-[0.78] text-transparent stretch-150 [-webkit-text-stroke:1px_rgba(244,244,240,0.14)] md:text-[24vw]"
      >
        L7IT
      </p>

      <div className="mx-auto mt-8 flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-smoke sm:px-6 md:flex-row lg:px-10">
        <p>
          © {year} L7it Studio. {language === 'en' ? 'All rights reserved.' : language === 'fr' ? 'Tous droits réservés.' : 'جميع الحقوق محفوظة.'}
        </p>
        <LapTimer />
        <p>Made in Rabat, Morocco</p>
      </div>
    </footer>
  );
}

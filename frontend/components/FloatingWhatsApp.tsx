'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Plate from '@/components/Plate';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { whatsappLink } from '@/lib/uiStyles';

interface Shortcut {
  label: string;
  ar: string;
  message: () => string;
}

/**
 * WhatsApp concierge, shaped like a key fob: a graphite pebble with a xenon
 * status LED that sends a keyless-entry "ping" every few seconds. Tapping it
 * opens a small panel of ready-made messages (on a product page the first
 * one carries the product link), each opening WhatsApp pre-filled.
 */
export default function FloatingWhatsApp() {
  const pathname = usePathname();
  // Remember which page the panel was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn !== null && openOn === pathname;
  const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fobRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const onProduct = !!pathname?.startsWith('/product/');
  const onCart = pathname === '/cart';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOn(null);
        fobRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenOn(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const shortcuts: Shortcut[] = [
    onProduct
      ? {
          label: 'Ask about this piece',
          ar: 'سؤال على هاد اللوحة',
          message: () => `Salam L7it, 3ndi su2al 3la had la piece:\n${window.location.href}`,
        }
      : {
          label: 'Help me choose',
          ar: 'عاوني نختار',
          message: () => 'Salam L7it, bghit t3awnoni nkhtar lawha.',
        },
    {
      label: 'A custom car',
      ar: 'طوموبيل ديالي',
      message: () => 'Salam L7it, bghit lawha custom dyal tomobil dyali.',
    },
    {
      label: 'My order',
      ar: 'الكوموند ديالي',
      message: () => 'Salam L7it, bghit n3ref fin wslat la commande dyali.',
    },
  ];

  // The contact page has the chat assistant and its own WhatsApp card; the
  // fob would only cover the chat's send button.
  if (pathname === '/contact') return null;

  // Product and cart pages have a sticky buy bar on small screens — sit above it.
  const lift = onProduct ? 'bottom-24 md:bottom-6' : onCart ? 'bottom-24 lg:bottom-6' : 'bottom-5 md:bottom-6';

  return (
    <div
      ref={rootRef}
      className={`fixed right-4 z-50 flex flex-col items-end gap-3 md:right-6 ${lift}`}
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="WhatsApp concierge"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(20rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-3xl bg-carbon/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-chalk stretch-125">Concierge</p>
                <p className="mt-0.5 text-xs text-smoke">
                  WhatsApp <span className="font-ar">· كلمنا</span>
                </p>
              </div>
              <Plate size="sm" left="L7IT" letter="ح" right="1" />
            </div>
            <ul className="p-2">
              {shortcuts.map((s, i) => (
                <li key={s.label}>
                  <a
                    href={whatsappLink(s.message())}
                    onClick={() => setOpen(false)}
                    autoFocus={i === 0}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-[52px] items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-chalk">{s.label}</span>
                      <span className="block font-ar text-xs text-smoke">{s.ar}</span>
                    </span>
                    <svg className="h-4 w-4 text-smoke transition-transform group-hover:translate-x-0.5 group-hover:text-chalk" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={fobRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? 'Close WhatsApp concierge' : 'Chat with us on WhatsApp'}
        className="group relative flex items-center focus-visible:outline-none"
      >
        {/* Label that slides out on hover (desktop) */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-carbon/90 px-4 py-2 text-xs font-medium text-chalk ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 md:block ${
            open ? 'translate-x-2 opacity-0' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
          }`}
        >
          Need help? <span className="font-ar text-smoke">· كلمنا</span>
        </span>

        {/* Keyless "ping" rings */}
        {!open && (
          <>
            <span aria-hidden="true" className="fob-signal absolute inset-0 rounded-[22px] ring-1 ring-xenon/50" />
            <span aria-hidden="true" className="fob-signal absolute inset-0 rounded-[22px] ring-1 ring-xenon/30 [animation-delay:0.35s]" />
          </>
        )}

        {/* The fob */}
        <span className="relative flex h-[60px] w-[52px] flex-col items-center justify-center rounded-[22px] bg-[linear-gradient(160deg,#2A2C31_0%,#141518_55%,#0C0D0F_100%)] text-silver-light shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.6),0_14px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.12] transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-active:translate-y-0 group-focus-visible:ring-2 group-focus-visible:ring-xenon">
          {/* status LED */}
          <span aria-hidden="true" className="absolute top-2 h-1 w-1 rounded-full bg-xenon shadow-[0_0_6px_#8FCBFF]" />
          {open ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <WhatsAppIcon className="mt-1 h-6 w-6" />
          )}
        </span>
      </button>
    </div>
  );
}

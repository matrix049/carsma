'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { kickerLabel, whatsappLink } from '@/lib/uiStyles';
import dynamic from 'next/dynamic';
import WhatsAppIcon from '@/components/WhatsAppIcon';

const CHAT_INPUT_ID = 'chat-input';

// Client-only: the chat restores the conversation saved in this browser tab.
const ChatBot = dynamic(() => import('@/components/ChatBot'), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-[min(680px,78vh)] min-h-[460px] rounded-3xl bg-carbon ring-1 ring-white/[0.08]" />,
});

const Chevron = () => (
  <svg className="h-4 w-4 text-smoke transition-transform group-hover:translate-x-1 group-hover:text-chalk" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
  </svg>
);

const card = 'group flex items-center gap-5 rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] transition-colors hover:ring-white/25';

export default function ContactPage() {
  const { t } = useLanguage();

  const focusChat = () => {
    const input = document.getElementById(CHAT_INPUT_ID);
    const target = input ?? document.getElementById('chat');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };

  return (
    <div className="min-h-screen bg-asphalt pb-32 pt-28 text-chalk md:pt-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 md:mb-14">
          <p className={kickerLabel}>
            Talk to us <span className="font-ar normal-case tracking-normal">· تواصل معنا</span>
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold uppercase leading-[0.95] stretch-125">
            {t('contact')}
          </h1>
          <p className="mt-4 max-w-xl text-base text-silver">
            Ask our assistant and get an answer right away — in Darija, French, English or Arabic.
          </p>
          <p className="mt-1 w-fit font-ar text-base text-smoke" dir="rtl">
            سول المساعد ديالنا وجاوبك دغيا.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Chat assistant */}
          <motion.div id="chat" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="scroll-mt-28 lg:col-span-7">
            <ChatBot inputId={CHAT_INPUT_ID} />
          </motion.div>

          {/* Ways to reach us */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="flex flex-col gap-3 lg:col-span-5">
            <button type="button" onClick={focusChat} className={`${card} text-left`}>
              <span className="relative flex h-12 w-12 flex-none items-center justify-center rounded-full bg-chalk text-asphalt">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
                  <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
                </svg>
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-xenon ring-2 ring-carbon" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.18em] text-smoke">Chat · instant answers</span>
                <span className="mt-0.5 block text-lg font-semibold text-chalk">
                  Ask the assistant <span className="font-ar text-base font-normal text-smoke">· سول</span>
                </span>
              </span>
              <Chevron />
            </button>

            <a href={whatsappLink('Salam L7it!')} target="_blank" rel="noopener noreferrer" className={card}>
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/[0.06] text-silver">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.18em] text-smoke">WhatsApp · call</span>
                <span className="mt-0.5 block text-lg font-semibold text-chalk" dir="ltr">
                  +212 765 810 304
                </span>
              </span>
              <Chevron />
            </a>

            <a href="https://instagram.com/l7it.art" target="_blank" rel="noopener noreferrer" className={card}>
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/[0.06] text-silver">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.18em] text-smoke">Instagram</span>
                <span className="mt-0.5 block text-lg font-semibold text-chalk">@l7it.art</span>
              </span>
              <Chevron />
            </a>

            <div className="flex items-center gap-5 rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08]">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/[0.06] text-silver">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                </svg>
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.18em] text-smoke">Studio</span>
                <span className="mt-0.5 block text-lg font-semibold text-chalk">Salé, Morocco</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

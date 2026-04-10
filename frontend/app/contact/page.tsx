'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 sm:px-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 text-center">
        {t('contact')}
      </h1>
      <p className="max-w-2xl text-center text-lg text-zinc-600 dark:text-zinc-400 mb-12">
        {t('contactDesc')}
      </p>

      <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('firstName')} / {t('lastName')}
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="block w-full rounded-xl border-zinc-300 px-4 py-3 border shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white" 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('email')}
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="block w-full rounded-xl border-zinc-300 px-4 py-3 border shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white" 
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('messageLabel')}
            </label>
            <textarea 
              id="message" 
              name="message" 
              rows={4} 
              className="block w-full rounded-xl border-zinc-300 px-4 py-3 border shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white" 
            ></textarea>
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
             {t('sendMessage')}
          </button>
        </form>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 w-full text-center border-t border-zinc-200 pt-16 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('email')}</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">support@l7it.com</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('phone')}</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">+212 777 780 778</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('address')}</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Rabat, Morocco</p>
        </div>
      </div>
    </div>
  );
}

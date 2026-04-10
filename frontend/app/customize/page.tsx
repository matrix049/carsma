'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { createCustomOrder, CreateCustomOrderRequest } from '@/lib/apiServices';

export default function CustomizePage() {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCustomOrderRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    carName: '',
    model: '',
    year: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createCustomOrder(formData);
      setSuccess(true);
    } catch (err: any) {
      console.error('Custom order submission failed', err);
      setError(err.message || t('somethingWentWrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 sm:px-6 text-center">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-10 w-10 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t('requestSuccess')}</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          {t('requestSuccessDesc')}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {t('home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {t('customizationRequest')}
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          {t('customDesignDesc')}
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('firstName')}</label>
              <input
                required
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('lastName')}</label>
              <input
                required
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('email')}</label>
              <input
                required
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('phone')}</label>
              <input
                required
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Car Info */}
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div className="sm:col-span-2">
              <label htmlFor="carName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('carBrand')}</label>
              <input
                required
                type="text"
                id="carName"
                name="carName"
                placeholder={language === 'ar' ? 'مثلا: بورش، فيراري...' : language === 'fr' ? 'ex: Porsche, Ferrari...' : 'e.g. Porsche, Ferrari, etc.'}
                value={formData.carName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('carModel')}</label>
              <input
                required
                type="text"
                id="model"
                name="model"
                placeholder={language === 'ar' ? 'مثلا: 911 GT3 RS' : language === 'fr' ? 'ex: 911 GT3 RS' : 'e.g. 911 GT3 RS'}
                value={formData.model}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('carYear')}</label>
              <input
                required
                type="text"
                id="year"
                name="year"
                placeholder={language === 'ar' ? '2023' : '2023'}
                value={formData.year}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('orderNotes')}</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-2xl bg-black py-4 font-bold text-white transition-all shadow-lg hover:bg-zinc-800 hover:-translate-y-1 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? t('processing') : t('submitRequest')}
          </button>
        </form>
      </div>
    </div>
  );
}

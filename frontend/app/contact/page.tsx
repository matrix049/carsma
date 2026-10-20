'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { createContactMessage } from '@/lib/apiServices';
import { btnPrimary, fieldLabel, inputField, kickerLabel, whatsappLink } from '@/lib/uiStyles';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function ContactPage() {
  const { t } = useLanguage();

  // Form state management (Task 9.1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phone: '',
    message: ''
  });

  // Form validation (Task 9.2)
  const validateForm = (): boolean => {
    const errors = {
      name: '',
      phone: '',
      message: ''
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Smiya khassa — name is required';
      isValid = false;
    }

    // Validate phone — accept anything with at least 6 digits, allow + - spaces
    const trimmed = formData.phone.trim();
    if (!trimmed) {
      errors.phone = 'Tilifon khass — phone is required';
      isValid = false;
    } else {
      const digits = trimmed.replace(/[^0-9]/g, '');
      if (digits.length < 6) {
        errors.phone = 'Hada machi numero s7i7 — please enter a valid phone number';
        isValid = false;
      }
    }

    // Validate message
    if (!formData.message.trim()) {
      errors.message = 'Lmessage khass — message is required';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Zid chwiya tafassil (10 ḥarf 3la l9el)';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Form submission handler (Task 9.3)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await createContactMessage({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim()
      });

      // Display success message
      setSuccessMessage(response.message || 'Your message has been sent successfully!');

      // Clear form fields on success
      setFormData({
        name: '',
        phone: '',
        message: ''
      });
      setValidationErrors({
        name: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      // Display error message on failure
      setErrorMessage(error.message || 'Failed to send message. Please try again.');
      // Maintain form data on error (don't clear)
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const fieldClass = (hasError: string) => `${inputField} ${hasError ? '!ring-red-400/70' : ''}`;

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
          <p className="mt-4 max-w-xl text-base text-silver">{t('contactDesc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-7">
            <div className="rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] sm:p-8">
              {successMessage && (
                <div className="mb-6 rounded-2xl bg-white/[0.05] px-5 py-4 text-sm text-chalk ring-1 ring-inset ring-white/15">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 rounded-2xl bg-red-500/10 px-5 py-4 text-sm text-red-300 ring-1 ring-inset ring-red-400/30">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className={fieldLabel}>
                      Name <span className="font-ar normal-case tracking-normal text-smoke">السمية</span>
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Mohamed El Idrissi"
                      autoComplete="name"
                      className={fieldClass(validationErrors.name)}
                    />
                    {validationErrors.name && <p className="text-xs text-red-300">{validationErrors.name}</p>}
                  </label>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>
                      Phone <span className="font-ar normal-case tracking-normal text-smoke">التيليفون</span>
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="06XXXXXXXX"
                      autoComplete="tel"
                      inputMode="tel"
                      className={fieldClass(validationErrors.phone)}
                    />
                    {validationErrors.phone && <p className="text-xs text-red-300">{validationErrors.phone}</p>}
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className={fieldLabel}>
                    Message <span className="font-ar normal-case tracking-normal text-smoke">الرسالة</span>
                  </span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="كتب الرسالة ديالك هنا — write your message here…"
                    className={`${fieldClass(validationErrors.message)} resize-none`}
                  />
                  {validationErrors.message && <p className="text-xs text-red-300">{validationErrors.message}</p>}
                </label>
                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
                  {loading ? 'Sending...' : t('sendMessage')}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="flex flex-col gap-3 lg:col-span-5">
            <a
              href={whatsappLink('Salam L7it!')}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] transition-colors hover:ring-white/25"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-chalk text-asphalt">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.18em] text-smoke">WhatsApp · call</span>
                <span className="mt-0.5 block text-lg font-semibold text-chalk">+212 765 810 304</span>
              </span>
              <svg className="h-4 w-4 text-smoke transition-transform group-hover:translate-x-1 group-hover:text-chalk" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
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

            <a
              href="https://instagram.com/l7it.art"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] transition-colors hover:ring-white/25"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/[0.06] text-silver">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.18em] text-smoke">Instagram</span>
                <span className="mt-0.5 block text-lg font-semibold text-chalk">@l7it.art</span>
              </span>
              <svg className="h-4 w-4 text-smoke transition-transform group-hover:translate-x-1 group-hover:text-chalk" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { createCustomOrder } from '@/lib/apiServices';
import { motion } from 'framer-motion';
import { btnPrimary, fieldLabel, inputField, kickerLabel, whatsappLink } from '@/lib/uiStyles';
import WhatsAppIcon from '@/components/WhatsAppIcon';

const ANGLES = [
  {
    value: 'front',
    label: 'Front',
    ar: 'من القدام',
    icon: <path d="M5 17v2M19 17v2M4 17h16v-4l-1.5-1.5L17 7H7l-1.5 4.5L4 13v4zM4.5 12h15M7 14.5h2M15 14.5h2" />,
  },
  {
    value: 'side',
    label: 'Side',
    ar: 'من الجنب',
    icon: (
      <>
        <path d="M2.5 15H4.5M8.5 15h7M19.5 15h2v-2.6a1.5 1.5 0 00-1-1.4L17 10l-2.6-3H8.6L6 10l-2.3.9a1.5 1.5 0 00-1.2 1.4V15" />
        <circle cx="6.5" cy="15.5" r="2" />
        <circle cx="17.5" cy="15.5" r="2" />
      </>
    ),
  },
  {
    value: 'rear',
    label: 'Rear',
    ar: 'من اللور',
    icon: <path d="M5 17v2M19 17v2M4 17h16v-4l-1.5-1.5L17 7H7l-1.5 4.5L4 13v4zM5.5 13.5h3M15.5 13.5h3M10 15.5h4" />,
  },
];

const STEPS = [
  { title: 'Send your car', ar: 'صيفط الطوموبيل' },
  { title: 'We design it', ar: 'كنصمموها' },
  { title: 'Delivered to your door', ar: 'كتوصلك للدار' },
];

export default function CustomizePage() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    carName: '',
    year: '',
    notes: '',
    perspective: 'side', // front, side, rear
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Reshape into the payload the backend expects. The perspective
      // choice isn't part of the schema, so it gets folded into notes
      // so admins still see which angle the customer picked.
      const noteParts = [
        `Perspective: ${formData.perspective}`,
        formData.notes.trim(),
      ].filter(Boolean);

      await createCustomOrder({
        firstName: formData.firstName.trim(),
        phone: formData.phone.trim(),
        carName: formData.carName.trim(),
        year: formData.year.trim(),
        notes: noteParts.join('\n'),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('somethingWentWrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt px-6 py-40 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-chalk text-asphalt"
        >
          <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
        </motion.div>
        <h1 className="font-display text-4xl font-semibold uppercase leading-[1] text-chalk stretch-125 md:text-6xl">{t('requestSuccess')}</h1>
        <p className="mt-4 max-w-md text-smoke">{t('requestSuccessDesc')}</p>
        <Link href="/" className={`${btnPrimary} mt-10`}>
          {t('home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asphalt pb-32 pt-28 text-chalk md:pt-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Intro */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-32 lg:col-span-5">
            <p className={kickerLabel}>
              Custom build <span className="font-ar normal-case tracking-normal">· طلب خاص</span>
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold uppercase leading-[0.95] stretch-125">
              Your car.
              <br />
              <span className="text-metal">Your wall.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-silver">
              Tell us the model and the angle — we design it, print it on Alucobond and deliver it.
            </p>
            <p className="mt-2 w-fit font-ar text-lg text-smoke" dir="rtl">
              صيفط لينا الماركا والموديل لي بغيتي.
            </p>

            <ol className="mt-10 space-y-4">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] font-mono text-xs text-silver ring-1 ring-inset ring-white/10">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-chalk">
                    {step.title} <span className="font-ar font-normal text-smoke">· {step.ar}</span>
                  </span>
                </li>
              ))}
            </ol>

            <a
              href={whatsappLink('Salam L7it, bghit lawha custom dyal tomobil dyali.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-silver transition-colors hover:text-chalk"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Prefer WhatsApp? Send us a photo
            </a>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-10 rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] sm:p-10">
              {/* Car */}
              <fieldset className="space-y-5">
                <legend className="mb-5 font-display text-lg font-semibold uppercase stretch-125">Your car</legend>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className={fieldLabel}>
                      Car &amp; model <span className="font-ar normal-case tracking-normal text-smoke">الطوموبيل</span>
                    </span>
                    <input required type="text" name="carName" placeholder="BMW M3" value={formData.carName} onChange={handleChange} className={inputField} />
                  </label>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>
                      Year <span className="font-ar normal-case tracking-normal text-smoke">العام</span>
                    </span>
                    <input required type="text" name="year" inputMode="numeric" placeholder="2020" value={formData.year} onChange={handleChange} className={inputField} />
                  </label>
                </div>
              </fieldset>

              {/* Angle */}
              <fieldset>
                <legend className="mb-5 font-display text-lg font-semibold uppercase stretch-125">
                  Angle <span className="font-ar text-base font-normal normal-case text-smoke">· منين بغيتي التصويرة؟</span>
                </legend>
                <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Angle">
                  {ANGLES.map((option) => {
                    const active = formData.perspective === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setFormData((prev) => ({ ...prev, perspective: option.value }))}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon ${
                          active ? 'bg-chalk text-asphalt' : 'bg-carbon-2 text-silver ring-1 ring-inset ring-white/10 hover:ring-white/25'
                        }`}
                      >
                        <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          {option.icon}
                        </svg>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em]">{option.label}</span>
                        <span className={`font-ar text-xs ${active ? 'text-asphalt/60' : 'text-smoke'}`}>{option.ar}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Notes */}
              <label className="block space-y-2">
                <span className={fieldLabel}>
                  Notes <span className="font-ar normal-case tracking-normal text-smoke">ملاحظات</span>
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Colour, plate, background… اللون، الماتريكول…"
                  value={formData.notes}
                  onChange={handleChange}
                  className={`${inputField} resize-none`}
                />
              </label>

              {/* Contact */}
              <fieldset className="space-y-5">
                <legend className="mb-5 font-display text-lg font-semibold uppercase stretch-125">Your contact</legend>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className={fieldLabel}>
                      Name <span className="font-ar normal-case tracking-normal text-smoke">السمية</span>
                    </span>
                    <input required type="text" name="firstName" placeholder="Mohamed" value={formData.firstName} onChange={handleChange} autoComplete="name" className={inputField} />
                  </label>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>
                      Phone <span className="font-ar normal-case tracking-normal text-smoke">التيليفون</span>
                    </span>
                    <input required type="tel" name="phone" placeholder="06XXXXXXXX" value={formData.phone} onChange={handleChange} autoComplete="tel" className={inputField} />
                  </label>
                </div>
              </fieldset>

              {error && <p className="text-sm font-medium text-red-400">{error}</p>}

              <div className="space-y-3">
                <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
                  {isSubmitting ? t('processing') : 'Send request'}
                </button>
                <p className="text-center text-xs text-smoke">We&apos;ll reply with a quote within 48 hours.</p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

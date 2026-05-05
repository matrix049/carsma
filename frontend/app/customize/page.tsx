'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { createCustomOrder } from '@/lib/apiServices';
import { motion } from 'framer-motion';
import { btnAccent } from '@/lib/uiStyles';

export default function CustomizePage() {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        carName: formData.carName.trim(),
        model: formData.carName.trim(),
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
      <div className="container mx-auto px-4 py-40 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-10 inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </motion.div>
        <h1 className="font-display text-5xl md:text-7xl uppercase leading-[0.85] tracking-tight mb-4">{t('requestSuccess')}</h1>
        <p className="text-zinc-400 font-medium mb-12">{t('requestSuccessDesc')}</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-full bg-white text-black px-12 py-5 font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl">
          {t('home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-40">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          {/* Left Side: Hero Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <div className="space-y-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-blue-500">Bespoke Commissions</span>
              <h1 className="font-display text-[clamp(3.5rem,10vw,11rem)] uppercase leading-[0.85] tracking-tight">
                Your <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Car,</span><br />
                <span className="text-blue-600">Our Art</span>
              </h1>
              <p className="text-lg text-blue-400 font-medium leading-relaxed pt-4 border-t border-zinc-800">
                مالقيتيش الطوموبيل لي كاتعجبك ، صيفط لينا الماركا و الموضيل لي بغيتي
              </p>
            </div>
            <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
              {t('customDesignDesc')} Transform your automotive soul into a gallery-grade masterpiece. Every curve, every reflection, meticulously captured by our digital curators.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-10">
               <div className="aspect-square rounded-[2rem] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl transition-transform hover:-rotate-2 duration-500">
                  <img src="/m1.png" className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
               </div>
               <div className="aspect-square rounded-[2rem] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl transition-transform hover:rotate-2 duration-500 pt-8">
                  <img src="/m2.png" className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
               </div>
            </div>
          </motion.div>

          {/* Right Side: Step Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-[3rem] bg-zinc-900 border border-zinc-800 p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
              <form onSubmit={handleSubmit} className="space-y-14">
                
                {/* 01. Vehicle Identity */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-0.5 w-8 bg-blue-600" />
                    <h2 className="text-xl font-display uppercase tracking-tight">01. Vehicle Identity</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-200 ml-1">Smiya dyal tomobil w model dyalha</label>
                       <input required type="text" name="carName" placeholder="مثال: BMW M3" value={formData.carName} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-medium focus:border-blue-600 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-200 ml-1">3am dyalha</label>
                       <input required type="text" name="year" placeholder="مثال: 2020" value={formData.year} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-medium focus:border-blue-600 focus:outline-none transition-all" />
                    </div>
                  </div>
                </section>

                {/* 02. Perspective */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-0.5 w-8 bg-blue-600" />
                    <h2 className="text-xl font-display uppercase tracking-tight">02. Kifach bghiti tswira dyal tomobil?</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'front', label: 'Men l9dam' },
                      { value: 'side', label: 'Men janb' },
                      { value: 'rear', label: 'Men lwer' }
                    ].map((option) => (
                      <button 
                        key={option.value} type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, perspective: option.value }))}
                        className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                          formData.perspective === option.value ? 'border-blue-600 bg-blue-600/5 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                         <svg className={`w-8 h-8 ${formData.perspective === option.value ? 'text-blue-500' : 'text-zinc-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.502 1.94a.5.5 0 010 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 01.707 0l1.293 1.293zm-1.75 2.457l-1.354 1.354-2-2 1.354-1.354 2 2z"/></svg>
                         <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 03. Notes */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-0.5 w-8 bg-blue-600" />
                    <h2 className="font-display text-2xl tracking-tight">
                      الملاحظات: (بغيتي تزيد شي حاجة؟)
                    </h2>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-zinc-200 ml-1">Ay haja khra bghiti tzidha</label>
                     <textarea name="notes" rows={4} placeholder="اكتب أي تفاصيل إضافية تريد إضافتها للطلب..." value={formData.notes} onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-medium focus:border-blue-600 focus:outline-none transition-all resize-none" />
                  </div>
                </section>

                {/* 04. Contact info */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-0.5 w-8 bg-blue-600" />
                    <h2 className="font-display text-2xl uppercase tracking-tight">04. M3lomat dyalk — Your contact</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-200 ml-1">First name • السمية</label>
                      <input required type="text" name="firstName" placeholder="Mohamed" value={formData.firstName} onChange={handleChange} autoComplete="given-name"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-medium focus:border-blue-600 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-200 ml-1">Last name • النسب</label>
                      <input required type="text" name="lastName" placeholder="El Idrissi" value={formData.lastName} onChange={handleChange} autoComplete="family-name"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-medium focus:border-blue-600 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-200 ml-1">Phone • التيليفون</label>
                      <input required type="tel" name="phone" placeholder="06XXXXXXXX" value={formData.phone} onChange={handleChange} autoComplete="tel"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-medium focus:border-blue-600 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-200 ml-1">Email • الإيميل</label>
                      <input required type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-medium focus:border-blue-600 focus:outline-none transition-all" />
                    </div>
                  </div>
                </section>

                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                <div className="space-y-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${btnAccent} w-full`}
                  >
                    {isSubmitting ? t('processing') : 'Submit Request'}
                  </button>
                  <p className="text-[9px] text-center text-zinc-600 uppercase tracking-widest font-black">Our curators will respond with a quote within 48 hours.</p>
                </div>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}


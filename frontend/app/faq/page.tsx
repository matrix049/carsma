'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { btnPrimary, kickerLabel } from '@/lib/uiStyles';

interface FAQItem {
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  /** Optional button under the answer. */
  cta?: { label: string; labelAr: string; href: string };
}

const FAQS: FAQItem[] = [
  {
    question: 'What sizes are available?',
    questionAr: 'شنو هي المقاسات المتوفرة؟',
    answer:
      'Each piece comes in the size written on its product page, right under the price. The 3D editions come in one size only: G-Class 3D is 120 × 75 cm and 911 3D is 120 × 50 cm.',
    answerAr:
      'كل قطعة كتجي بالمقاس لي مكتوب ف الصفحة ديالها، تحت الثمن. الإصدارات 3D عندها مقاس واحد: G-Class 3D ‏120 × 75 سم و 911 3D ‏120 × 50 سم.',
  },
  {
    question: 'How long does shipping take?',
    questionAr: 'شحال كياخد التوصيل؟',
    answer:
      'Delivery takes 48 hours to 3 days anywhere in Morocco, and it is free. You get a tracking number as soon as your order ships.',
    answerAr: 'التوصيل كياخد من 48 ساعة ل 3 أيام لكاع مدن المغرب، وهو فابور. كيوصلك رقم التتبع ملي تخرج الكوموند ديالك.',
  },
  {
    question: 'What material do you use?',
    questionAr: 'شنو هي المادة لي كتخدمو بيها؟',
    answer:
      'Premium 3 mm Alucobond (aluminium composite) with UV printing: strong, light, and the colours stay sharp for years.',
    answerAr: 'كنخدمو بـ Alucobond ديال 3 مم (ألومنيوم مركب) مطبوع بـ UV: قوي، خفيف، والألوان كتبقى واضحة لسنين.',
  },
  {
    question: 'Can I order a custom car?',
    questionAr: 'واش نقدر نطلب طوموبيل على حسابي؟',
    answer:
      "Yes! Any car, any model and year — even a logo or a motorbike. Tell us what you want and the team takes care of the rest. Custom pieces start with a partial advance payment.",
    answerAr: 'إيه! أي طوموبيل، أي موديل وعام — حتى لوغو ولا موطور. قول لينا شنو بغيتي والفريق كيتكلف بالباقي. القطع الخاصة كتبدا بتسبيق جزئي.',
    cta: { label: 'Contact us', labelAr: 'تواصل معانا', href: '/contact' },
  },
  {
    question: 'How do I put it on the wall?',
    questionAr: 'كيفاش نلصقها ف الحيط؟',
    answer:
      "Every piece comes with double-sided tape. Peel the film off one side, place the piece exactly where you want it and press gently — don't force it. You can take it off later and stick it again with new tape; it doesn't damage the wall or pull the paint off.",
    answerAr:
      'كل قطعة كتجي معاها سكوتش دوبل فاص. حيد الورقة من جهة وحدة، حط القطعة ف البلاصة لي بغيتي وضغط عليها شوية بلا ما تزير. تقدر تحيدها من بعد وتلصقها بسكوتش جديد، وما كتضرش الحيط وما كتحيدش الصباغة.',
  },
  {
    question: 'How do I take care of it?',
    questionAr: 'كيفاش نحافظ عليها؟',
    answer: 'Just clean it gently with a soft, dry cloth.',
    answerAr: 'غير نقيها بلطف بشيفون ناعم وناشف.',
  },
  {
    question: 'What payment methods do you accept?',
    questionAr: 'شنو هي طرق الخلاص؟',
    answer:
      'Cash on delivery: you pay when your piece arrives, nothing before. For a custom order we take a partial advance payment before we start working on it.',
    answerAr: 'الخلاص عند الاستلام: كتخلص ملي توصلك القطعة، ما كتخلص والو قبل. ف الطلبات الخاصة كناخدو تسبيق جزئي قبل ما نبداو الخدمة.',
  },
  {
    question: 'What is your return policy?',
    questionAr: 'شنو هي سياسة الإرجاع؟',
    answer:
      'We take a piece back only if it arrives broken because of the delivery. Film the parcel before and while you open it — we need that proof to replace it. Every piece is made to order, so there are no other returns.',
    answerAr:
      'كنقبلو الإرجاع غير إلا وصلاتك القطعة مهرسة بسبب التوصيل. صور الكولي فيديو قبل وملي كتحلو، حيت خاصنا هاد الدليل باش نبدلوها ليك. كل قطعة كتصاوب على حسابك، داكشي علاش ماكاينش إرجاع آخر.',
  },
  {
    question: 'Do I need a frame?',
    questionAr: 'واش خاصني إطار؟',
    answer: 'No frame needed: the piece sticks straight to the wall with the double-sided tape that comes with it.',
    answerAr: 'ما محتاجش إطار: القطعة كتلصق نيشان ف الحيط بالسكوتش دوبل فاص لي كيجي معاها.',
  },
];

export default function FAQPage() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = FAQS;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-asphalt pb-32 pt-28 text-chalk md:pt-36">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 md:mb-14">
          <p className={kickerLabel}>
            Questions <span className="font-ar normal-case tracking-normal">· الأسئلة الشائعة</span>
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold uppercase leading-[0.95] stretch-125">FAQ</h1>
        </motion.div>

        {/* FAQ Items */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon"
                >
                  <span className="flex-1">
                    <span className="block text-base font-semibold text-chalk sm:text-lg">
                      {language === 'ar' ? faq.questionAr : faq.question}
                    </span>
                    {language !== 'ar' && <span className="mt-1 block font-ar text-sm text-smoke">{faq.questionAr}</span>}
                  </span>
                  <svg
                    aria-hidden="true"
                    className={`h-5 w-5 flex-none text-silver transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pr-10">
                        <p className="text-[15px] leading-relaxed text-silver">{language === 'ar' ? faq.answerAr : faq.answer}</p>
                        {language !== 'ar' && (
                          <p className="mt-3 font-ar text-sm leading-relaxed text-smoke" dir="rtl">
                            {faq.answerAr}
                          </p>
                        )}
                        {faq.cta && (
                          <Link href={faq.cta.href} className={`${btnPrimary} mt-5`}>
                            {faq.cta.label} <span className="font-ar text-sm normal-case tracking-normal opacity-70">· {faq.cta.labelAr}</span>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 flex flex-col items-start gap-6 rounded-3xl bg-carbon p-8 ring-1 ring-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold uppercase stretch-125">Still have questions?</h2>
            <p className="mt-1 font-ar text-smoke">عندك أسئلة أخرى؟</p>
          </div>
          <Link href="/contact" className={btnPrimary}>
            Contact us
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h15" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

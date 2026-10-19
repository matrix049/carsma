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
}

export default function FAQPage() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "What materials are used for the prints?",
      questionAr: "شنو هي المواد المستخدمة للطباعة؟",
      answer: "We use premium Alucobond material that ensures your artwork is durable, lightweight, and maintains vibrant colors. This high-quality aluminum composite material is perfect for modern wall art and provides excellent longevity.",
      answerAr: "كنستخدمو مادة الألوكوبوند الممتازة لي كتضمن أن اللوحة ديالك تكون قوية وخفيفة وتحافظ على الألوان الزاهية. هاد المادة عالية الجودة مثالية للوحات الحائط العصرية وكتعطي متانة ممتازة."
    },
    {
      question: "How long does shipping take?",
      questionAr: "شحال كتاخد التوصيل؟",
      answer: "Shipping takes from 24 hours to 3 days within Morocco. We ensure fast and reliable delivery to all major cities. You'll receive a tracking number once your order ships.",
      answerAr: "التوصيل كياخد من 24 ساعة ل 3 أيام داخل المغرب. كنضمنو توصيل سريع وموثوق لجميع المدن الكبيرة. غادي توصلك رقم التتبع فاش نصيفطو الطلب ديالك."
    },
    {
      question: "Can I request a custom car design?",
      questionAr: "واش نقدر نطلب تصميم خاص بالطوموبيل ديالي؟",
      answer: "Absolutely! If you don't find your favorite car in our gallery, you can request a custom design. Just provide us with the car brand, model, and any specific preferences, and our team will create a unique artwork for you.",
      answerAr: "طبعاً! إلا مالقيتيش الطوموبيل لي كاتعجبك فالݣالوري ديالنا، تقدر تطلب تصميم خاص. غير عطينا الماركا والموديل وأي تفاصيل خاصة، وفريقنا غادي يديرلك لوحة فريدة."
    },
    {
      question: "What sizes are available?",
      questionAr: "شنو هي المقاسات المتوفرة؟",
      answer: "Our standard size is 120cm x 35cm, and we also offer a larger 120cm x 50cm format. Both are carefully selected for modern wall art and fit beautifully in most spaces, providing an elegant and impactful display. On some orders we can also customise the size to fit your wall — just message us before ordering.",
      answerAr: "المقاس الستاندارد ديالنا هو 120 سم × 35 سم، وعندنا حتى مقاس كبير 120 سم × 50 سم. بجوج مختارين بعناية ومثاليين للوحات الحائط العصرية وكيناسبو معظم المساحات وكيعطيو عرض أنيق ومؤثر. وفـ بعض الطلبات نقدرو نخدمو ليك المقاس على حساب الحيط ديالك — غير صيفط لينا رسالة قبل ما تكوماندي."
    },
    {
      question: "Do you offer framing services?",
      questionAr: "واش كتقدمو خدمة الإطار؟",
      answer: "Currently, our prints come unframed to give you the flexibility to choose a frame that matches your interior style. However, we can recommend local framing services in major Moroccan cities.",
      answerAr: "حالياً، اللوحات كيجيو بلا إطار باش تقدر تختار الإطار لي كيناسب الديكور ديالك. ولكن نقدرو ننصحوك بمحلات الإطارات فالمدن الكبيرة."
    },
    {
      question: "What is your return policy?",
      questionAr: "شنو هي سياسة الإرجاع؟",
      answer: "We do not accept returns on our custom artwork. Each piece is carefully crafted and printed specifically for your order. Please review your selection carefully before placing your order to ensure complete satisfaction.",
      answerAr: "ما كنقبلوش الإرجاع على اللوحات المخصصة ديالنا. كل قطعة كتتصنع وتتطبع خصيصاً للطلب ديالك. عافاك راجع الاختيار ديالك مزيان قبل ما تأكد الطلب باش تكون راضي تماماً."
    },
    {
      question: "How do I care for my artwork?",
      questionAr: "كيفاش نحافظ على اللوحة ديالي؟",
      answer: "Keep your artwork away from direct sunlight and moisture. Clean gently with a soft, dry cloth. Avoid touching the printed surface directly. With proper care, your artwork will maintain its quality for years.",
      answerAr: "خلي اللوحة ديالك بعيدة على الشمس المباشرة والرطوبة. نقيها بلطف بقماش ناعم وناشف. تجنب تلمس السطح المطبوع مباشرة. مع العناية الصحيحة، اللوحة ديالك غادي تبقى بجودة عالية لسنين."
    },
    {
      question: "What payment methods do you accept?",
      questionAr: "شنو هي طرق الدفع المقبولة؟",
      answer: "We currently accept Cash on Delivery (COD) for all orders within Morocco. You pay when your artwork arrives at your doorstep. This ensures a secure and convenient shopping experience.",
      answerAr: "حالياً كنقبلو الدفع عند الاستلام (COD) لجميع الطلبات داخل المغرب. كتخلص فاش توصلك اللوحة للدار. هادشي كيضمن تجربة شراء آمنة ومريحة."
    }
  ];

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

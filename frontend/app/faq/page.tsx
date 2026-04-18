'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

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
      answer: "We use premium museum-grade paper with archival inks that ensure your artwork lasts for decades without fading. Each print is carefully crafted to maintain the highest quality standards.",
      answerAr: "كنستخدمو ورق ممتاز بجودة المتاحف مع حبر كيصبر بزاف باش اللوحة ديالك تبقى سنين بلا ما تتبهت. كل لوحة كنديروها بعناية فائقة باش نضمنو أعلى جودة."
    },
    {
      question: "How long does shipping take?",
      questionAr: "شحال كتاخد التوصيل؟",
      answer: "Delivery within Morocco typically takes 2-5 business days. We ship to all major cities including Rabat, Casablanca, Marrakech, and more. You'll receive a tracking number once your order ships.",
      answerAr: "التوصيل داخل المغرب عادة كياخد من 2 ل 5 أيام. كنوصلو لجميع المدن الكبيرة بحال الرباط، الدار البيضا، مراكش، وغيرهم. غادي توصلك رقم التتبع فاش نصيفطو الطلب ديالك."
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
      answer: "We offer three standard sizes: Small (30x40cm), Medium (50x70cm), and Large (70x100cm). Each size is carefully selected to fit different spaces and preferences. Prices vary by size.",
      answerAr: "عندنا ثلاث مقاسات: صغير (30x40 سم)، متوسط (50x70 سم)، وكبير (70x100 سم). كل مقاس مختار بعناية باش يناسب مساحات وأذواق مختلفة. الأثمنة كتختالف حسب المقاس."
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
      answer: "We want you to be completely satisfied with your purchase. If there's any issue with your order, please contact us within 7 days of delivery. We'll work with you to resolve any concerns.",
      answerAr: "بغيناك تكون راضي تماماً على الشراء ديالك. إلا كان شي مشكل مع الطلب ديالك، عيط لينا فأقل من 7 أيام من التوصيل. غادي نخدمو معاك باش نحلو أي مشكل."
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
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-40">
      <div className="container mx-auto px-6 sm:px-10 max-w-5xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24 space-y-6"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">Support Center</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase font-jakarta">
            FAQ
          </h1>
          <div className="h-2 w-32 bg-blue-600 rounded-full mx-auto shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
          <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">
            Frequently Asked Questions • الأسئلة الشائعة
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/50 overflow-hidden backdrop-blur-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-all"
              >
                <div className="flex-1 pr-6">
                  <h3 className="text-lg font-black text-white mb-2">
                    {language === 'ar' ? faq.questionAr : faq.question}
                  </h3>
                  {language !== 'ar' && (
                    <p className="text-sm text-zinc-500 font-medium">
                      {faq.questionAr}
                    </p>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-none"
                >
                  <svg 
                    className="w-6 h-6 text-blue-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6 pt-2 border-t border-zinc-800">
                      <p className="text-base text-zinc-300 leading-relaxed mb-4">
                        {language === 'ar' ? faq.answerAr : faq.answer}
                      </p>
                      {language !== 'ar' && (
                        <p className="text-sm text-blue-400 leading-relaxed font-medium">
                          {faq.answerAr}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 text-center p-12 rounded-3xl bg-zinc-900 border border-zinc-800"
        >
          <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">
            Still Have Questions? • عندك أسئلة أخرى؟
          </h3>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Our team is here to help. Contact us and we'll get back to you as soon as possible.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 shadow-3xl shadow-blue-500/20 active:scale-95"
          >
            Contact Us • تواصل معنا
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </div>
  );
}

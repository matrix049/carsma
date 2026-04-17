'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createOrder, Customer } from '@/lib/apiServices';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, calculateTotal, clearCart } = useCart();
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const SHIPPING_COST = 25;
  const subtotal = Math.round(calculateTotal());
  const finalTotal = subtotal + SHIPPING_COST;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.address}, ${formData.city}`;
      
      // Split firstName into first and last name if it contains a space
      const nameParts = formData.firstName.trim().split(' ');
      const firstName = nameParts[0] || formData.firstName;
      const lastName = nameParts.slice(1).join(' ') || formData.firstName;
      
      const customerPayload: Customer = {
        firstName: firstName,
        lastName: lastName,
        phone: formData.phone,
        address: fullAddress
      };
      const orderData = {
        customer: customerPayload,
        products: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: finalTotal,
        paymentMethod: 'cod' 
      };
      await createOrder(orderData);
      setSuccess(true);
      clearCart();
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setOrderError(err.message || t('orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-6 py-48 text-center bg-[#0a0a0a] min-h-screen flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
          className="mb-12 inline-flex h-32 w-32 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase font-jakarta text-white">{t('orderConfirmed')}</h1>
        <p className="text-zinc-500 text-xl font-medium mb-16 max-w-lg">{t('orderSuccessDesc')}</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-2xl bg-white text-black px-16 py-6 font-black uppercase tracking-[0.2em] transform transition-all hover:scale-105 active:scale-95 shadow-4xl text-xs">
          {t('home')}
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-6 py-48 text-center bg-[#0a0a0a] min-h-screen flex flex-col items-center justify-center">
         <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 font-jakarta text-white">{t('emptyCart')}</h1>
         <Link href="/shop" className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] hover:underline underline-offset-8 transition-all">{t('continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-48">
      <div className="container mx-auto px-4 sm:px-6 md:px-10 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-12 sm:mb-24 space-y-3 sm:space-y-4"
        >
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] sm:tracking-[0.6em] text-blue-600">Secure Protocol</span>
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter font-jakarta uppercase leading-none">
            Gallery<span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"> Checkout</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-24 items-start">
          {/* Form Side */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-12 sm:space-y-20"
          >
            {/* Identity & Logistics Section */}
            <motion.section variants={itemVariants} className="space-y-8 sm:space-y-12">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="h-0.5 w-8 sm:w-12 bg-blue-600" />
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight font-jakarta">01. Identity & Logistics</h2>
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:gap-10">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">Full Name • الاسم الكامل</label>
                  <input required type="text" name="firstName" placeholder="Khalid Alami" value={formData.firstName} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl sm:rounded-[1.5rem] px-5 py-4 sm:px-8 sm:py-6 text-base sm:text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-800" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">Phone Number • رقم الهاتف</label>
                  <input required type="tel" name="phone" placeholder="+212 6 00 00 00 00" value={formData.phone} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl sm:rounded-[1.5rem] px-5 py-4 sm:px-8 sm:py-6 text-base sm:text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-800" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">Shipping Address • العنوان</label>
                  <input required type="text" name="address" placeholder="Boulevard de l'Aviation, Building 4, Apt 12" value={formData.address} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl sm:rounded-[1.5rem] px-5 py-4 sm:px-8 sm:py-6 text-base sm:text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-800" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">City • المدينة</label>
                  <input required type="text" name="city" placeholder="Casablanca" value={formData.city} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl sm:rounded-[1.5rem] px-5 py-4 sm:px-8 sm:py-6 text-base sm:text-sm font-medium focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-800" />
                </div>
              </form>
            </motion.section>

            {/* Payment Section */}
            <motion.section variants={itemVariants} className="space-y-8 sm:space-y-12">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="h-0.5 w-8 sm:w-12 bg-blue-600" />
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight font-jakarta">02. Settlement</h2>
              </div>

              <div className="relative p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border-2 border-blue-600 bg-blue-600/5 flex items-center gap-6 sm:gap-10 shadow-[0_0_40px_rgba(37,99,235,0.1)]">
                <div className="flex-none h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center shadow-3xl shadow-blue-500/40 outline outline-4 outline-blue-600/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div className="flex-1">
                   <h4 className="text-base sm:text-xl font-black tracking-tight text-white mb-1 sm:mb-2">حتى توصلك عاد خلص</h4>
                   <p className="text-xs sm:text-sm text-zinc-500 font-medium">Pay when it arrives. No upfront payment required.</p>
                </div>
                <div className="hidden sm:block opacity-10">
                   <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h5a1 1 0 011 1v10a1 1 0 01-1 1h-1m-4 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
                </div>
              </div>
            </motion.section>
          </motion.div>

          {/* Summary Side */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.4 }}
              className="rounded-2xl sm:rounded-[4rem] bg-zinc-900 border border-zinc-800 p-6 sm:p-12 shadow-4xl sticky top-32 overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full" />

              <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-500 mb-8 sm:mb-12">Manifesto & Total</h2>
              
              <div className="space-y-6 sm:space-y-10 mb-12 sm:mb-16 max-h-[40vh] overflow-y-auto pr-2 sm:pr-4 no-scrollbar">
                {cart.map((item, index) => (
                  <div key={`${item._id}-${item.selectedSize || 'default'}-${index}`} className="flex gap-4 sm:gap-8 items-center group">
                    <div className="h-16 w-16 sm:h-24 sm:w-24 flex-none rounded-xl sm:rounded-[2rem] overflow-hidden bg-zinc-950 border border-zinc-800 transition-transform group-hover:scale-105 duration-500">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover scale-110" />
                    </div>
                    <div className="flex-1 space-y-0.5 sm:space-y-1">
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-white leading-tight">{item.name}</h4>
                      <p className="text-[8px] sm:text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
                        {item.category} • X{item.quantity}
                        {item.selectedSize && ` • ${item.sizeLabel || item.selectedSize}`}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white whitespace-nowrap">
                      {item.price * item.quantity} <span className="text-[8px] sm:text-[9px] text-zinc-600 italic">MAD</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12 border-t border-zinc-800 text-zinc-500">
                <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                  <span>Valuation</span>
                  <span className="text-white">{subtotal} MAD</span>
                </div>
                <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2 sm:gap-3">
                    Transit (Morocco)
                    <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border border-zinc-800 flex items-center justify-center text-[7px] sm:text-[8px] font-bold">!</div>
                  </div>
                  <span className="text-white">25 MAD</span>
                </div>
                <div className="flex justify-between items-end text-3xl sm:text-5xl font-black text-white pt-6 sm:pt-10 mt-6 sm:mt-10 border-t border-zinc-800 font-jakarta">
                  <div className="space-y-1.5 sm:space-y-2">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] sm:tracking-[0.6em] text-blue-600 block">Total Liability</span>
                    <span>{finalTotal}</span>
                  </div>
                  <span className="text-base sm:text-xl mb-1 sm:mb-1.5 opacity-50">MAD</span>
                </div>
              </div>

              {orderError && <p className="mt-6 sm:mt-8 text-red-500 text-[9px] sm:text-[10px] font-black uppercase text-center tracking-widest">{orderError}</p>}

              <button
                form="checkout-form"
                type="submit"
                disabled={isSubmitting}
                className={`mt-10 sm:mt-16 w-full rounded-xl sm:rounded-[2rem] flex items-center justify-center py-5 sm:py-8 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white transition-all shadow-4xl active:scale-[0.98] ${
                  isSubmitting ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                }`}
              >
                {isSubmitting ? t('processing') : (
                  <span className="flex items-center gap-3 sm:gap-4">
                    <span>Finalize Order • أكمل الطلب</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </span>
                )}
              </button>
              
              <p className="mt-6 sm:mt-10 text-[8px] sm:text-[9px] text-center text-zinc-600 leading-relaxed font-black uppercase tracking-widest">
                Verification required upon arrival. Physical tender only.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}


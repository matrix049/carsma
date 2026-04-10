'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createOrder, Customer } from '@/lib/apiServices';

const MOROCCO_STATES = [
  'Tanger-Tétouan-Al Hoceïma',
  "L'Oriental",
  'Fès-Meknès',
  'Rabat-Salé-Kénitra',
  'Béni Mellal-Khénifra',
  'Casablanca-Settat',
  'Marrakech-Safi',
  'Drâa-Tafilalet',
  'Souss-Massa',
  'Guelmim-Oued Noun',
  'Laâyoune-Sakia El Hamra',
  'Dakhla-Oued Ed-Dahab'
];

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
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const SHIPPING_COST = 30;
  const subtotal = calculateTotal();
  const finalTotal = subtotal + SHIPPING_COST;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setIsSubmitting(true);

    try {
      // Concatenate the address fields into the single expected 'address' backend string
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip} | Email: ${formData.email} | Notes: ${formData.notes}`;

      const customerPayload: Customer = {
        firstName: formData.firstName,
        lastName: formData.lastName,
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
    } catch (err: any) {
      console.error('Checkout failed', err);
      // Fallback translation for error
      setOrderError(err.message || (language === 'ar' ? 'فشلت معالجة الطلب. يرجى المحاولة مرة أخرى' : 'Failed to process order. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 sm:px-6 text-center text-zinc-900 dark:text-zinc-50">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-10 w-10 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Thank you for your purchase {formData.firstName}. We have received your order and will begin processing it shortly.
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

  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 sm:px-6 text-center pt-24">
         <h1 className="text-2xl font-bold">{t('emptyCart')}</h1>
         <Link href="/" className="mt-6 font-medium text-blue-600 hover:text-blue-500">{t('continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t('checkout')}</h1>
      <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
        <p className="text-blue-800 dark:text-blue-400 flex items-center">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <strong>Note:</strong> {t('shippingNote')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-6">{t('shippingInfo')}</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('firstName')}</label>
                <div className="mt-1">
                  <input required type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('lastName')}</label>
                <div className="mt-1">
                  <input required type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('email')}</label>
                <div className="mt-1">
                  <input required type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('phone')}</label>
                <div className="mt-1">
                  <input required type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('address')}</label>
                <div className="mt-1">
                  <input required type="text" id="address" name="address" value={formData.address} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('state')}</label>
                <div className="mt-1">
                  <select required id="state" name="state" value={formData.state} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border">
                    <option value="" disabled>---</option>
                    {MOROCCO_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('city')}</label>
                <div className="mt-1">
                  <input required type="text" id="city" name="city" value={formData.city} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="zip" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('zip')}</label>
                <div className="mt-1">
                  <input type="text" id="zip" name="zip" value={formData.zip} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('orderNotes')}</label>
                <div className="mt-1">
                  <textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange}
                    className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-white px-4 py-3 border" />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8">
              <h2 className="text-xl font-semibold mb-6">{t('paymentMethod')}</h2>
              <div className="rounded-xl border border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 p-4 flex items-center">
                <input id="cod" type="radio" checked readOnly className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300" />
                <label htmlFor="cod" className="ml-3 block font-medium text-zinc-900 dark:text-zinc-100 flex-1 cursor-pointer">
                  {t('cod')}
                </label>
                <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>

          </form>

          {orderError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              <p className="text-sm text-red-800 dark:text-red-400">{orderError}</p>
            </div>
          )}
        </div>

        {/* Order Summary side panel */}
        <div className="w-full lg:w-96">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950/50 sticky top-32">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t('orderSummary')}</h2>
            
            <ul className="mb-6 space-y-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {cart.map((item) => (
                <li key={item._id} className="pt-4 flex justify-between text-sm">
                  <div className="flex-1 pr-4 text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.quantity}x</span> {item.name}
                  </div>
                  <div className="text-zinc-900 dark:text-zinc-100 font-medium">
                    {(item.price * item.quantity).toFixed(0)} MAD
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between text-base text-zinc-600 dark:text-zinc-400 mb-2">
              <p>{t('subtotal')}</p>
              <p>{subtotal.toFixed(0)} MAD</p>
            </div>
            
            <div className="flex justify-between text-base text-blue-600 dark:text-blue-400 mb-4">
              <p>{t('shipping')}</p>
              <p>+30 MAD</p>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between text-xl font-black text-zinc-900 dark:text-zinc-100">
              <p>{t('total')}</p>
              <p>{finalTotal.toFixed(0)} MAD</p>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className={`mt-8 w-full rounded-xl flex items-center justify-center py-4 font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed shadow-none hover:-translate-y-0' : 'bg-black dark:bg-white dark:text-black'
              }`}
            >
              {isSubmitting ? t('processing') : t('placeOrder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

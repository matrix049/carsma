'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createOrder, Customer } from '@/lib/apiServices';
import { DUO_LABEL, DUO_LABEL_AR } from '@/lib/bundles';
import { motion } from 'framer-motion';
import { btnPrimary, fieldLabel, inputField, kickerLabel } from '@/lib/uiStyles';
import { trackInitiateCheckout, trackPurchase } from '@/lib/metaPixel';
import Plate from '@/components/Plate';
import { hideBrokenImage } from '@/components/ProductCard';

const FIELDS = [
  { name: 'firstName', label: 'Full name', ar: 'الاسم الكامل', type: 'text', placeholder: 'Khalid Alami', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', ar: 'رقم الهاتف', type: 'tel', placeholder: '06XXXXXXXX', autoComplete: 'tel' },
  { name: 'address', label: 'Address', ar: 'العنوان', type: 'text', placeholder: "Boulevard de l'Aviation, Building 4, Apt 12", autoComplete: 'street-address' },
  { name: 'city', label: 'City', ar: 'المدينة', type: 'text', placeholder: 'Casablanca', autoComplete: 'address-level2' },
] as const;

export default function CheckoutPage() {
  const { cart, calculateTotal, offer, clearCart, removeFromCart, updateQuantity } = useCart();
  const { t } = useLanguage();
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

  const subtotal = Math.round(calculateTotal());
  // The 3D duo offer comes off here; the server checks it again.
  const finalTotal = subtotal - offer.amount;

  // Fire InitiateCheckout once per checkout-page load when there's a non-empty
  // cart. The ref prevents re-firing when the cart contents shift before the
  // user submits (e.g. quantity tweaks, item removal).
  const initiateCheckoutFired = useRef(false);
  useEffect(() => {
    if (initiateCheckoutFired.current) return;
    if (cart.length === 0) return;
    initiateCheckoutFired.current = true;
    trackInitiateCheckout({
      productIds: cart.map((item) => item._id),
      numItems: cart.reduce((n, item) => n + item.quantity, 0),
      value: finalTotal,
    });
  }, [cart, finalTotal]);

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
      trackPurchase({
        productIds: cart.map((item) => item._id),
        numItems: cart.reduce((n, item) => n + item.quantity, 0),
        value: finalTotal,
      });
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

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt px-6 py-40 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-chalk text-asphalt"
        >
          <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h1 className="font-display text-4xl font-semibold uppercase leading-[1] text-chalk stretch-125 md:text-6xl">{t('orderConfirmed')}</h1>
        <p className="mt-4 max-w-lg text-smoke">{t('orderSuccessDesc')}</p>
        <Link href="/" className={`${btnPrimary} mt-10`}>
          {t('home')}
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt px-6 py-40 text-center">
        <h1 className="font-display text-4xl font-semibold uppercase leading-[1] text-chalk stretch-125 md:text-6xl">{t('emptyCart')}</h1>
        <Link href="/shop" className={`${btnPrimary} mt-10`}>
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asphalt pb-32 pt-28 text-chalk md:pt-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 md:mb-14">
          <p className={kickerLabel}>
            Cash on delivery <span className="font-ar normal-case tracking-normal">· الخلاص عند الاستلام</span>
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold uppercase leading-[0.95] stretch-125">
            Checkout
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-6 lg:col-span-7">
            <section className="rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] sm:p-8">
              <h2 className="mb-6 font-display text-lg font-semibold uppercase stretch-125">Delivery details</h2>
              <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <label key={f.name} className={`block space-y-2 ${f.name === 'address' ? 'sm:col-span-2' : ''}`}>
                    <span className={fieldLabel}>
                      {f.label} <span className="font-ar normal-case tracking-normal text-smoke">{f.ar}</span>
                    </span>
                    <input
                      required
                      type={f.type}
                      name={f.name}
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      value={formData[f.name]}
                      onChange={handleChange}
                      className={inputField}
                    />
                  </label>
                ))}
              </form>
            </section>

            <section className="flex items-center gap-5 rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] sm:p-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chalk text-asphalt">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
                  <circle cx="12" cy="12" r="2.5" />
                  <path d="M6 10v4M18 10v4" />
                </svg>
              </span>
              <div>
                <h2 className="text-base font-semibold text-chalk">
                  Pay when it arrives <span className="font-ar font-normal text-smoke">· حتى توصلك عاد خلص</span>
                </h2>
                <p className="mt-1 text-sm text-smoke">No upfront payment required.</p>
              </div>
            </section>
          </motion.div>

          {/* Summary */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] sm:p-8 lg:sticky lg:top-28 lg:col-span-5"
          >
            <h2 className="font-display text-lg font-semibold uppercase stretch-125">
              Your order <span className="font-ar text-base font-normal normal-case text-smoke">· طلبك</span>
            </h2>

            <ul className="no-scrollbar mt-6 max-h-[40vh] space-y-4 overflow-y-auto">
              {cart.map((item, index) => (
                <li key={`${item._id}-${item.selectedSize || 'default'}-${index}`} className="flex items-center gap-4">
                  <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-carbon-2 ring-1 ring-white/[0.08]">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" onError={hideBrokenImage} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-chalk">{item.name}</h3>
                    <p className="mt-0.5 text-xs text-smoke">
                      {item.price} MAD × {item.quantity}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-silver transition-colors hover:bg-white/10 hover:text-chalk"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" d="M20 12H4" /></svg>
                      </button>
                      <span className="w-5 text-center text-xs font-semibold text-chalk">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-silver transition-colors hover:bg-white/10 hover:text-chalk"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        aria-label={`Remove ${item.name}`}
                        className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-smoke transition-colors hover:bg-white/[0.06] hover:text-chalk"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-chalk">
                    {item.price * item.quantity} <span className="text-[10px] font-normal text-smoke">MAD</span>
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-white/[0.08] pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-smoke">Subtotal</dt>
                <dd className="text-chalk">{subtotal} MAD</dd>
              </div>
              {offer.amount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-xenon">
                    {DUO_LABEL} <span className="font-ar">· {DUO_LABEL_AR}</span>
                  </dt>
                  <dd className="font-semibold text-xenon">−{offer.amount} MAD</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-smoke">
                  Shipping <span className="font-ar">· التوصيل</span>
                </dt>
                <dd className="text-chalk">Free</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-silver">Total</span>
              <Plate size="lg" left={finalTotal} letter="د.م" right="MAD" aria-label={`Total: ${finalTotal} MAD`} />
            </div>

            {orderError && <p className="mt-6 text-center text-sm font-medium text-red-400">{orderError}</p>}

            <button form="checkout-form" type="submit" disabled={isSubmitting} className={`${btnPrimary} mt-8 w-full`}>
              {isSubmitting ? (
                t('processing')
              ) : (
                <>
                  Confirm order <span className="font-ar text-sm normal-case tracking-normal opacity-70">· أكمل الطلب</span>
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs text-smoke">
              Pay in cash when it arrives · <span className="font-ar">كتخلص فاش توصلك</span>
            </p>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

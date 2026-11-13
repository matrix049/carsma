'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createOrder, Customer } from '@/lib/apiServices';
import { DUO_LABEL, DUO_LABEL_AR, TRANSFER_LABEL, TRANSFER_LABEL_AR, orderPricing } from '@/lib/bundles';
import { motion } from 'framer-motion';
import { btnPrimary, btnGhostDark, fieldLabel, inputField, kickerLabel, whatsappLink } from '@/lib/uiStyles';
import { trackInitiateCheckout, trackPurchase } from '@/lib/metaPixel';
import { BANK_LOGOS, PAYMENT_TRANSFER, TransferDetails, loadTransferBanks, transferBanks, transferMessage } from '@/lib/bankTransfer';
import Plate from '@/components/Plate';
import { hideBrokenImage } from '@/components/ProductCard';
import WhatsAppIcon from '@/components/WhatsAppIcon';

type Payment = 'cod' | typeof PAYMENT_TRANSFER;

const PAYMENTS: { id: Payment; title: string; ar: string; note: string; noteAr: string }[] = [
  { id: 'cod', title: 'Cash on delivery', ar: 'الخلاص عند الاستلام', note: 'Pay in cash when it arrives.', noteAr: 'كتخلص فاش توصلك' },
  {
    id: PAYMENT_TRANSFER,
    title: 'Instant bank transfer · −10%',
    ar: 'تحويل فوري',
    note: 'Instant transfer only (virement instantané), then send us the screenshot on WhatsApp.',
    noteAr: 'غير التحويل الفوري، ومن بعد صيفط لينا السكرين ف واتساب',
  },
];

/** The banks you can transfer to: their official logo when the file is set, their name until then. */
function BankLogos({ banks, size = 'sm' }: { banks: string[]; size?: 'sm' | 'md' }) {
  const height = size === 'md' ? 'h-9' : 'h-6';
  return (
    <span className="flex flex-wrap items-center gap-2">
      {banks.map((bank) =>
        BANK_LOGOS[bank] ? (
          <span key={bank} className="inline-flex items-center rounded-md bg-white px-2 py-1">
            <img src={BANK_LOGOS[bank]} alt={bank} className={`${height} w-auto object-contain`} />
          </span>
        ) : (
          <span key={bank} className="inline-flex items-center rounded-md bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-silver ring-1 ring-white/10">
            {bank}
          </span>
        ),
      )}
    </span>
  );
}

/** After a transfer order: what to pay, where, and the WhatsApp button for the screenshot. */
function TransferSteps({ orderNumber, details }: { orderNumber?: number; details: TransferDetails }) {
  const { amount: total, reference, beneficiary, accounts } = details;
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* the text stays selectable to copy by hand */
    }
  };
  const steps = [
    { en: `Make an instant transfer (virement instantané) of ${total} MAD to one of these accounts.`, ar: `دير تحويل فوري ديال ${total} درهم لواحد من هاد الحسابات.` },
    { en: `Write ${reference} as the transfer reason (motif), so we can find your payment.`, ar: `كتب ${reference} ف سبب التحويل (motif)، باش نلقاو الخلاص ديالك.` },
    { en: 'Take a screenshot of the transfer and send it to us on WhatsApp.', ar: 'خود سكرين ديال التحويل وصيفطو لينا ف واتساب.' },
  ];

  return (
    <div className="min-h-screen bg-asphalt px-5 pb-24 pt-28 text-chalk md:pt-36">
      <div className="mx-auto max-w-2xl">
        <p className={kickerLabel}>
          Order {orderNumber ? `#${orderNumber}` : ''} received <span className="font-ar normal-case tracking-normal">· توصلنا بالطلب ديالك</span>
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.5rem)] font-semibold uppercase leading-[0.95] stretch-125">
          Pay by transfer
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Plate size="lg" left={total} letter="د.م" right="MAD" aria-label={`Amount to transfer: ${total} MAD`} />
          <span className="text-sm font-semibold text-xenon">
            10% off included <span className="font-ar">· التخفيض محسوب</span>
          </span>
        </div>

        <ol className="mt-8 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4 rounded-2xl bg-carbon p-4 ring-1 ring-white/[0.08]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chalk text-sm font-bold text-asphalt">{i + 1}</span>
              <span className="text-sm">
                {s.en}
                <span className="mt-1 block font-ar text-smoke" dir="rtl">{s.ar}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl bg-carbon p-5 ring-1 ring-white/[0.08]">
          <span className="block text-xs text-smoke">
            Beneficiary name <span className="font-ar">· سمية المستفيد</span>
          </span>
          <span className="text-lg font-semibold text-chalk">{beneficiary}</span>
          <span className="mt-1 block text-xs text-smoke">
            Save us under this name in your bank app.
            <span className="font-ar"> سجلنا بهاد السمية ف التطبيق ديال البنكة.</span>
          </span>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {accounts.map((a) => {
            const rib = a.rib.replace(/\D/g, '');
            return (
              <div key={a.bank} className="rounded-2xl bg-carbon p-5 ring-1 ring-white/[0.08]">
                <BankLogos banks={[a.bank]} size="md" />
                <p className="mt-3 text-xs text-smoke">RIB</p>
                <p className="select-all font-mono text-[15px] font-semibold tracking-wide text-chalk">{a.rib}</p>
                <button type="button" onClick={() => copy(rib)} className={`${btnGhostDark} mt-3 w-full`}>
                  {copied === rib ? 'Copied ✓ · تنسخ' : 'Copy RIB · نسخ'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-carbon p-5 ring-1 ring-xenon/40">
          <span>
            <span className="block text-xs text-smoke">
              Transfer reason (motif) <span className="font-ar">· سبب التحويل</span>
            </span>
            <span className="select-all font-mono text-lg font-semibold text-chalk">{reference}</span>
          </span>
          <button type="button" onClick={() => copy(reference)} className={btnGhostDark}>
            {copied === reference ? 'Copied ✓ · تنسخ' : 'Copy · نسخ'}
          </button>
        </div>

        <p className="mt-4 rounded-2xl bg-white/[0.03] p-4 text-xs leading-relaxed text-smoke">
          Instant transfer only (virement instantané): that&apos;s what the 10% off is for. We ship as soon as it arrives.
          <span className="mt-1 block font-ar">غير التحويل الفوري (virement instantané) اللي فيه التخفيض ديال 10%. كنصيفطو الطلب ملي يوصلنا التحويل.</span>
        </p>

        <a href={whatsappLink(transferMessage(reference, total))} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} mt-8 w-full`}>
          <WhatsAppIcon className="h-5 w-5" />
          Send the screenshot <span className="font-ar text-sm normal-case tracking-normal opacity-70">· صيفط السكرين</span>
        </a>
        <p className="mt-4 text-center text-xs text-smoke">
          Changed your mind? You can still pay cash on delivery at the full price, just tell us on WhatsApp.
          <span className="mt-1 block font-ar">بدلتي رأيك؟ تقدر تخلص عند الاستلام بالثمن الكامل، غير قولها لينا ف واتساب.</span>
        </p>
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-silver underline underline-offset-4 hover:text-chalk">{`Back home · الرئيسية`}</Link>
        </div>
      </div>
    </div>
  );
}

const FIELDS = [
  { name: 'firstName', label: 'Full name', ar: 'الاسم الكامل', type: 'text', placeholder: 'Khalid Alami', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', ar: 'رقم الهاتف', type: 'tel', placeholder: '06XXXXXXXX', autoComplete: 'tel' },
  { name: 'address', label: 'Address', ar: 'العنوان', type: 'text', placeholder: "Boulevard de l'Aviation, Building 4, Apt 12", autoComplete: 'street-address' },
  { name: 'city', label: 'City', ar: 'المدينة', type: 'text', placeholder: 'Casablanca', autoComplete: 'address-level2' },
] as const;

export default function CheckoutPage() {
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ orderNumber?: number; transfer?: TransferDetails } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment>('cod');
  // Banks open for transfer, from the server (names only); empty = cash on delivery only.
  const [banks, setBanks] = useState<string[]>(transferBanks());
  useEffect(() => {
    loadTransferBanks().then(setBanks);
  }, []);
  const transferOn = banks.length > 0;

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

  // The 3D duo offer, and 10% off for an instant transfer, come off here; the server works it out again.
  const pricing = orderPricing(cart, transferOn ? payment : 'cod');
  const subtotal = Math.round(pricing.subtotal);
  const finalTotal = Math.round(pricing.total);

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
        paymentMethod: transferOn ? payment : 'cod'
      };
      const created = await createOrder(orderData);
      trackPurchase({
        productIds: cart.map((item) => item._id),
        numItems: cart.reduce((n, item) => n + item.quantity, 0),
        value: finalTotal,
      });
      setPlaced({ orderNumber: created.orderNumber, transfer: created.transfer });
      clearCart();
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setOrderError(err.message || t('orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placed?.transfer) {
    return <TransferSteps orderNumber={placed.orderNumber} details={placed.transfer} />;
  }

  if (placed) {
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
            {transferOn ? (
              <>
                Cash on delivery or bank transfer <span className="font-ar normal-case tracking-normal">· عند الاستلام ولا بالتحويل</span>
              </>
            ) : (
              <>
                Cash on delivery <span className="font-ar normal-case tracking-normal">· الخلاص عند الاستلام</span>
              </>
            )}
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

            {transferOn ? (
              <fieldset className="rounded-3xl bg-carbon p-6 ring-1 ring-white/[0.08] sm:p-8">
                <legend className="sr-only">Payment · الخلاص</legend>
                <h2 className="mb-5 font-display text-lg font-semibold uppercase stretch-125">
                  Payment <span className="font-ar text-base font-normal normal-case text-smoke">· كيفاش غادي تخلص</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENTS.map((p) => (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer gap-3 rounded-2xl p-4 ring-1 transition-colors ${
                        payment === p.id ? 'bg-white/[0.06] ring-2 ring-xenon' : 'ring-white/[0.08] hover:bg-white/[0.03]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={p.id}
                        checked={payment === p.id}
                        onChange={() => setPayment(p.id)}
                        className="mt-1 h-4 w-4 accent-[#2563EB]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-chalk">
                          {p.title} <span className="font-ar font-normal text-smoke">· {p.ar}</span>
                        </span>
                        <span className="mt-1 block text-xs text-smoke">{p.note}</span>
                        <span className="mt-0.5 block font-ar text-xs text-smoke">{p.noteAr}</span>
                        {p.id === PAYMENT_TRANSFER && (
                          <span className="mt-2.5 block">
                            <BankLogos banks={banks} />
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
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
            )}
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
              {pricing.duo > 0 && (
                <div className="flex justify-between">
                  <dt className="text-xenon">
                    {DUO_LABEL} <span className="font-ar">· {DUO_LABEL_AR}</span>
                  </dt>
                  <dd className="font-semibold text-xenon">−{pricing.duo} MAD</dd>
                </div>
              )}
              {pricing.transfer > 0 && (
                <div className="flex justify-between">
                  <dt className="text-xenon">
                    {TRANSFER_LABEL} <span className="font-ar">· {TRANSFER_LABEL_AR}</span>
                  </dt>
                  <dd className="font-semibold text-xenon">−{pricing.transfer} MAD</dd>
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
              {payment === PAYMENT_TRANSFER && transferOn ? (
                <>
                  Next: the bank details to transfer to · <span className="font-ar">من بعد غادي تبان ليك معلومات الحساب</span>
                </>
              ) : (
                <>
                  Pay in cash when it arrives · <span className="font-ar">كتخلص فاش توصلك</span>
                </>
              )}
            </p>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

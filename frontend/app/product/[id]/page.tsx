'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, peekProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AnalyticsService from '@/lib/analyticsService';
import { trackViewContent } from '@/lib/metaPixel';
import { btnPrimary, btnGhostDark, whatsappLink } from '@/lib/uiStyles';
import ProductCard, { hideBrokenImage } from '@/components/ProductCard';
import WheelLoader from '@/components/WheelLoader';
import Plate from '@/components/Plate';
import { isNewEdition } from '@/lib/newEditions';
import { getPinnedIndex } from '@/lib/pinnedProducts';
import { dimensionsOf, parseDimensions } from '@/lib/dimensions';

/** Width of wall shown in the "on your wall" mockup, in cm. */
const WALL_WIDTH_CM = 340;
/** Width of the sofa drawn under the artwork, in cm. */
const SOFA_WIDTH_CM = 210;

/** In-stock products, same brand first. */
function relatedFor(products: Product[], current: Product): Product[] {
  const others = products.filter((p) => p._id !== current._id && p.inStock);
  const sameCategory = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...sameCategory, ...rest].slice(0, 4);
}

function Sofa() {
  return (
    <svg viewBox="0 0 210 70" className="w-full" aria-hidden="true">
      <g fill="#2A2A31">
        <rect x="8" y="6" width="194" height="34" rx="6" />
        <rect x="0" y="26" width="22" height="34" rx="6" />
        <rect x="188" y="26" width="22" height="34" rx="6" />
        <rect x="16" y="34" width="178" height="22" rx="4" fill="#33333B" />
      </g>
      <g fill="#1B1B20">
        <rect x="18" y="58" width="4" height="10" />
        <rect x="188" y="58" width="4" height="10" />
      </g>
    </svg>
  );
}

function SpecTile({ label, labelAr, value, accent }: { label: string; labelAr: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-3.5 ring-1 ${accent ? 'bg-redline/10 ring-redline/40' : 'bg-carbon ring-white/10'}`}>
      <p className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-smoke">
        {label}
        <span className="font-ar text-xs normal-case tracking-normal">{labelAr}</span>
      </p>
      <p className="mt-1.5 font-display text-[15px] font-extrabold uppercase leading-tight text-chalk stretch-125 sm:text-base">{value}</p>
    </div>
  );
}

function Details({ title, titleAr, children }: { title: string; titleAr: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-white/10">
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-sm font-extrabold uppercase tracking-[0.06em] text-chalk stretch-125">
          {title} <span className="ms-2 font-ar text-sm font-semibold normal-case tracking-normal text-smoke">{titleAr}</span>
        </span>
        <span aria-hidden="true" className="font-mono text-xl text-redline-hot transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-5 text-[15px] leading-relaxed text-smoke">{children}</div>
    </details>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  // Coming from a card, the product is already in memory: render instantly
  // (that's what lets the card image morph into the hero), then refresh.
  const [cached] = useState(() => {
    const list = peekProducts();
    const found = list?.find((p) => p._id === id) ?? null;
    return { product: found, related: list && found ? relatedFor(list, found) : [] };
  });
  const [product, setProduct] = useState<Product | null>(cached.product);
  const [related, setRelated] = useState<Product[]>(cached.related);
  const [isLoading, setIsLoading] = useState(!cached.product);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'showroom' | 'wall'>('showroom');
  const [quantity, setQuantity] = useState<number>(1);
  const trackedRef = useRef<string | null>(null);

  const dimensionsLabel = dimensionsOf(product);
  // Keep the same `standardSize` shape downstream code consumes — the
  // `id` is just an internal sku-like marker for the cart.
  const standardSize = { id: 'M', label: dimensionsLabel };
  const unitPrice = product ? product.price : 0;
  const totalPrice = unitPrice * quantity;
  const dims = parseDimensions(dimensionsLabel) ?? { w: 120, h: 35 };

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((products) => {
        if (!active) return;
        const found = products.find((p) => p._id === id);
        if (found) {
          setProduct(found);
          setRelated(relatedFor(products, found));
          setError(null);
        } else {
          setProduct(null);
          setError('Product not found');
        }
      })
      .catch((err: any) => {
        if (active) setError(err.message || 'Failed to load product');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Track each product view once (a cached render followed by the refresh
  // is still one view).
  useEffect(() => {
    if (!product || trackedRef.current === product._id) return;
    trackedRef.current = product._id;
    AnalyticsService.trackProductView(product._id).catch((err: unknown) => {
      // Analytics failures should not affect user experience
      console.warn('Product view tracking failed:', err);
    });
    trackViewContent({
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
    });
  }, [product]);

  if (!product && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <WheelLoader size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt px-6 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot">Wrong turn</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-none text-chalk stretch-125">
          {error === 'Product not found' || !error ? 'No car here' : error}
        </h1>
        <p className="mt-3 font-ar text-lg text-smoke">هاد الطوموبيل ماكايناش</p>
        <Link href="/shop" className={`${btnPrimary} mt-10`}>
          {t('backToArtworks')}
        </Link>
      </div>
    );
  }

  const addAll = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, price: unitPrice }, standardSize.id, standardSize.label);
    }
  };

  const buyNow = () => {
    addAll();
    router.push('/checkout');
  };

  const whatsappOrder = whatsappLink(
    `Salam L7it, bghit ncommandi:\n${product.name} (${dimensionsLabel}) x${quantity} — ${totalPrice} MAD\n${
      typeof window !== 'undefined' ? window.location.href : ''
    }`,
  );

  const description =
    product.description?.trim() ||
    `${product.name} — automotive wall art, UV-printed on 3 mm Alucobond aluminium composite. Hand-finished in Rabat, pre-drilled and ready to mount.`;

  const isNew = isNewEdition(product.name);
  const pin = getPinnedIndex(product.name);

  return (
    <div className="bg-asphalt pb-28 md:pb-0">
      <div className="mx-auto max-w-[1440px] px-5 pt-28 sm:px-6 md:pt-36 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-smoke md:mb-10">
          <Link href="/" className="hover:text-chalk">{t('home')}</Link>
          <span aria-hidden="true" className="text-redline">/</span>
          <Link href="/shop" className="hover:text-chalk">{t('shop')}</Link>
          <span aria-hidden="true" className="text-redline">/</span>
          <span className="text-chalk">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ── Showroom ───────────────────────────────────────────── */}
          <div className="min-w-0 lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-carbon-2 ring-1 ring-white/10">
                <AnimatePresence mode="wait" initial={false}>
                  {view === 'showroom' ? (
                    <motion.div
                      key="showroom"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      {product.image && (
                        <img
                          key={product._id}
                          data-vt-hero
                          src={product.image}
                          alt={product.name}
                          style={{ viewTransitionName: 'car-hero' } as React.CSSProperties}
                          className="h-full w-full object-cover"
                          onError={hideBrokenImage}
                        />
                      )}
                      {/* showroom spotlight */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,255,255,0.10),transparent_60%),radial-gradient(ellipse_at_center,transparent_55%,rgba(10,10,11,0.55)_100%)]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="wall"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_18%,rgba(255,190,130,0.16),transparent_70%),linear-gradient(#1D1D22,#151518)]"
                    >
                      {/* floor */}
                      <div className="absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-b from-[#121214] to-[#0B0B0D]" />
                      {/* sofa, sized against the wall width */}
                      <div
                        className="absolute bottom-[13%] left-1/2 -translate-x-1/2"
                        style={{ width: `${(SOFA_WIDTH_CM / WALL_WIDTH_CM) * 100}%` }}
                      >
                        <Sofa />
                      </div>
                      {/* artwork at true scale relative to the sofa */}
                      <div
                        className="absolute left-1/2 top-[24%] -translate-x-1/2"
                        style={{ width: `${(dims.w / WALL_WIDTH_CM) * 100}%` }}
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={`${product.name} on a wall`}
                            className="w-full object-contain shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
                            onError={hideBrokenImage}
                          />
                        )}
                        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                          <span className="h-px flex-1 bg-smoke/60" />
                          {dims.w} cm
                          <span className="h-px flex-1 bg-smoke/60" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                  {pin >= 0 && (
                    <span className="rounded-sm bg-timing-purple px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_14px_rgba(176,75,255,0.55)]">
                      P{pin + 1} · Most wanted
                    </span>
                  )}
                  {isNew && (
                    <span className="rounded-sm bg-volt px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-asphalt">
                      New drop · 3D
                    </span>
                  )}
                </div>
              </div>

              {/* Showroom-floor reflection */}
              {view === 'showroom' && product.image && (
                <div aria-hidden="true" className="pointer-events-none relative hidden h-20 overflow-hidden rounded-b-2xl opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)] md:block">
                  <img src={product.image} alt="" className="h-[600%] w-full -scale-y-100 object-cover object-bottom blur-[2px]" />
                </div>
              )}

              {/* View toggle */}
              <div className="mt-4 inline-flex rounded-md bg-carbon p-1 ring-1 ring-white/10" role="tablist" aria-label="Preview">
                {([
                  ['showroom', 'Showroom', 'العرض'],
                  ['wall', 'On your wall', 'فالحيط'],
                ] as const).map(([key, label, ar]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={view === key}
                    onClick={() => setView(key)}
                    className={`min-h-[40px] rounded px-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                      view === key ? 'bg-redline text-white' : 'text-smoke hover:text-chalk'
                    }`}
                  >
                    {label} <span className="font-ar text-xs normal-case tracking-normal opacity-80">· {ar}</span>
                  </button>
                ))}
              </div>
              {view === 'wall' && (
                <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                  Shown to scale above a {SOFA_WIDTH_CM} cm sofa
                </p>
              )}
            </div>
          </div>

          {/* ── Spec sheet ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 lg:col-span-5"
          >
            <p className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot">
              <span className="h-[2px] w-8 bg-redline" />
              {product.category}
            </p>
            <h1 className="mt-3 break-words font-display text-[clamp(2.6rem,6vw,4.75rem)] font-black uppercase leading-[0.88] text-chalk stretch-125">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Plate size="lg" left={unitPrice} letter="د.م" right="MAD" aria-label={`${unitPrice} MAD`} />
              <span className="font-mono text-lg font-bold text-smoke line-through">{Math.ceil(product.price * 1.2)} MAD</span>
            </div>
            <p className="mt-3 text-sm text-smoke">
              Pay cash on delivery · <span className="font-ar">الخلاص عند الاستلام</span>
            </p>

            <p className="mt-6 text-[15px] leading-relaxed text-chalk/85 md:text-base">{description}</p>

            {/* Telemetry-style spec sheet */}
            <div className="mt-7 grid grid-cols-2 gap-2.5">
              <SpecTile label="Size" labelAr="القياس" value={dimensionsLabel} accent />
              <SpecTile label="Material" labelAr="المادة" value="Alucobond 3 mm" />
              <SpecTile label="Finish" labelAr="الطباعة" value="UV matte" />
              <SpecTile label="Mount" labelAr="التعليق" value="Pre-drilled" />
              <SpecTile label="Delivery" labelAr="التوصيل" value="24h – 3 days" />
              <SpecTile label="Payment" labelAr="الخلاص" value="Cash on delivery" />
            </div>
            <p className="mt-2.5 text-xs text-smoke">120 × 50 cm or a custom size? Message us before ordering.</p>

            {/* Quantity — paddle shifters */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-16 w-14 flex-col items-center justify-center rounded-l-[28px] rounded-r-md bg-carbon-2 text-chalk ring-1 ring-white/10 transition-colors hover:bg-carbon-3 active:bg-redline disabled:opacity-30 disabled:hover:bg-carbon-2"
                >
                  <span className="text-2xl leading-none">−</span>
                  <span className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-smoke">Down</span>
                </button>
                <div className="flex h-16 min-w-[5.5rem] flex-col items-center justify-center rounded-lg bg-black px-3 ring-1 ring-white/10 shadow-[inset_0_0_24px_rgba(229,32,12,0.18)]">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-smoke">Qty</span>
                  <span aria-live="polite" className="font-display text-4xl font-black leading-none text-redline-hot tabular-nums stretch-75">
                    {quantity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-16 w-14 flex-col items-center justify-center rounded-l-md rounded-r-[28px] bg-carbon-2 text-chalk ring-1 ring-white/10 transition-colors hover:bg-carbon-3 active:bg-redline"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-smoke">Up</span>
                </button>
              </div>
              {quantity > 1 && (
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-smoke">
                  Total <span className="font-display text-xl font-black text-chalk">{totalPrice} MAD</span>
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6 space-y-3">
              <button onClick={buyNow} disabled={!product.inStock} className={`${btnPrimary} w-full`}>
                {product.inStock ? (
                  <>
                    Buy now <span className="font-ar text-sm normal-case tracking-normal opacity-90">· شري دابا</span>
                  </>
                ) : (
                  t('unavailable')
                )}
              </button>
              <button onClick={addAll} disabled={!product.inStock} className={`${btnGhostDark} w-full`}>
                {t('addToCart')} <span className="font-ar text-sm normal-case tracking-normal opacity-80">· زيد للسلة</span>
              </button>
              <a
                href={whatsappOrder}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#2BD96B] hover:underline hover:underline-offset-4"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2a9.9 9.9 0 00-8.5 15l-1.4 5 5.1-1.3A9.9 9.9 0 1012.04 2zm5.8 14.1c-.25.7-1.45 1.33-2 1.4-.52.08-1.17.11-1.88-.12a17 17 0 01-1.7-.63c-2.98-1.29-4.93-4.3-5.08-4.5-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.2.07.15.12.33.02.53-.1.2-.15.32-.3.5l-.44.52c-.15.15-.3.3-.13.6.17.3.77 1.27 1.66 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.42z" />
                </svg>
                Order on WhatsApp <span className="font-ar text-sm normal-case tracking-normal">· طلب فالواتساب</span>
              </a>
            </div>

            <div className="mt-4">
              <Details title="Delivery & payment" titleAr="التوصيل والخلاص">
                Delivered in 24 hours to 3 days anywhere in Morocco, with a tracking number once it ships. You pay cash when the piece arrives.
              </Details>
              <Details title="Hanging & care" titleAr="التعليق والعناية">
                The panel comes pre-drilled — bolt it straight to the wall, no frame needed. Keep it away from direct sun and moisture and wipe with a soft, dry cloth.
              </Details>
              <Details title="Returns" titleAr="الإرجاع">
                Every piece is printed for your order, so we can&apos;t accept returns. Message us on WhatsApp with any question before ordering.
              </Details>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-white/10 py-20 md:mt-32">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot">
                  <span className="h-[2px] w-8 bg-redline" />
                  You may also like
                </p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-chalk stretch-125 md:text-6xl">
                  More from the grid
                </h2>
                <p className="mt-2 font-ar text-lg text-smoke">حتى هادو غادي يعجبوك</p>
              </div>
              <Link href="/shop" className="hidden font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-chalk underline decoration-redline decoration-2 underline-offset-[6px] hover:text-redline-hot sm:block">
                All cars
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar */}
      {product.inStock && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-asphalt/90 px-4 pt-3 backdrop-blur-xl md:hidden"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-extrabold uppercase text-chalk stretch-125">{product.name}</p>
              <p className="font-display text-lg font-black leading-tight text-chalk">
                {totalPrice} <span className="font-mono text-[10px] font-bold text-smoke">MAD</span>
              </p>
            </div>
            <button onClick={buyNow} className="chamfer-sm min-h-[48px] bg-redline px-5 font-display text-[12px] font-black uppercase tracking-[0.12em] text-white stretch-125 active:bg-redline-hot">
              Buy now <span className="font-ar text-sm normal-case tracking-normal">· شري</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

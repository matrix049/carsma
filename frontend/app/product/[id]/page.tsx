'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AnalyticsService from '@/lib/analyticsService';
import { trackViewContent } from '@/lib/metaPixel';
import { btnDark, btnGhostLight, whatsappLink } from '@/lib/uiStyles';
import ProductCard, { hideBrokenImage } from '@/components/ProductCard';
import WheelLoader from '@/components/WheelLoader';
import { isNewEdition } from '@/lib/newEditions';

// Dimensions come from the product itself, set per-product by admins in
// /admin/products. Falls back to the catalogue standard for legacy products.
const DEFAULT_DIMENSIONS = '120cm x 35cm';

/** Width of wall shown in the "on the wall" mockup, in cm. */
const WALL_WIDTH_CM = 340;
/** Width of the sofa drawn under the artwork, in cm. */
const SOFA_WIDTH_CM = 210;

/** "120cm x 35cm" → { w: 120, h: 35 } (null when the string can't be parsed). */
function parseDimensions(label: string): { w: number; h: number } | null {
  const m = label.match(/(\d+(?:[.,]\d+)?)\s*(?:cm)?\s*[x×*]\s*(\d+(?:[.,]\d+)?)/i);
  if (!m) return null;
  return { w: parseFloat(m[1].replace(',', '.')), h: parseFloat(m[2].replace(',', '.')) };
}

function Sofa() {
  return (
    <svg viewBox="0 0 210 70" className="w-full" aria-hidden="true">
      <g fill="#CFC4B1">
        <rect x="8" y="6" width="194" height="34" rx="6" />
        <rect x="0" y="26" width="22" height="34" rx="6" />
        <rect x="188" y="26" width="22" height="34" rx="6" />
        <rect x="16" y="34" width="178" height="22" rx="4" fill="#C3B7A2" />
      </g>
      <g fill="#A89A82">
        <rect x="18" y="58" width="4" height="10" />
        <rect x="188" y="58" width="4" height="10" />
      </g>
    </svg>
  );
}

function SpecRow({ label, labelAr, value, note }: { label: string; labelAr: string; value: string; note?: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line py-4 sm:grid-cols-[9rem_1fr]">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">
        {label}
        <span className="mt-0.5 block font-ar text-sm normal-case tracking-normal">{labelAr}</span>
      </dt>
      <dd>
        <p className="text-[15px] font-medium text-ink">{value}</p>
        {note && <p className="mt-1 text-sm text-stone">{note}</p>}
      </dd>
    </div>
  );
}

function Details({ title, titleAr, children }: { title: string; titleAr: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">
          {title} <span className="ms-2 font-ar text-sm normal-case tracking-normal text-stone">{titleAr}</span>
        </span>
        <span className="text-xl font-light text-stone transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-6 text-[15px] leading-relaxed text-stone">{children}</div>
    </details>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'art' | 'wall'>('art');
  const [quantity, setQuantity] = useState<number>(1);

  const dimensionsLabel = (product?.dimensions || '').trim() || DEFAULT_DIMENSIONS;
  // Keep the same `standardSize` shape downstream code consumes — the
  // `id` is just an internal sku-like marker for the cart.
  const standardSize = { id: 'M', label: dimensionsLabel };
  const unitPrice = product ? product.price : 0;
  const totalPrice = unitPrice * quantity;
  const dims = parseDimensions(dimensionsLabel) ?? { w: 120, h: 35 };

  useEffect(() => {
    async function loadProduct() {
      try {
        const products = await fetchProducts();
        const found = products.find((p) => p._id === id);
        if (found) {
          setProduct(found);
          const others = products.filter((p) => p._id !== found._id && p.inStock);
          const sameCategory = others.filter((p) => p.category === found.category);
          const rest = others.filter((p) => p.category !== found.category);
          setRelated([...sameCategory, ...rest].slice(0, 4));
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  // Track product view when product loads successfully
  useEffect(() => {
    if (product && !isLoading && !error) {
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
    }
  }, [product, isLoading, error]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <WheelLoader size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
        <h1 className="font-display text-5xl font-medium text-ink">{error || 'Product not found'}</h1>
        <Link href="/shop" className={`${btnGhostLight} mt-10`}>
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

  return (
    <div className="bg-ivory pb-28 md:pb-0">
      <div className="container mx-auto max-w-7xl px-5 pt-28 md:pt-36 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-stone md:mb-10">
          <Link href="/" className="hover:text-ink">{t('home')}</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink">{t('shop')}</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* ── Visual ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-square overflow-hidden ring-1 ring-line sm:aspect-[4/3]">
                <AnimatePresence mode="wait" initial={false}>
                  {view === 'art' ? (
                    <motion.div
                      key="art"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-paper"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={hideBrokenImage}
                        />
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="wall"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="wall-light absolute inset-0"
                    >
                      {/* floor */}
                      <div className="absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-b from-[#DCD2C1] to-[#CFC4B1]" />
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
                            className="w-full object-contain drop-shadow-[0_14px_14px_rgba(22,19,15,0.25)]"
                            onError={hideBrokenImage}
                          />
                        )}
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-stone">
                          <span className="h-px flex-1 bg-stone/50" />
                          {dims.w} cm
                          <span className="h-px flex-1 bg-stone/50" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isNew && (
                  <span className="absolute left-4 top-4 z-10 bg-ivory px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink">
                    New 3D edition
                  </span>
                )}
              </div>

              {/* View toggle */}
              <div className="mt-4 inline-flex rounded-sm border border-line bg-paper p-1" role="tablist">
                {([
                  ['art', 'Artwork', 'اللوحة'],
                  ['wall', 'On the wall', 'فالحيط'],
                ] as const).map(([key, label, ar]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={view === key}
                    onClick={() => setView(key)}
                    className={`rounded-sm px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      view === key ? 'bg-ink text-ivory' : 'text-stone hover:text-ink'
                    }`}
                  >
                    {label} <span className="font-ar text-xs normal-case tracking-normal opacity-80">· {ar}</span>
                  </button>
                ))}
              </div>
              {view === 'wall' && (
                <p className="mt-2 text-xs text-stone">
                  Shown to scale above a {SOFA_WIDTH_CM} cm sofa.
                </p>
              )}
            </div>
          </div>

          {/* ── Info ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brass">{product.category}</p>
            <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.25rem)] font-medium leading-[1] tracking-tight text-ink">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-ink">
                {unitPrice} <span className="text-base font-medium text-stone">MAD</span>
              </span>
              <span className="text-lg text-stone line-through">{Math.ceil(product.price * 1.2)} MAD</span>
            </div>
            <p className="mt-1 text-sm text-stone">
              Pay cash on delivery · <span className="font-ar">الخلاص عند الاستلام</span>
            </p>

            <p className="mt-7 text-[15px] leading-relaxed text-ink/80 md:text-base">{description}</p>

            <dl className="mt-8 border-t border-line">
              <SpecRow
                label="Size"
                labelAr="القياس"
                value={dimensionsLabel}
                note="120 × 50 cm or a custom size? Message us before ordering."
              />
              <SpecRow label="Material" labelAr="المادة" value="Alucobond, 3 mm aluminium composite" note="Light, rigid, weather-resistant." />
              <SpecRow label="Finish" labelAr="الفينيسيون" value="UV-printed · Matte · Pre-drilled" note="Ready to hang, no frame needed." />
            </dl>

            {/* Quantity + total */}
            <div className="mt-8 flex items-center justify-between">
              <div className="inline-flex items-center rounded-sm border border-line bg-paper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center text-xl text-ink hover:bg-wall disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2.5rem] text-center text-base font-medium text-ink" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-12 w-12 items-center justify-center text-xl text-ink hover:bg-wall"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {quantity > 1 && (
                <p className="text-sm text-stone">
                  Total <span className="font-semibold text-ink">{totalPrice} MAD</span>
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6 space-y-3">
              <button onClick={buyNow} disabled={!product.inStock} className={`${btnDark} w-full`}>
                {product.inStock ? (
                  <>
                    Buy now <span className="font-ar text-sm normal-case tracking-normal opacity-80">· شري دابا</span>
                  </>
                ) : (
                  t('unavailable')
                )}
              </button>
              <button onClick={addAll} disabled={!product.inStock} className={`${btnGhostLight} w-full`}>
                {t('addToCart')} <span className="font-ar text-sm normal-case tracking-normal opacity-80">· زيد للسلة</span>
              </button>
              <a
                href={whatsappOrder}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#128C4B] hover:underline hover:underline-offset-4"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2a9.9 9.9 0 00-8.5 15l-1.4 5 5.1-1.3A9.9 9.9 0 1012.04 2zm5.8 14.1c-.25.7-1.45 1.33-2 1.4-.52.08-1.17.11-1.88-.12a17 17 0 01-1.7-.63c-2.98-1.29-4.93-4.3-5.08-4.5-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.2.07.15.12.33.02.53-.1.2-.15.32-.3.5l-.44.52c-.15.15-.3.3-.13.6.17.3.77 1.27 1.66 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.42z" />
                </svg>
                Order on WhatsApp <span className="font-ar text-sm normal-case tracking-normal">· طلب فالواتساب</span>
              </a>
            </div>

            {/* Assurance */}
            <ul className="mt-6 grid grid-cols-3 gap-2 border-y border-line py-5 text-center">
              {[
                ['Cash on delivery', 'الخلاص فالدار'],
                ['24h – 3 days', 'التوصيل لكاع المغرب'],
                ['Made in Rabat', 'صنع فالمغرب'],
              ].map(([en, ar]) => (
                <li key={en} className="px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink sm:text-[11px]">{en}</p>
                  <p className="mt-0.5 font-ar text-xs text-stone sm:text-sm">{ar}</p>
                </li>
              ))}
            </ul>

            <div className="mt-2">
              <Details title="Delivery & payment" titleAr="التوصيل والخلاص">
                Delivered in 24 hours to 3 days anywhere in Morocco, with a tracking number once it ships. You pay cash when the piece arrives.
              </Details>
              <Details title="Hanging & care" titleAr="التعليق والعناية">
                The panel comes pre-drilled — bolt it straight to the wall. Keep it away from direct sun and moisture and wipe with a soft, dry cloth.
              </Details>
              <Details title="Returns" titleAr="الإرجاع">
                Every piece is printed for your order, so we can&apos;t accept returns. Message us on WhatsApp with any question before ordering.
              </Details>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-line py-20 md:mt-32">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brass">You may also like</p>
                <h2 className="mt-2 font-display text-4xl font-medium text-ink md:text-5xl">More from the gallery</h2>
                <p className="mt-1 font-ar text-lg text-stone">حتى هادو غادي يعجبوك</p>
              </div>
              <Link href="/shop" className="hidden text-[12px] font-semibold uppercase tracking-[0.16em] text-ink underline decoration-brass-light underline-offset-[6px] hover:text-brass sm:block">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar */}
      {product.inStock && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 px-4 py-3 backdrop-blur-xl md:hidden"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-medium leading-tight text-ink">{product.name}</p>
              <p className="text-sm font-semibold text-ink">
                {totalPrice} <span className="text-xs font-medium text-stone">MAD</span>
              </p>
            </div>
            <button onClick={buyNow} className="rounded-sm bg-ink px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ivory">
              Buy now <span className="font-ar text-sm normal-case tracking-normal">· شري</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

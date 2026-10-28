'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchProducts, peekProducts, Product } from '@/lib/apiServices';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackViewContent } from '@/lib/metaPixel';
import { btnPrimary, btnGhostDark, kickerLabel, whatsappLink } from '@/lib/uiStyles';
import ProductCard, { hideBrokenImage } from '@/components/ProductCard';
import Plate from '@/components/Plate';
import BrandLogo from '@/components/BrandLogo';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { editionOf, isNewEdition, twoDVersionOf } from '@/lib/newEditions';
import { isAvailable, piecesLeft } from '@/lib/stock';
import { getPinnedIndex } from '@/lib/pinnedProducts';
import { dimensionsOf } from '@/lib/dimensions';
import { brandOf } from '@/lib/brands';

/** In-stock products, same brand first. */
function relatedFor(products: Product[], current: Product): Product[] {
  const others = products.filter((p) => p._id !== current._id && p.inStock);
  const sameCategory = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...sameCategory, ...rest].slice(0, 4);
}

function SpecTile({ label, labelAr, value }: { label: string; labelAr: string; value: string }) {
  return (
    <div className="rounded-2xl bg-carbon p-4 ring-1 ring-white/[0.08]">
      <p className="flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-smoke">
        {label}
        <span className="font-ar text-xs normal-case tracking-normal">{labelAr}</span>
      </p>
      <p className="mt-1.5 text-[15px] font-semibold text-chalk">{value}</p>
    </div>
  );
}

function Details({ title, titleAr, children }: { title: string; titleAr: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-white/[0.08]">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-chalk">
          {title} <span className="ms-2 font-ar text-sm font-normal text-smoke">{titleAr}</span>
        </span>
        <svg aria-hidden="true" className="h-4 w-4 text-silver transition-transform duration-300 group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </summary>
      <div className="pb-5 text-[15px] leading-relaxed text-smoke">{children}</div>
    </details>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-5 pt-28 sm:px-6 md:pt-36 lg:grid-cols-12 lg:gap-14 lg:px-10">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-carbon ring-1 ring-white/[0.06] lg:col-span-7">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>
      <div className="space-y-4 lg:col-span-5">
        <div className="h-4 w-28 rounded-full bg-carbon-2" />
        <div className="h-12 w-4/5 rounded-xl bg-carbon-2" />
        <div className="h-10 w-48 rounded-lg bg-carbon-2" />
        <div className="h-24 w-full rounded-2xl bg-carbon" />
      </div>
    </div>
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
    return {
      product: found,
      related: list && found ? relatedFor(list, found) : [],
      twoD: list && found ? twoDVersionOf(list, found.name) : undefined,
    };
  });
  const [product, setProduct] = useState<Product | null>(cached.product);
  const [related, setRelated] = useState<Product[]>(cached.related);
  // For a 3D edition: the 2D version of the same car, offered as a lighter-budget option.
  const [twoD, setTwoD] = useState<Product | undefined>(cached.twoD);
  const [isLoading, setIsLoading] = useState(!cached.product);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  // Which photo is shown — tied to the product so a new product starts on its main photo.
  const [photoState, setPhotoState] = useState<{ id: string; index: number }>({ id, index: 0 });
  const touchX = useRef<number | null>(null);
  const trackedRef = useRef<string | null>(null);

  const dimensionsLabel = dimensionsOf(product);
  // Keep the same `standardSize` shape downstream code consumes — the
  // `id` is just an internal sku-like marker for the cart.
  const standardSize = { id: 'M', label: dimensionsLabel };
  const unitPrice = product ? product.price : 0;
  const totalPrice = unitPrice * quantity;

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((products) => {
        if (!active) return;
        const found = products.find((p) => p._id === id);
        if (found) {
          setProduct(found);
          setRelated(relatedFor(products, found));
          setTwoD(twoDVersionOf(products, found.name));
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

  // Meta pixel: each product view once (a cached render followed by the
  // refresh is still one view). Our own view count comes from SiteTracker.
  useEffect(() => {
    if (!product || trackedRef.current === product._id) return;
    trackedRef.current = product._id;
    trackViewContent({
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
    });
  }, [product]);

  if (!product && isLoading) {
    return (
      <div className="min-h-screen bg-asphalt">
        <ProductSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt px-6 text-center">
        <p className={kickerLabel}>Wrong turn</p>
        <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-none text-chalk stretch-125 sm:text-5xl">
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
    addToCart({ ...product, price: unitPrice }, standardSize.id, standardSize.label, quantity);
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
    `${product.name} — automotive wall art, UV-printed on 3 mm Alucobond aluminium composite. Hand-finished in Salé, pre-drilled and ready to mount.`;

  const isNew = isNewEdition(product.name);
  const edition = editionOf(product.name);
  const available = isAvailable(product);
  const left = piecesLeft(product);
  const photos = [product.image, ...(product.gallery ?? [])].filter(Boolean);
  const photo = photoState.id === product._id ? Math.min(photoState.index, photos.length - 1) : 0;
  const showPhoto = (index: number) => setPhotoState({ id: product._id, index: (index + photos.length) % photos.length });
  const pin = getPinnedIndex(product.name);
  const brand = brandOf(product);

  return (
    <div className="bg-asphalt pb-28 md:pb-0">
      <div className="mx-auto max-w-[1440px] px-5 pt-24 sm:px-6 md:pt-32 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-smoke md:mb-10">
          <Link href="/" className="hover:text-chalk">{t('home')}</Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="hover:text-chalk">{t('shop')}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-silver">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ── Showroom ───────────────────────────────────────────── */}
          <div className="min-w-0 lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <div
                className="group/photos relative aspect-[4/3] overflow-hidden rounded-3xl bg-carbon-2 ring-1 ring-white/[0.08]"
                onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (touchX.current === null || photos.length < 2) return;
                  const dx = e.changedTouches[0].clientX - touchX.current;
                  touchX.current = null;
                  if (Math.abs(dx) > 40) showPhoto(photo + (dx < 0 ? 1 : -1));
                }}
              >
                {photos[photo] && (
                  <img
                    key={`${product._id}-${photo}`}
                    // Only the main photo takes part in the card → page morph.
                    {...(photo === 0 ? { 'data-vt-hero': true, style: { viewTransitionName: 'car-hero' } as React.CSSProperties } : {})}
                    src={photos[photo]}
                    alt={photo === 0 ? product.name : `${product.name} — photo ${photo + 1}`}
                    className="h-full w-full object-cover"
                    onError={hideBrokenImage}
                  />
                )}
                {/* showroom spotlight */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_center,transparent_55%,rgba(10,10,11,0.5)_100%)]" />

                {/* Brand emblem, like the badge on a showroom wall */}
                {brand && photo === 0 && (
                  <span className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-chalk ring-1 ring-white/15 backdrop-blur-md sm:right-4 sm:top-4 sm:h-14 sm:w-14">
                    <BrandLogo brand={brand} labelled className="h-6 w-6 sm:h-7 sm:w-7" />
                  </span>
                )}

                {(isNew || pin >= 0) && photo === 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-chalk px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-asphalt sm:left-4 sm:top-4">
                    {isNew ? 'New · 3D' : 'Most wanted'}
                  </span>
                )}

                {photos.length > 1 && (
                  <>
                    {([-1, 1] as const).map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => showPhoto(photo + dir)}
                        aria-label={dir < 0 ? 'Previous photo' : 'Next photo'}
                        className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-chalk opacity-0 ring-1 ring-white/15 backdrop-blur-md transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover/photos:opacity-100 md:flex ${
                          dir < 0 ? 'left-4' : 'right-4'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
                        </svg>
                      </button>
                    ))}
                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                      {photos.map((_, i) => (
                        <span key={i} aria-hidden="true" className={`h-1.5 rounded-full transition-all ${i === photo ? 'w-5 bg-chalk' : 'w-1.5 bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Photo strip */}
              {photos.length > 1 && (
                <div className="mt-3 flex gap-2.5" role="tablist" aria-label="Photos">
                  {photos.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      role="tab"
                      aria-selected={i === photo}
                      aria-label={`Photo ${i + 1}`}
                      onClick={() => showPhoto(i)}
                      className={`aspect-[4/3] w-24 overflow-hidden rounded-xl bg-carbon-2 ring-2 transition-[box-shadow,opacity] sm:w-28 ${
                        i === photo ? 'opacity-100 ring-chalk' : 'opacity-60 ring-transparent hover:opacity-100'
                      }`}
                    >
                      <img src={src} alt="" loading="lazy" onError={hideBrokenImage} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Showroom-floor reflection */}
              {product.image && photos.length < 2 && (
                <div aria-hidden="true" className="pointer-events-none relative hidden h-20 overflow-hidden rounded-b-3xl opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)] md:block">
                  <img src={product.image} alt="" className="h-[600%] w-full -scale-y-100 object-cover object-bottom blur-[2px]" />
                </div>
              )}
            </div>
          </div>

          {/* ── Details ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 lg:col-span-5"
          >
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] py-1.5 pl-2 pr-4 text-xs font-medium uppercase tracking-[0.16em] text-silver ring-1 ring-inset ring-white/10 transition-colors hover:text-chalk hover:ring-white/25"
            >
              <BrandLogo brand={brand ?? product.category} className="h-5 w-5" />
              {brand?.name ?? product.category}
            </Link>
            <h1 className="mt-4 break-words font-display text-[clamp(2rem,4.5vw,3.5rem)] font-semibold uppercase leading-[1] text-chalk stretch-125">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Plate size="lg" left={unitPrice} letter="د.م" right="MAD" aria-label={`${unitPrice} MAD`} />
              <span className="font-mono text-lg text-smoke line-through">{Math.ceil(product.price * 1.2)} MAD</span>
            </div>
            {left !== undefined && (
              <p
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${
                  left > 0 ? 'bg-white/[0.05] text-chalk ring-white/15' : 'bg-red-500/10 text-red-300 ring-red-400/30'
                }`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${left > 0 ? 'bg-xenon shadow-[0_0_6px_#8FCBFF]' : 'bg-red-400'}`} />
                {left > 0 ? (
                  <>
                    In stock · only {left} {left === 1 ? 'piece' : 'pieces'} left <span className="font-ar font-normal text-smoke">· بقاو غير {left}</span>
                  </>
                ) : (
                  <>
                    Sold out <span className="font-ar font-normal">· تباعو كاملين</span>
                  </>
                )}
              </p>
            )}
            <p className="mt-3 text-sm text-smoke">
              Pay cash on delivery · <span className="font-ar">الخلاص عند الاستلام</span>
            </p>

            <p className="mt-6 text-[15px] leading-relaxed text-silver md:text-base">{description}</p>

            <div className="mt-7 grid grid-cols-2 gap-2.5">
              <SpecTile label="Size" labelAr="القياس" value={dimensionsLabel} />
              <SpecTile label="Material" labelAr="المادة" value="Alucobond 3 mm" />
              <SpecTile label="Delivery" labelAr="التوصيل" value="24h – 3 days" />
              <SpecTile label="Mount" labelAr="التعليق" value="Pre-drilled" />
            </div>
            {edition ? (
              <p className="mt-2.5 text-xs text-smoke">
                One size only — the {edition.title} is made in {dimensionsLabel.replace(/\s*x\s*/i, ' × ')}, no other sizes.{' '}
                <span className="font-ar">مقاس واحد فقط.</span>
              </p>
            ) : (
              <p className="mt-2.5 text-xs text-smoke">120 × 50 cm or a custom size? Message us before ordering.</p>
            )}

            {/* Quantity */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full bg-carbon ring-1 ring-white/10" role="group" aria-label="Quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-chalk transition-colors hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" d="M5 12h14" />
                  </svg>
                </button>
                <span aria-live="polite" className="min-w-[2.5rem] text-center font-mono text-lg font-semibold tabular-nums text-chalk">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (left !== undefined ? Math.min(left, q + 1) : q + 1))}
                  disabled={left !== undefined && quantity >= left}
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-chalk transition-colors hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
              {quantity > 1 && (
                <p className="text-sm text-smoke">
                  Total <span className="font-semibold text-chalk">{totalPrice} MAD</span>
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6 space-y-3">
              <button onClick={buyNow} disabled={!available} className={`${btnPrimary} w-full`}>
                {available ? (
                  <>
                    Buy now <span className="font-ar text-sm normal-case tracking-normal opacity-70">· شري دابا</span>
                  </>
                ) : (
                  t('unavailable')
                )}
              </button>
              <button onClick={addAll} disabled={!available} className={`${btnGhostDark} w-full`}>
                {t('addToCart')} <span className="font-ar text-sm normal-case tracking-normal opacity-70">· زيد للسلة</span>
              </button>
              <a
                href={whatsappOrder}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 text-sm font-medium text-silver transition-colors hover:text-chalk"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Order on WhatsApp <span className="font-ar text-smoke">· طلب فالواتساب</span>
              </a>
            </div>

            {edition && twoD && (
              <Link
                href={`/product/${twoD._id}`}
                className="group mt-5 flex items-center gap-4 rounded-2xl bg-carbon p-3 ring-1 ring-white/[0.08] transition-colors hover:ring-white/25"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-carbon-2 sm:h-20 sm:w-28">
                  {twoD.image && (
                    <img src={twoD.image} alt={twoD.name} loading="lazy" onError={hideBrokenImage} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-smoke">
                    Lighter budget? <span className="font-ar normal-case tracking-normal">· بغيتي ثمن أقل؟</span>
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-chalk">{twoD.name} · 2D</p>
                  <p className="text-xs text-smoke">The same car in 2D — clean, elegant lines.</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Plate size="sm" left={twoD.price} letter="د.م" right="MAD" aria-label={`${twoD.price} MAD`} />
                    {product.price > twoD.price && (
                      <span className="text-xs font-semibold text-xenon">{product.price - twoD.price} MAD less</span>
                    )}
                  </div>
                </div>
                <svg className="h-4 w-4 shrink-0 text-smoke transition-transform group-hover:translate-x-1 group-hover:text-chalk" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            )}

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
          <section className="mt-24 border-t border-white/[0.08] py-20 md:mt-32">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className={kickerLabel}>
                  You may also like <span className="font-ar normal-case tracking-normal">· حتى هادو</span>
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold uppercase leading-none text-chalk stretch-125 md:text-5xl">
                  More from the garage
                </h2>
              </div>
              <Link href="/shop" className="hidden shrink-0 text-sm font-medium text-silver transition-colors hover:text-chalk sm:block">
                All cars →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar */}
      {available && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-asphalt/90 px-4 pt-3 backdrop-blur-xl md:hidden"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-smoke">{product.name}</p>
              <p className="text-lg font-semibold leading-tight text-chalk">
                {totalPrice} <span className="text-xs font-normal text-smoke">MAD</span>
              </p>
            </div>
            <button onClick={buyNow} className={`${btnPrimary} !px-6`}>
              Buy now <span className="font-ar text-sm normal-case tracking-normal opacity-70">· شري</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

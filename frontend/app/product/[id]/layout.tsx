import type { Metadata } from 'next';
import { API_URL, SITE_NAME, SITE_URL } from '@/lib/seo';
import { brandOf } from '@/lib/brands';
import { dimensionsOf } from '@/lib/dimensions';
import { isAvailable } from '@/lib/stock';
import type { Product } from '@/lib/apiServices';

/**
 * Server-side wrapper for the (client) product page: its own title,
 * description and share image, plus Product data so Google can show the
 * price and stock in search results.
 */

async function getProduct(id: string): Promise<Product | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.product ?? data) as Product;
  } catch {
    return null;
  }
}

function describe(product: Product): string {
  const size = dimensionsOf(product).replace(/\s*x\s*/i, ' × ');
  const brand = brandOf(product)?.name ?? product.category;
  const style = /\b3\s*d\b/i.test(product.name) ? '3D' : '2D';
  return `${product.name} ${style} car wall art (${size}) in 3 mm Alucobond — ${product.price} MAD, cash on delivery, free delivery across Morocco in 48h–3 days. Tableau voiture ${brand}.`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Car not found', robots: { index: false } };
  const title = `${product.name} — car wall art · ${product.price} MAD`;
  const description = describe(product);
  return {
    title,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/product/${id}`,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [product.image] },
  };
}

export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  const ld = product && {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.image, ...(product.gallery ?? []).map((src) => (src.startsWith('/') ? `${SITE_URL}${src}` : src))],
    description: describe(product),
    sku: product._id,
    category: 'Car wall art',
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product._id}`,
      price: product.price,
      priceCurrency: 'MAD',
      availability: isAvailable(product) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'MAD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MA' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 3, unitCode: 'DAY' },
        },
      },
    },
  };
  return (
    <>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />}
      {children}
    </>
  );
}

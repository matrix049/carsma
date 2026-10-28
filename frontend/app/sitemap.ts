import type { MetadataRoute } from 'next';
import { API_URL, SITE_URL } from '@/lib/seo';

/** Every public page and every car, so Google finds them all. Rebuilt hourly. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/customize`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
  try {
    const res = await fetch(`${API_URL}/api/products`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const products: { _id: string; image?: string; updatedAt?: string }[] = Array.isArray(data) ? data : data.products ?? [];
    for (const p of products) {
      pages.push({
        url: `${SITE_URL}/product/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
        images: p.image ? [p.image] : undefined,
      });
    }
  } catch {
    // the static pages are still worth listing
  }
  return pages;
}

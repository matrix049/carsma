import type { Metadata } from 'next';
import Link from 'next/link';
import { btnPrimary, kickerLabel } from '@/lib/uiStyles';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
};

/** Any unknown address: same look as the "no car here" product page. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt px-6 text-center">
      <p className={kickerLabel}>Wrong turn · 404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-none text-chalk stretch-125 sm:text-5xl">Nothing parked here</h1>
      <p className="mt-3 font-ar text-lg text-smoke">هاد الصفحة ماكايناش</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className={btnPrimary}>
          See all cars
        </Link>
        <Link href="/" className="inline-flex min-h-[48px] items-center px-5 text-sm font-medium text-silver transition-colors hover:text-chalk">
          Home
        </Link>
      </div>
    </div>
  );
}

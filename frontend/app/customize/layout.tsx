import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom car wall art — your car on your wall',
  description: 'Any car, any model and year, a logo or a motorbike: tell us your car and we make it in 2D or 3D. Custom car wall art made in Morocco.',
  alternates: { canonical: '/customize' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

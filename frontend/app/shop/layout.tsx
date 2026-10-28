import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop all cars — tableaux voiture',
  description: 'Every car wall art piece in one place: BMW, Mercedes, Porsche, Audi, Ferrari, Nissan GT-R, Mustang, F1 and more, in 2D and 3D. Cash on delivery across Morocco.',
  alternates: { canonical: '/shop' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

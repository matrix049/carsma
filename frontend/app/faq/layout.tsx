import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — sizes, delivery, mounting, returns',
  description: 'Sizes, delivery in 48h–3 days, double-sided tape mounting, Alucobond material, cash on delivery and returns: everything about L7IT car wall art.',
  alternates: { canonical: '/faq' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

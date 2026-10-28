import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — WhatsApp, Instagram & chat assistant',
  description: 'Talk to L7IT in Darija, French, English or Arabic: chat assistant, WhatsApp +212 765 810 304, Instagram @l7it.art. Studio in Salé, Morocco.',
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

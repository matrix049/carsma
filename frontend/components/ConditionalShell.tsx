'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import CartToast from '@/components/CartToast';

/**
 * Renders the public storefront shell (Navbar, Footer, etc.)
 * only for non-admin routes. Admin pages get a clean, bare layout.
 */
export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-0">{children}</main>
      <Footer />
      <CartToast />
      <FloatingWhatsApp />
    </>
  );
}

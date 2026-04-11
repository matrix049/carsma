'use client';

/**
 * Admin layout – intentionally hides the public Navbar, Footer, BottomNav,
 * and FloatingWhatsApp components. Admins manage orders; they don't browse
 * the storefront.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

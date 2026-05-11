'use client';

/**
 * Admin layout – intentionally hides the public Navbar, Footer, BottomNav,
 * and FloatingWhatsApp components. Admins manage orders; they don't browse
 * the storefront.
 *
 * `.admin-shell` wrapper class is the hook used in globals.css to flip
 * the entire admin tree from the dark theme its pages were authored in
 * over to a light theme — only colours are inverted, every other utility
 * (spacing, layout, opacity, rounded corners, etc.) keeps working.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-shell min-h-screen">{children}</div>;
}

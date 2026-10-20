'use client';

/**
 * Admin layout – intentionally hides the public Navbar, Footer, BottomNav,
 * and FloatingWhatsApp components. Admins manage orders; they don't browse
 * the storefront.
 *
 * `.admin-shell` wrapper class is the hook used in globals.css to re-point
 * the zinc / black / blue utilities the admin pages were authored with at
 * the storefront's showroom palette — only colours (and heading type)
 * change, every other utility (spacing, layout, rounded corners, etc.)
 * keeps working.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-shell min-h-screen">{children}</div>;
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import Plate from '@/components/Plate';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h4',
  },
  {
    label: 'Custom Orders',
    href: '/admin/custom-orders',
    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  },
  {
    label: 'Contact Messages',
    href: '/admin/contact-messages',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    label: 'Ledger',
    href: '/admin/ledger',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
];

function SidebarContent({ pathname, onLogout, onClose }: { pathname: string | null; onLogout: () => void; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col p-6">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-between">
        <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-3" aria-label="L7IT admin — dashboard">
          <Plate size="sm" left="L7IT" letter="ح" right="1" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-smoke">Admin</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-smoke transition-colors hover:bg-white/[0.06] hover:text-chalk md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1" aria-label="Admin">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/[0.06] text-chalk ring-1 ring-inset ring-white/10'
                  : 'text-smoke hover:bg-white/[0.03] hover:text-chalk'
              }`}
            >
              <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d={item.icon} />
              </svg>
              <span className="flex-1">{item.label}</span>
              {active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-xenon shadow-[0_0_8px_#8FCBFF]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-3 pt-8">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-smoke transition-colors hover:bg-white/[0.03] hover:text-chalk"
        >
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
          </svg>
          View store
        </a>
        <div className="flex items-center gap-3 rounded-2xl bg-carbon p-3 ring-1 ring-white/[0.08]">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-chalk font-display text-sm font-semibold text-asphalt">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-chalk">Amine</p>
            <p className="text-xs text-smoke">Master Admin</p>
          </div>
          <button
            onClick={() => { onClose?.(); onLogout(); }}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-full text-smoke transition-colors hover:bg-white/[0.06] hover:text-chalk"
          >
            <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      // Prevent scroll restoration
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      // Restore scroll position
      const scrollY = document.body.dataset.scrollY;
      document.body.style.overflow = '';
      document.body.style.height = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
        delete document.body.dataset.scrollY;
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      delete document.body.dataset.scrollY;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────── */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col border-r border-white/[0.07] bg-[#0E0F11] md:flex">
        <SidebarContent pathname={pathname} onLogout={onLogout} />
      </aside>

      {/* ── Mobile top bar ───────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-[70] flex items-center justify-between border-b border-white/[0.07] bg-asphalt/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" aria-label="L7IT admin — dashboard">
          <Plate size="sm" left="L7IT" letter="ح" right="1" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-smoke">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-silver transition-colors hover:bg-white/[0.06] hover:text-chalk"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer overlay ────────────────────── */}
      {mobileOpen && mounted && createPortal(
        <div className="admin-shell fixed inset-0 z-[9999] flex md:hidden" style={{ background: 'transparent' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-asphalt/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-10 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-white/[0.07] bg-[#0E0F11]">
            <SidebarContent pathname={pathname} onLogout={onLogout} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}

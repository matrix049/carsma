'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
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
];

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full p-8 md:p-10">
      {/* Logo */}
      <div className="mb-12 md:mb-16 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white font-jakarta">L7IT</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-1">
            Noir Collection
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 md:space-y-8">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={(e) => {
                e.preventDefault();
                console.log('🔍 Sidebar click - Target href:', item.href);
                console.log('🔍 Sidebar click - Current pathname:', pathname);
                console.log('🔍 Sidebar click - Using router.push to navigate');
                router.push(item.href);
                onClose?.();
              }}
              className={`flex items-center gap-4 md:gap-5 group transition-all w-full text-left ${
                active ? 'text-blue-500' : 'text-zinc-600 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-5 md:space-y-6">
        <button
          onClick={() => { onClose?.(); onLogout(); }}
          className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
        >
          Sign Out Securely
        </button>
        <div className="p-4 md:p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3 md:gap-4">
          <div className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            A
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-tight text-white truncate">
              Amine
            </p>
            <p className="text-[8px] font-bold text-zinc-600 mt-1 uppercase tracking-widest">
              Master Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────── */}
      <aside className="hidden md:flex w-72 border-r border-zinc-900 flex-none flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ───────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[70] flex items-center justify-between px-5 py-4 bg-black border-b border-zinc-900">
        <div>
          <span className="text-xl font-black tracking-tighter text-white font-jakarta">L7IT</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 ml-2">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer overlay ────────────────────── */}
      {mobileOpen && mounted && createPortal(
        <div 
          className="md:hidden fixed inset-0 z-[9999] flex"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 9999,
            width: '100vw',
            height: '100vh'
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside 
            className="relative z-10 w-72 max-w-[85vw] bg-black border-r border-zinc-900 h-full overflow-y-auto"
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}

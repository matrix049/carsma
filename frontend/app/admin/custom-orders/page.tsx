'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import CustomOrderTable from '@/components/CustomOrderTable';
import { fetchCustomOrders, CustomOrder } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/Loader';

type Filter = 'open' | 'pending' | 'contacted' | 'done' | 'all';

const FILTERS: { key: Filter; label: string; match: (o: CustomOrder) => boolean }[] = [
  { key: 'open', label: 'To handle', match: (o) => o.status === 'pending' || o.status === 'reviewed' },
  { key: 'pending', label: 'New', match: (o) => o.status === 'pending' },
  { key: 'contacted', label: 'Contacted', match: (o) => o.status === 'contacted' },
  { key: 'done', label: 'Done', match: (o) => o.status === 'completed' || o.status === 'cancelled' },
  { key: 'all', label: 'All', match: () => true },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('open');
  const [nonce, setNonce] = useState(0);
  const { logout } = useAuth();

  useEffect(() => {
    let cancelled = false;
    fetchCustomOrders().then(
      (data) => {
        if (cancelled) return;
        setOrders(data);
        setError(null);
      },
      (err: unknown) => !cancelled && setError(err instanceof Error ? err.message : 'Failed to load custom orders')
    );
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const active = FILTERS.find((f) => f.key === filter)!;
  const shown = orders?.filter(active.match) ?? [];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-asphalt text-chalk">
        <AdminSidebar onLogout={logout} />

        <main className="min-w-0 flex-1 overflow-x-clip px-4 pb-16 pt-20 sm:px-6 md:px-10 md:pt-10 lg:px-12">
          <header className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-chalk sm:text-4xl">Custom requests</h1>
              <p className="mt-1 text-[13px] text-smoke">From the chat assistant and the custom order form</p>
            </div>
            <button
              type="button"
              onClick={reload}
              aria-label="Refresh"
              className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-carbon text-smoke ring-1 ring-white/[0.08] transition-colors hover:text-chalk"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </header>

          {/* Filters */}
          <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter requests">
            <div className="flex w-max gap-2">
              {FILTERS.map((f) => {
                const count = orders?.filter(f.match).length ?? 0;
                const on = f.key === filter;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setFilter(f.key)}
                    className={`flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors ${
                      on ? 'bg-chalk text-asphalt' : 'bg-carbon text-smoke ring-1 ring-white/[0.08] hover:text-chalk'
                    }`}
                  >
                    {f.label}
                    <span className={`rounded-full px-1.5 text-[12px] ${on ? 'bg-asphalt/10' : 'bg-white/[0.06]'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl bg-rose-500/10 px-4 py-3 ring-1 ring-rose-500/20">
              <p className="text-[14px] text-rose-300">Error: {error}</p>
            </div>
          )}

          {!orders ? (
            !error && (
              <div className="flex justify-center py-32">
                <Loader size="lg" />
              </div>
            )
          ) : (
            <CustomOrderTable orders={shown} onOrderUpdated={reload} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

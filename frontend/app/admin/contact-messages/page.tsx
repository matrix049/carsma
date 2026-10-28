'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import ContactMessageTable from '@/components/ContactMessageTable';
import { fetchContactMessages, ContactMessage } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Loader from '@/components/Loader';

type Filter = 'all' | ContactMessage['status'];

/** Does the message match the search box? Phone numbers match on digits only. */
function matchesQuery(m: ContactMessage, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = [m.customer.name, m.customer.phone, m.customer.email, m.message]
    .some((v) => (v || '').toLowerCase().includes(q));
  if (text) return true;
  const digits = q.replace(/\D/g, '');
  return digits.length >= 3 && (m.customer.phone || '').replace(/\D/g, '').includes(digits);
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const { logout } = useAuth();

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchContactMessages();
      setMessages(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load contact messages:', err);
      setError(err.message || 'Failed to load contact messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Only the very first load swaps the list for a spinner; later refreshes
  // (refresh button, status changes) keep the list — and the scroll position.
  const firstLoad = isLoading && messages.length === 0;
  const refreshing = isLoading && !firstLoad;
  const showStats = !firstLoad && (messages.length > 0 || !error);

  const unreadMessages   = messages.filter((m) => m.status === 'unread').length;
  const readMessages     = messages.filter((m) => m.status === 'read').length;
  const resolvedMessages = messages.filter((m) => m.status === 'resolved').length;
  const archivedMessages = messages.filter((m) => m.status === 'archived').length;

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: 'all',      label: 'All',      count: messages.length },
    { value: 'unread',   label: 'Unread',   count: unreadMessages },
    { value: 'read',     label: 'Read',     count: readMessages },
    { value: 'resolved', label: 'Resolved', count: resolvedMessages },
    { value: 'archived', label: 'Archived', count: archivedMessages },
  ];

  const visibleMessages = messages.filter(
    (m) => (filter === 'all' || m.status === filter) && matchesQuery(m, query)
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white font-inter">
        <AdminSidebar onLogout={logout} />

        {/* overflow-x-clip (not auto) so the filter bar below can stick on phones */}
        <main className="min-w-0 flex-1 overflow-x-clip px-5 pb-10 pt-20 md:p-14">
          {/* Header */}
          <header className="flex items-start justify-between gap-4 mb-5 md:mb-8 lg:mb-16 sm:items-end">
            <div className="min-w-0">
              <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-chalk sm:text-4xl">
                Messages
              </h1>
              <p className="mt-1 text-[13px] text-smoke">Questions from the chat assistant and the contact page</p>
            </div>
            <button
              onClick={loadMessages}
              disabled={isLoading}
              aria-label="Refresh messages"
              title="Refresh"
              className="flex-none h-11 w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all disabled:cursor-wait"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </header>

          {/* KPI mini-cards — desktop; phones get the counts on the filter chips */}
          {showStats && (
            <div className="hidden md:grid grid-cols-4 gap-6 mb-8 lg:mb-12">
              {[
                { label: 'Unread',   count: unreadMessages,   color: 'amber' },
                { label: 'Read',     count: readMessages,     color: 'blue' },
                { label: 'Resolved', count: resolvedMessages, color: 'emerald' },
                { label: 'Archived', count: archivedMessages, color: 'zinc' },
              ].map((k, idx) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-2xl lg:rounded-3xl border border-zinc-900 bg-zinc-900/30 p-5 lg:p-8"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3 lg:mb-4">
                    {k.label}
                  </p>
                  <p className="text-3xl lg:text-4xl font-black tracking-tighter font-jakarta">{k.count}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Search */}
          {showStats && (
            <label className="relative mb-2 block md:mb-4 md:max-w-sm">
              <span className="sr-only">Search messages</span>
              <svg className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-smoke" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone or message"
                enterKeyHint="search"
                autoComplete="off"
                className="h-12 w-full rounded-xl bg-carbon pl-11 pr-4 text-base text-chalk ring-1 ring-inset ring-white/10 placeholder:text-smoke/70 focus:outline-none focus:ring-2 focus:ring-xenon/70 md:h-11 md:text-sm"
              />
            </label>
          )}

          {/* Status filter — sticks under the phone top bar while scrolling */}
          {showStats && (
            <div className="sticky top-[64px] z-30 -mx-5 mb-3 bg-asphalt/90 py-2 backdrop-blur-xl md:static md:mx-0 md:mb-6 md:bg-transparent md:py-0 md:backdrop-blur-none">
              <div
                role="group"
                aria-label="Filter by status"
                className="flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {filters.map((f) => {
                  const active = filter === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(f.value)}
                      className={`flex h-11 flex-none items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-inset transition-colors ${
                        active
                          ? 'bg-chalk text-asphalt ring-chalk'
                          : 'bg-white/[0.03] text-silver ring-white/10 hover:bg-white/[0.06] hover:text-chalk'
                      }`}
                    >
                      {f.value === 'unread' && f.count > 0 && (
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                      {f.label}
                      <span className={`tabular-nums ${active ? 'text-asphalt/60' : 'text-smoke'}`}>{f.count}</span>
                    </button>
                  );
                })}
                <span aria-hidden="true" className="w-1 flex-none md:hidden" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div role="alert" className="mb-6 md:mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 md:p-6">
              <p className="text-rose-400 text-sm font-bold break-words">Error: {error}</p>
            </div>
          )}

          {/* Loading */}
          {firstLoad ? (
            <div className="flex justify-center py-32">
              <Loader size="lg" />
            </div>
          ) : messages.length > 0 && visibleMessages.length === 0 ? (
            <div className="rounded-2xl bg-carbon px-5 py-16 text-center ring-1 ring-white/[0.08]">
              <p className="text-sm text-smoke">No messages match.</p>
              <button
                type="button"
                onClick={() => { setFilter('all'); setQuery(''); }}
                className="mt-4 h-11 rounded-full bg-white/[0.04] px-5 text-sm font-medium text-chalk ring-1 ring-inset ring-white/10 hover:bg-white/[0.08]"
              >
                Show all messages
              </button>
            </div>
          ) : (
            <div className="lg:rounded-[2.5rem] lg:border lg:border-white/[0.07] lg:bg-carbon lg:overflow-hidden lg:shadow-2xl">
              <ContactMessageTable messages={visibleMessages} onStatusUpdate={loadMessages} />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

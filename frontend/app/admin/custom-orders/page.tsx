'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import CustomOrderTable from '@/components/CustomOrderTable';
import { fetchCustomOrders, CustomOrder } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchCustomOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load custom orders:', err);
      setError(err.message || 'Failed to load custom orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const pendingRequests   = orders.filter((o) => o.status === 'pending').length;
  const reviewedRequests  = orders.filter((o) => o.status === 'reviewed').length;
  const contactedRequests = orders.filter((o) => o.status === 'contacted').length;
  const completedRequests = orders.filter((o) => o.status === 'completed').length;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white font-inter">
        <AdminSidebar onLogout={logout} />

        <main className="flex-1 overflow-y-auto pt-20 md:pt-0 px-5 py-6 md:p-14">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-8 lg:mb-16">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter font-jakarta uppercase leading-tight">
                Custom <span className="text-zinc-800">Requests</span>
              </h1>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-2 md:mt-3 flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                Personalized wall art design requests
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="self-start sm:self-auto h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </header>

          {/* KPI mini-cards */}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 lg:mb-12">
              {[
                { label: 'Pending',      count: pendingRequests,   color: 'amber' },
                { label: 'Under Review', count: reviewedRequests,  color: 'blue' },
                { label: 'Contacted',    count: contactedRequests, color: 'purple' },
                { label: 'Completed',    count: completedRequests, color: 'emerald' },
              ].map((k, idx) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-xl md:rounded-2xl lg:rounded-3xl border border-zinc-900 bg-zinc-900/30 p-4 md:p-5 lg:p-8"
                >
                  <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2 md:mb-3 lg:mb-4">
                    {k.label}
                  </p>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter font-jakarta">{k.count}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6">
              <p className="text-rose-400 text-sm font-bold">Error: {error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex justify-center py-32">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-xl md:rounded-[2rem] lg:rounded-[2.5rem] border border-zinc-900 bg-zinc-900/20 overflow-hidden shadow-2xl">
              <CustomOrderTable orders={orders} onOrderUpdated={loadOrders} />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

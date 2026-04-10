'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomOrderTable from '@/components/CustomOrderTable';
import { fetchCustomOrders, CustomOrder } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminCustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { admin, logout } = useAuth();

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

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const pendingRequests = orders.filter(o => o.status === 'pending').length;
  const reviewedRequests = orders.filter(o => o.status === 'reviewed').length;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 sm:py-12 sm:px-6 max-w-7xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Custom Design Requests</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Manage personalized car wall art requests from your customers.
            </p>
          </div>
          <div className="mt-6 sm:mt-0 flex gap-4">
            <button
              onClick={loadOrders}
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 border border-zinc-200 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all font-semibold"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 text-white px-5 py-2.5 text-sm font-bold shadow-sm hover:bg-red-500 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Request KPIs */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-10">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Pending Requests</span>
              <p className="mt-3 flex items-baseline text-4xl font-black text-zinc-900 dark:text-white">
                {pendingRequests}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm dark:border-blue-900/30 dark:bg-blue-950/20">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Under Review</span>
              <p className="mt-3 flex items-baseline text-4xl font-black text-blue-900 dark:text-blue-300">
                {reviewedRequests}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-red-800 dark:text-red-400 font-medium">Error: {error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <CustomOrderTable orders={orders} onOrderUpdated={loadOrders} />
        )}
      </div>
    </ProtectedRoute>
  );
}

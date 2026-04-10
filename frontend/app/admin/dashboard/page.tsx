'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import OrderTable from '@/components/OrderTable';
import { fetchOrders, Order } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { admin, logout } = useAuth();

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Compute KPIs
  const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  // Revenue calculation mapping correctly to MAD explicitly
  const totalRevenueMAD = orders
    .filter(o => o.status === 'confirmed' || o.status === 'delivered')
    .reduce((acc, order) => acc + order.totalPrice, 0);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 sm:py-12 sm:px-6 max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Dashboard</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Welcome back, {admin?.email || 'admin'}. Here is your business overview.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-4">
            <button
              onClick={loadOrders}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 border border-zinc-200 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2 border border-black text-sm font-medium shadow-sm hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:border-white dark:hover:bg-zinc-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard KPIs */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Active Orders</span>
              <p className="mt-3 flex items-baseline text-4xl font-extrabold text-zinc-900 dark:text-white">
                {totalOrders}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm dark:border-blue-900/30 dark:bg-blue-950/20">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pending Orders</span>
              <p className="mt-3 flex items-baseline text-4xl font-extrabold text-blue-900 dark:text-blue-300">
                {pendingOrders}
              </p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 shadow-sm dark:border-green-900/30 dark:bg-green-950/20">
              <span className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Total Revenue</span>
              <p className="mt-3 flex items-baseline text-4xl font-extrabold text-green-900 dark:text-green-300 gap-2">
                {totalRevenueMAD.toFixed(0)} <span className="text-lg font-bold text-green-600">MAD</span>
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-red-800 dark:text-red-400 font-medium">Error loading dashboard: {error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <OrderTable orders={orders} onOrderUpdated={loadOrders} />
        )}
      </div>
    </ProtectedRoute>
  );
}

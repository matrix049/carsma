'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchOrders, fetchStats, Order, DashboardStats } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(orders: Order[]) {
  const rows = [
    ['Order ID', 'Date', 'Customer', 'Phone', 'Address', 'Products', 'Total (MAD)', 'Payment', 'Status'],
    ...orders.map((o) => [
      `#L7-${o._id.slice(-6).toUpperCase()}`,
      new Date(o.createdAt).toLocaleString(),
      `${o.customer.firstName} ${o.customer.lastName}`,
      o.customer.phone,
      `"${o.customer.address.replace(/"/g, '""')}"`,
      `"${o.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')}"`,
      o.totalPrice.toFixed(0),
      o.paymentMethod.toUpperCase(),
      o.status,
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `l7it-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Status style ─────────────────────────────────────────────────────────────
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'pending':   return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    default:          return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  }
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ordersData, statsData] = await Promise.all([fetchOrders(), fetchStats()]);
      setOrders([...ordersData].reverse());
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white font-inter">
        <AdminSidebar onLogout={logout} />

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto pt-20 md:pt-0 px-5 py-6 md:p-16">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-6xl font-black tracking-tighter font-jakarta uppercase leading-tight">
                Commercial <span className="text-zinc-800">Intelligence</span>
              </h1>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-2 md:mt-3 flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                Live Hub Status: Optimized
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800 transition-all"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 lg:gap-10 mb-8 md:mb-10 lg:mb-20">
            {[
              { label: 'Total Revenue', value: stats?.totalRevenue || 0, format: 'currency', sub: 'Confirmed + Delivered', trend: 'up', color: 'blue' },
              { label: 'Pending Orders', value: stats?.pendingOrders || 0, format: 'number', sub: 'Immediate Action Required', trend: 'alert', color: 'amber' },
              { label: 'Total Volume', value: stats?.orderCount || 0, format: 'number', sub: 'All-time Orders', trend: 'ok', color: 'zinc' },
            ].map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] bg-zinc-900/40 border border-zinc-900 p-4 md:p-7 lg:p-10 shadow-3xl hover:border-zinc-800 transition-all"
              >
                <div className="flex justify-between items-start mb-4 md:mb-6 lg:mb-10">
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{kpi.label}</p>
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      kpi.trend === 'up'
                        ? 'bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.8)]'
                        : kpi.trend === 'alert'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-zinc-700'
                    }`}
                  />
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-2 md:mb-3 font-jakarta">
                  {kpi.value.toLocaleString()}
                  {kpi.format === 'currency' && (
                    <span className="text-[8px] md:text-[10px] text-zinc-600 ml-1 md:ml-2">MAD</span>
                  )}
                </h3>
                <p
                  className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                    kpi.color === 'blue'
                      ? 'text-blue-500'
                      : kpi.color === 'amber'
                      ? 'text-amber-500'
                      : 'text-zinc-600'
                  }`}
                >
                  {kpi.sub}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight font-jakarta">
                Recent Transactions
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => exportCSV(orders)}
                  className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV Export
                </button>
                <Link
                  href="/admin/orders"
                  className="px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-800 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                >
                  View All →
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6">
                <p className="text-rose-400 text-sm font-bold">Error: {error}</p>
              </div>
            )}

            {/* Desktop table */}
            <div className="hidden lg:block rounded-2xl lg:rounded-[3rem] border border-zinc-900 bg-zinc-900/20 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                    <th className="px-6 lg:px-10 py-6 lg:py-8">Reference</th>
                    <th className="px-6 lg:px-10 py-6 lg:py-8">Customer</th>
                    <th className="px-6 lg:px-10 py-6 lg:py-8">Status</th>
                    <th className="px-6 lg:px-10 py-6 lg:py-8 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order._id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-6 lg:px-10 py-6 lg:py-8 text-[10px] lg:text-[11px] font-black text-blue-600">
                        #L7-{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 lg:px-10 py-6 lg:py-8">
                        <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-tight text-white">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="text-[8px] lg:text-[9px] text-zinc-700 font-bold mt-1">{order.customer.phone}</p>
                      </td>
                      <td className="px-6 lg:px-10 py-6 lg:py-8">
                        <span className={`px-3 lg:px-5 py-1 lg:py-2 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 lg:px-10 py-6 lg:py-8 text-right text-[10px] lg:text-[11px] font-black text-white">
                        {order.totalPrice.toLocaleString()}{' '}
                        <span className="text-[7px] lg:text-[8px] text-zinc-700 ml-1">MAD</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {orders.slice(0, 10).map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-xl md:rounded-2xl border border-zinc-900 bg-zinc-900/30 p-4 md:p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] md:text-[11px] font-black text-blue-500">
                      #L7-{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`px-2.5 md:px-3 py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-[12px] font-black uppercase tracking-tight text-white">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold mt-0.5">{order.customer.phone}</p>
                  <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] text-zinc-600 font-black uppercase tracking-widest">Total</span>
                    <span className="text-[12px] md:text-[13px] font-black text-white">
                      {order.totalPrice.toLocaleString()} <span className="text-[8px] md:text-[9px] text-zinc-600">MAD</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

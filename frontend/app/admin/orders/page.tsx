'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchOrders, updateOrderStatus, Order } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import WheelLoader from '@/components/WheelLoader';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;
type Status = (typeof STATUS_OPTIONS)[number];

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'pending':   return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:          return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
}

function exportCSV(orders: Order[]) {
  const rows = [
    ['Order ID', 'Date', 'Customer', 'Phone', 'Address', 'Products', 'Total (MAD)', 'Payment', 'Status'],
    ...orders.map((o) => [
      `#${o.orderNumber}`,
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

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { logout } = useAuth();

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrders();
      setOrders(data); // Backend already sorts by newest first (createdAt: -1)
      setError(null);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Handle modal keyboard events and focus management
  useEffect(() => {
    if (selectedOrder) {
      // Focus the modal for keyboard navigation
      const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }

      // Handle escape key globally
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedOrder(null);
        }
      };

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);

      // Touch gesture handling for mobile
      let startY = 0;
      let currentY = 0;
      let isDragging = false;

      const handleTouchStart = (e: Event) => {
        const touchEvent = e as TouchEvent;
        startY = touchEvent.touches[0].clientY;
        isDragging = true;
      };

      const handleTouchMove = (e: Event) => {
        const touchEvent = e as TouchEvent;
        if (!isDragging) return;
        currentY = touchEvent.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Only allow downward swipe and only if at the top of the modal
        const modalContent = e.target as HTMLElement;
        const isAtTop = modalContent.scrollTop === 0;
        
        if (deltaY > 0 && isAtTop) {
          e.preventDefault();
          // Add visual feedback for swipe
          const modal = document.querySelector('[role="dialog"] > div') as HTMLElement;
          if (modal) {
            const progress = Math.min(deltaY / 150, 1);
            modal.style.transform = `translateY(${deltaY * 0.5}px) scale(${1 - progress * 0.1})`;
            modal.style.opacity = `${1 - progress * 0.3}`;
          }
        }
      };

      const handleTouchEnd = (e: Event) => {
        if (!isDragging) return;
        isDragging = false;
        
        const deltaY = currentY - startY;
        const modal = document.querySelector('[role="dialog"] > div') as HTMLElement;
        
        if (deltaY > 100) {
          // Close modal if swiped down enough
          setSelectedOrder(null);
        } else {
          // Reset modal position
          if (modal) {
            modal.style.transform = '';
            modal.style.opacity = '';
          }
        }
      };

      // Add touch listeners to the modal content
      const modalContent = document.querySelector('[role="dialog"] > div');
      if (modalContent) {
        modalContent.addEventListener('touchstart', handleTouchStart, { passive: false });
        modalContent.addEventListener('touchmove', handleTouchMove, { passive: false });
        modalContent.addEventListener('touchend', handleTouchEnd);
      }

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
        
        // Clean up touch listeners
        if (modalContent) {
          modalContent.removeEventListener('touchstart', handleTouchStart);
          modalContent.removeEventListener('touchmove', handleTouchMove);
          modalContent.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
  }, [selectedOrder]);

  const handleStatusChange = async (orderId: string, newStatus: Status) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        o.customer.firstName.toLowerCase().includes(q) ||
        o.customer.lastName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q);
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filterStatus]);

  const stats = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }),
    [orders]
  );

  const kpiCards: { label: string; count: number; activeClass: string; filter: Status }[] = [
    { label: 'Pending',   count: stats.pending,   activeClass: 'border-amber-500/40 bg-amber-500/10',     filter: 'pending' },
    { label: 'Confirmed', count: stats.confirmed, activeClass: 'border-blue-500/40 bg-blue-500/10',       filter: 'confirmed' },
    { label: 'Delivered', count: stats.delivered, activeClass: 'border-emerald-500/40 bg-emerald-500/10', filter: 'delivered' },
    { label: 'Cancelled', count: stats.cancelled, activeClass: 'border-rose-500/40 bg-rose-500/10',       filter: 'cancelled' },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white font-inter">
        <AdminSidebar onLogout={logout} />

        <main className="flex-1 overflow-y-auto pt-20 md:pt-0 px-5 py-6 md:p-14">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-8 lg:mb-16">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter font-jakarta uppercase leading-tight">
                Order <span className="text-zinc-800">Control</span>
              </h1>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-2 md:mt-3 flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                {orders.length} total orders loaded
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => exportCSV(filtered)}
                className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={loadOrders}
                className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all flex-shrink-0"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          {/* KPI mini-cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 lg:mb-12">
            {kpiCards.map((k) => (
              <motion.button
                key={k.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setFilterStatus(filterStatus === k.filter ? 'all' : k.filter)}
                className={`rounded-xl md:rounded-2xl lg:rounded-3xl border p-4 md:p-5 lg:p-8 text-left transition-all ${
                  filterStatus === k.filter
                    ? k.activeClass
                    : 'border-zinc-900 bg-zinc-900/30 hover:border-zinc-700'
                }`}
              >
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2 md:mb-3 lg:mb-4">
                  {k.label}
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter font-jakarta">{k.count}</p>
              </motion.button>
            ))}
          </div>

          {/* Search + Status Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8 lg:mb-10">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone or order ID…"
                className="w-full bg-zinc-900 border border-zinc-900 rounded-xl md:rounded-2xl pl-10 md:pl-11 pr-4 md:pr-5 py-3 md:py-3.5 text-[10px] md:text-[11px] font-semibold focus:outline-none focus:border-blue-600 transition-all text-white placeholder-zinc-700"
              />
              <svg className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-900 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-3.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6">
              <p className="text-rose-400 text-sm font-bold">Error: {error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32">
              <WheelLoader size="lg" className="text-blue-600" />
              <p className="mt-8 text-sm font-black uppercase tracking-widest text-zinc-600">
                Loading Orders...
              </p>
            </div>
          )}

          {/* Orders – Desktop Table */}
          {!isLoading && !error && (
            <>
              {filtered.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">
                    No orders match your filters
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden lg:block rounded-[2.5rem] border border-zinc-900 bg-zinc-900/20 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                          <th className="px-8 py-7">Order Ref</th>
                          <th className="px-8 py-7">Date</th>
                          <th className="px-8 py-7">Customer</th>
                          <th className="px-8 py-7">Items</th>
                          <th className="px-8 py-7 text-right">Total</th>
                          <th className="px-8 py-7 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60">
                        {filtered.map((order, idx) => (
                          <motion.tr
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setSelectedOrder(order)}
                            className="hover:bg-zinc-800/10 transition-colors align-top cursor-pointer"
                          >
                            <td className="px-8 py-7">
                              <span className="text-[11px] font-black text-blue-500">
                                #{order.orderNumber}
                              </span>
                              {order.paymentMethod === 'cod' && (
                                <span className="ml-2 px-2 py-0.5 rounded bg-zinc-800 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                                  COD
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-7">
                              <p className="text-[10px] font-bold text-zinc-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-[9px] text-zinc-700 mt-0.5">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </td>
                            <td className="px-8 py-7">
                              <p className="text-[11px] font-black uppercase tracking-tight text-white">
                                {order.customer.firstName} {order.customer.lastName}
                              </p>
                              <p className="text-[10px] text-zinc-500 font-bold mt-1">{order.customer.phone}</p>
                              <p className="text-[9px] text-zinc-700 mt-1 max-w-[200px] leading-relaxed">
                                {order.customer.address.split('| Notes:')[0].trim()}
                              </p>
                              {order.customer.address.includes('| Notes:') && (
                                <p className="text-[9px] text-amber-600/80 mt-1 italic max-w-[200px]">
                                  Note: {order.customer.address.split('| Notes:')[1]?.trim()}
                                </p>
                              )}
                            </td>
                            <td className="px-8 py-7">
                              <div className="space-y-1.5">
                                {order.products.map((p, i) => (
                                  <p key={i} className="text-[10px] text-zinc-400 font-medium">
                                    <span className="text-zinc-600 font-black">{p.quantity}×</span>{' '}
                                    {p.name}
                                  </p>
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-7 text-right">
                              <span className="text-[13px] font-black text-white">
                                {order.totalPrice.toFixed(0)}
                              </span>
                              <span className="text-[9px] text-zinc-700 ml-1">MAD</span>
                            </td>
                            <td className="px-8 py-7">
                              <div className="flex flex-col items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle(order.status)}`}>
                                  {order.status}
                                </span>
                                <select
                                  value={order.status}
                                  disabled={updatingId === order._id}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value as Status)}
                                  className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer text-center ${
                                    updatingId === order._id ? 'opacity-40 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                  ))}
                                </select>
                                {updatingId === order._id && (
                                  <span className="text-[9px] font-bold text-blue-500 animate-pulse">Saving…</span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile / tablet cards */}
                  <div className="lg:hidden space-y-4">
                    {filtered.map((order, idx) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Top row: ref + status badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-black text-blue-500">
                              #{order.orderNumber}
                            </span>
                            {order.paymentMethod === 'cod' && (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                                COD
                              </span>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Customer info */}
                        <p className="text-[13px] font-black uppercase tracking-tight text-white">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-bold mt-0.5">{order.customer.phone}</p>
                        <p className="text-[10px] text-zinc-700 mt-1 leading-relaxed">
                          {order.customer.address.split('| Notes:')[0].trim()}
                        </p>
                        {order.customer.address.includes('| Notes:') && (
                          <p className="text-[10px] text-amber-600/80 mt-1 italic">
                            Note: {order.customer.address.split('| Notes:')[1]?.trim()}
                          </p>
                        )}

                        {/* Date + items */}
                        <div className="mt-3 pt-3 border-t border-zinc-900/60">
                          <p className="text-[9px] text-zinc-700 font-bold mb-2">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <div className="space-y-1">
                            {order.products.map((p, i) => (
                              <p key={i} className="text-[11px] text-zinc-400">
                                <span className="text-zinc-600 font-black">{p.quantity}×</span> {p.name}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Total + status changer */}
                        <div className="mt-4 pt-4 border-t border-zinc-900/60 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Total</p>
                            <span className="text-[18px] font-black text-white">{order.totalPrice.toFixed(0)}</span>
                            <span className="text-[10px] text-zinc-600 ml-1">MAD</span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <select
                              value={order.status}
                              disabled={updatingId === order._id}
                              onChange={(e) => handleStatusChange(order._id, e.target.value as Status)}
                              className={`bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-[11px] font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer ${
                                updatingId === order._id ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                            {updatingId === order._id && (
                              <span className="text-[9px] font-bold text-blue-500 animate-pulse">Saving…</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div 
            className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSelectedOrder(null);
              }
            }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-[3rem] border border-zinc-800 bg-zinc-950 shadow-2xl"
            >
              {/* Close button - Enhanced for mobile, positioned below mobile nav */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-20 right-4 sm:top-8 sm:right-8 h-12 w-12 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-10 touch-manipulation"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Mobile: Swipe indicator and instructions - positioned below mobile nav */}
              <div className="block sm:hidden absolute top-16 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-zinc-700 rounded-full"></div>
              <div className="block sm:hidden absolute top-20 left-1/2 transform -translate-x-1/2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                Swipe down or tap outside to close
              </div>

              <div className="pt-20 sm:pt-4 p-4 sm:p-6 md:p-10 lg:p-14">
                {/* Mobile Header with Close Button */}
                <div className="block sm:hidden mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tighter font-jakarta uppercase text-white">
                      Order Details
                    </h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all touch-manipulation"
                      aria-label="Close modal"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-blue-500 text-lg font-black mt-2">
                    #{selectedOrder.orderNumber}
                  </p>
                </div>

                {/* Header */}
                <div className="hidden sm:block mb-6 sm:mb-8 md:mb-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter font-jakarta uppercase">
                      Order Details
                    </h2>
                    <span className={`px-3 sm:px-5 py-1 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${statusStyle(selectedOrder.status)} self-start`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-blue-500 text-lg sm:text-xl font-black">
                    #{selectedOrder.orderNumber}
                  </p>
                  <p className="text-zinc-600 text-xs sm:text-sm font-bold mt-1 sm:mt-2">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
                  {/* Customer Information */}
                  <div className="rounded-2xl sm:rounded-3xl border border-zinc-900 bg-zinc-900/30 p-4 sm:p-6 md:p-8">
                    <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 sm:mb-6">
                      Customer Information
                    </h3>
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1 sm:mb-2">Name</p>
                        <p className="text-base sm:text-lg font-black text-white">
                          {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1 sm:mb-2">Phone</p>
                        <p className="text-sm sm:text-base font-bold text-zinc-300">{selectedOrder.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1 sm:mb-2">Delivery Address</p>
                        <p className="text-xs sm:text-sm font-medium text-zinc-400 leading-relaxed">
                          {selectedOrder.customer.address.split('| Notes:')[0].trim()}
                        </p>
                      </div>
                      {selectedOrder.customer.address.includes('| Notes:') && (
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1 sm:mb-2">Customer Notes</p>
                          <p className="text-xs sm:text-sm font-medium text-amber-500/80 leading-relaxed italic">
                            {selectedOrder.customer.address.split('| Notes:')[1]?.trim()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="rounded-2xl sm:rounded-3xl border border-zinc-900 bg-zinc-900/30 p-4 sm:p-6 md:p-8">
                    <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 sm:mb-6">
                      Order Information
                    </h3>
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1 sm:mb-2">Payment Method</p>
                        <p className="text-sm sm:text-base font-black text-white uppercase">
                          {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1 sm:mb-2">Order Date</p>
                        <p className="text-sm sm:text-base font-bold text-zinc-300">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                          {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1 sm:mb-2">Order ID</p>
                        <p className="text-[10px] sm:text-xs font-mono text-zinc-500 break-all">{selectedOrder._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="rounded-2xl sm:rounded-3xl border border-zinc-900 bg-zinc-900/30 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10">
                  <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 sm:mb-6">
                    Ordered Items
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedOrder.products.map((product, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-900"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-1 min-w-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm sm:text-lg md:text-xl font-black text-blue-500">{product.quantity}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-black text-white truncate">{product.name}</p>
                            <p className="text-xs sm:text-sm text-zinc-600 font-bold mt-0.5 sm:mt-1">Qty: {product.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm sm:text-base md:text-lg font-black text-white">
                            {(product.price * product.quantity).toFixed(0)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-zinc-600 font-bold">MAD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-2xl sm:rounded-3xl border-2 border-blue-600/30 bg-blue-950/20 p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">
                        Total Amount
                      </p>
                      <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white">
                        {selectedOrder.totalPrice.toFixed(0)}
                        <span className="text-sm sm:text-lg md:text-xl text-zinc-600 ml-1 sm:ml-2">MAD</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-600">Update Status</p>
                      <select
                        value={selectedOrder.status}
                        disabled={updatingId === selectedOrder._id}
                        onChange={(e) => {
                          handleStatusChange(selectedOrder._id, e.target.value as Status);
                          setSelectedOrder({ ...selectedOrder, status: e.target.value as any });
                        }}
                        className={`bg-zinc-950 border border-zinc-800 rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer min-w-[120px] ${
                          updatingId === selectedOrder._id ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {updatingId === selectedOrder._id && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-blue-500 animate-pulse">Saving…</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchOrders, updateOrderStatus, updateOrder, Order, OrderFinish } from '@/lib/apiServices';
import { duoDiscount } from '@/lib/bundles';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Loader from '@/components/Loader';
import {
  ORDER_STATUSES,
  OrderStatus,
  OrderCard,
  StatusBadge,
  StatusPills,
  ContactButtons,
  orderStatusStyle,
  customerName,
  parseAddress,
  paymentLabel,
  whatsappGreeting,
} from '@/components/OrderTable';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ORDER_STATUSES;
type Status = OrderStatus;

// Shared look for the detail sheet's sections and their labels.
const SECTION = 'rounded-2xl border border-zinc-900 bg-zinc-900/30 p-4 sm:p-6 md:rounded-3xl md:p-8';
const LABEL = 'text-[11px] font-black uppercase tracking-[0.25em] text-zinc-600';
const FIELD_LABEL = 'text-[11px] font-semibold uppercase tracking-widest text-zinc-700';

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
  // Editable working copy of the open order. All admin edits (item quantities,
  // item removal, finish choice) write to `draftOrder`. The Save button
  // diffs draft vs selectedOrder and commits via updateOrder.
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { logout } = useAuth();

  const dialogRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

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

  // Open an order in the details sheet with a fresh editable draft.
  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setDraftOrder({ ...order, products: order.products.map((p) => ({ ...p })) });
    setEditError(null);
  };

  // Sheet keyboard, scroll lock, focus and swipe-to-close. Keyed on the open
  // order's id so a status change inside the sheet doesn't re-run it.
  const openOrderId = selectedOrder?._id ?? null;
  useEffect(() => {
    if (!openOrderId) return;

    dialogRef.current?.focus({ preventScroll: true });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOrder(null);
    };

    // Prevent body scroll when the sheet is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    // Phones: drag the sheet down to close it. Only starts when the sheet is
    // scrolled to the very top — otherwise a downward swipe is the admin
    // scrolling back up through the order.
    const sheet = sheetRef.current;
    let startY = 0;
    let deltaY = 0;
    let dragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (!sheet) return;
      dragging = window.innerWidth < 768 && sheet.scrollTop <= 0;
      startY = e.touches[0].clientY;
      deltaY = 0;
      if (dragging) sheet.style.transition = 'none';
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging || !sheet) return;
      deltaY = e.touches[0].clientY - startY;
      // Small dead zone: finger jitter on a tap (e.g. on the status pills at
      // the top) never moves the sheet or cancels the touch.
      if (deltaY <= 6 || sheet.scrollTop > 0) {
        sheet.style.transform = '';
        return;
      }
      e.preventDefault();
      sheet.style.transform = `translateY(${deltaY}px)`;
    };

    const handleTouchEnd = () => {
      if (!dragging || !sheet) return;
      dragging = false;
      sheet.style.transition = 'transform 0.2s ease';
      if (deltaY > 110) {
        setSelectedOrder(null);
      } else {
        sheet.style.transform = '';
      }
    };

    sheet?.addEventListener('touchstart', handleTouchStart, { passive: true });
    sheet?.addEventListener('touchmove', handleTouchMove, { passive: false });
    sheet?.addEventListener('touchend', handleTouchEnd);
    sheet?.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      sheet?.removeEventListener('touchstart', handleTouchStart);
      sheet?.removeEventListener('touchmove', handleTouchMove);
      sheet?.removeEventListener('touchend', handleTouchEnd);
      sheet?.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [openOrderId]);

  const handleStatusChange = async (orderId: string, newStatus: Status) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      // The server explains stock problems ("Not enough stock for…").
      alert(err?.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Order editing (items + finish) ────────────────────────────────────────
  const draftTotal = useMemo(() => {
    if (!draftOrder) return 0;
    // Same rule as the server: the 3D duo offer comes off complete pairs.
    return draftOrder.products.reduce((sum, p) => sum + p.price * p.quantity, 0) - duoDiscount(draftOrder.products).amount;
  }, [draftOrder]);

  // Compare draft vs selected to know whether the Save button should appear.
  const isDirty = useMemo(() => {
    if (!selectedOrder || !draftOrder) return false;
    if ((selectedOrder.finish ?? null) !== (draftOrder.finish ?? null)) return true;
    if (selectedOrder.products.length !== draftOrder.products.length) return true;
    return selectedOrder.products.some((p, i) => {
      const d = draftOrder.products[i];
      return !d || d.productId !== p.productId || d.quantity !== p.quantity;
    });
  }, [selectedOrder, draftOrder]);

  const adjustDraftQuantity = (idx: number, delta: number) => {
    setDraftOrder((prev) => {
      if (!prev) return prev;
      const next = { ...prev, products: prev.products.map((p) => ({ ...p })) };
      const item = next.products[idx];
      if (!item) return prev;
      const newQty = Math.max(1, item.quantity + delta);
      if (newQty === item.quantity) return prev;
      item.quantity = newQty;
      return next;
    });
  };

  const removeDraftItem = (idx: number) => {
    setDraftOrder((prev) => {
      if (!prev) return prev;
      // Don't allow the admin to leave an order with zero items — that would
      // fail the backend's "non-empty array" guard anyway.
      if (prev.products.length <= 1) {
        setEditError('An order needs at least one item. Cancel the order instead if it should be voided.');
        return prev;
      }
      return { ...prev, products: prev.products.filter((_, i) => i !== idx) };
    });
  };

  const setDraftFinish = (finish: OrderFinish) => {
    setDraftOrder((prev) => (prev ? { ...prev, finish } : prev));
  };

  const handleSaveEdits = async () => {
    if (!draftOrder || !selectedOrder) return;
    setIsSavingEdits(true);
    setEditError(null);
    try {
      const updated = await updateOrder(selectedOrder._id, {
        products: draftOrder.products,
        finish: draftOrder.finish ?? null,
      });
      // Reflect server-authoritative state into both the sheet and the list.
      openOrder(updated);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch (err: any) {
      setEditError(err?.message || 'Failed to save changes. Try again.');
    } finally {
      setIsSavingEdits(false);
    }
  };

  const resetDraft = () => {
    if (selectedOrder) {
      setDraftOrder({ ...selectedOrder, products: selectedOrder.products.map((p) => ({ ...p })) });
    }
    setEditError(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qRef = q.replace(/^#/, '');
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        (qRef !== '' && String(o.orderNumber).includes(qRef)) ||
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

  // Phone filter chips: "All" + one per status, with counts.
  const filterChips: { key: Status | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: orders.length },
    ...kpiCards.map((k) => ({ key: k.filter, label: k.label, count: k.count })),
  ];

  const hasFilters = search.trim() !== '' || filterStatus !== 'all';

  // Detail sheet data. The draft only counts if it belongs to the open order.
  const viewOrder =
    selectedOrder && draftOrder && draftOrder._id === selectedOrder._id ? draftOrder : selectedOrder;
  const selectedAddress = selectedOrder ? parseAddress(selectedOrder.customer.address) : null;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white font-inter">
        <AdminSidebar onLogout={logout} />

        {/* overflow-x-clip (not auto) on phones so the filter chips can stick
            under the top bar; md+ keeps the original scroll container. */}
        <main className="min-w-0 flex-1 overflow-x-clip px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-20 sm:px-6 md:overflow-auto md:p-14">
          {/* Header */}
          <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8 lg:mb-16">
            <div className="min-w-0">
              <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-chalk sm:text-4xl">
                Orders
              </h1>
              <p className="mt-1 text-[13px] text-smoke">{orders.length} orders from the website</p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => exportCSV(filtered)}
                className="flex h-11 flex-1 sm:flex-none items-center justify-center gap-2 px-4 md:px-5 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-500 text-[12px] md:text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={loadOrders}
                disabled={isLoading}
                aria-label="Refresh orders"
                title="Refresh orders"
                className="h-11 w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all flex-shrink-0 disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          {/* KPI mini-cards (tablet / desktop — phones get the chip row below) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {kpiCards.map((k) => (
              <motion.button
                key={k.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setFilterStatus(filterStatus === k.filter ? 'all' : k.filter)}
                aria-pressed={filterStatus === k.filter}
                className={`rounded-2xl lg:rounded-3xl border p-5 lg:p-8 text-left transition-all ${
                  filterStatus === k.filter
                    ? k.activeClass
                    : 'border-zinc-900 bg-zinc-900/30 hover:border-zinc-700'
                }`}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3 lg:mb-4">
                  {k.label}
                </p>
                <p className="text-3xl lg:text-4xl font-black tracking-tighter font-jakarta">{k.count}</p>
              </motion.button>
            ))}
          </div>

          {/* Search + Status Filter bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-1 md:mb-8 lg:mb-10">
            <div className="relative flex-1">
              <input
                type="search"
                enterKeyHint="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone or order #"
                aria-label="Search orders"
                className="h-12 md:h-auto w-full appearance-none bg-zinc-900 border border-zinc-900 rounded-xl md:rounded-2xl pl-11 pr-12 md:py-3.5 text-base md:text-[11px] font-semibold focus:outline-none focus:border-blue-600 transition-all text-white placeholder-zinc-700 [&::-webkit-search-cancel-button]:hidden"
              />
              <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
              aria-label="Filter by status"
              className="hidden md:block bg-zinc-900 border border-zinc-900 rounded-2xl px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-zinc-400 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Phones: status chips with counts, stuck under the top bar */}
          <div className="sticky top-[60px] z-20 -mx-4 mb-3 bg-asphalt/90 px-4 pb-2 pt-3 backdrop-blur-xl sm:-mx-6 sm:px-6 md:hidden">
            <div
              role="group"
              aria-label="Filter by status"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6"
            >
              {filterChips.map((c) => {
                const active = filterStatus === c.key;
                const activeClass = c.key === 'all' ? 'border-chalk bg-chalk text-asphalt' : orderStatusStyle(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilterStatus(c.key)}
                    className={`flex h-11 flex-none items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors ${
                      active ? activeClass : 'border-white/10 bg-white/[0.03] text-silver hover:bg-white/[0.06]'
                    }`}
                  >
                    {c.label}
                    <span className="tabular-nums text-[12px] opacity-75">{c.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="flex-1 text-rose-400 text-sm font-bold break-words">Error: {error}</p>
              <button
                type="button"
                onClick={loadOrders}
                className="h-11 rounded-xl border border-rose-500/30 px-5 text-[13px] font-semibold text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 md:py-32">
              <Loader size="lg" className="text-blue-600" />
              <p className="mt-8 text-sm font-black uppercase tracking-widest text-zinc-600">
                Loading Orders...
              </p>
            </div>
          )}

          {/* Orders */}
          {!isLoading && !error && (
            <>
              {filtered.length === 0 ? (
                <div className="py-20 md:py-24 text-center">
                  <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">
                    No orders match your filters
                  </p>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={() => { setSearch(''); setFilterStatus('all'); }}
                      className="mt-5 h-11 rounded-xl border border-zinc-800 px-5 text-[13px] font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {search.trim() && (
                    <p className="mb-3 text-[12px] font-medium text-zinc-500 lg:hidden">
                      {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                    </p>
                  )}

                  {/* Desktop table */}
                  <div className="hidden lg:block rounded-[2.5rem] border border-zinc-900 bg-zinc-900/20 overflow-x-auto overflow-y-hidden shadow-2xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                          <th className="px-5 py-6 xl:px-8 xl:py-7">Order Ref</th>
                          <th className="px-5 py-6 xl:px-8 xl:py-7">Date</th>
                          <th className="px-5 py-6 xl:px-8 xl:py-7">Customer</th>
                          <th className="px-5 py-6 xl:px-8 xl:py-7">Items</th>
                          <th className="px-5 py-6 xl:px-8 xl:py-7 text-right">Total</th>
                          <th className="px-5 py-6 xl:px-8 xl:py-7 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60">
                        {filtered.map((order, idx) => {
                          const { full, notes } = parseAddress(order.customer.address);
                          return (
                            <motion.tr
                              key={order._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx, 12) * 0.03 }}
                              onClick={() => openOrder(order)}
                              className="hover:bg-zinc-800/10 transition-colors align-top cursor-pointer"
                            >
                              <td className="px-5 py-6 xl:px-8 xl:py-7">
                                <span className="text-[12px] font-black text-blue-500">
                                  #{order.orderNumber}
                                </span>
                                {order.paymentMethod === 'cod' && (
                                  <span className="ml-2 px-2 py-0.5 rounded bg-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                    COD
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-6 xl:px-8 xl:py-7">
                                <p className="text-[11px] font-bold text-zinc-400">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-zinc-700 mt-0.5">
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                              </td>
                              <td className="px-5 py-6 xl:px-8 xl:py-7">
                                <p className="text-[12px] font-black uppercase tracking-tight text-white break-words">
                                  {customerName(order.customer)}
                                </p>
                                <p className="text-[11px] text-zinc-500 font-bold mt-1 tabular-nums">{order.customer.phone}</p>
                                <p className="text-[10px] text-zinc-700 mt-1 max-w-[200px] leading-relaxed break-words">
                                  {full}
                                </p>
                                {notes && (
                                  <p className="text-[10px] text-amber-600/80 mt-1 italic max-w-[200px] break-words">
                                    Note: {notes}
                                  </p>
                                )}
                              </td>
                              <td className="px-5 py-6 xl:px-8 xl:py-7">
                                <div className="space-y-1.5">
                                  {order.products.map((p, i) => (
                                    <p key={i} className="text-[11px] text-zinc-400 font-medium break-words">
                                      <span className="text-zinc-600 font-black">{p.quantity}×</span>{' '}
                                      {p.name}
                                    </p>
                                  ))}
                                </div>
                                {order.finish && (
                                  <span className="mt-2 inline-block px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-[9px] font-black uppercase tracking-widest text-blue-300">
                                    {order.finish}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-6 xl:px-8 xl:py-7 text-right whitespace-nowrap">
                                <span className="text-[14px] font-black text-white">
                                  {order.totalPrice.toFixed(0)}
                                </span>
                                <span className="text-[10px] text-zinc-700 ml-1">MAD</span>
                                {order.discount && (
                                  <span className="block text-[12px] font-semibold text-blue-400">
                                    {order.discount.label} −{order.discount.amount}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-6 xl:px-8 xl:py-7">
                                <div className="flex flex-col items-center gap-3">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${orderStatusStyle(order.status)}`}>
                                    {order.status}
                                  </span>
                                  <select
                                    value={order.status}
                                    disabled={updatingId === order._id}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(order._id, e.target.value as Status);
                                    }}
                                    aria-label={`Status of order #${order.orderNumber}`}
                                    className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer text-center ${
                                      updatingId === order._id ? 'opacity-40 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    {STATUS_OPTIONS.map((s) => (
                                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                  </select>
                                  {updatingId === order._id && (
                                    <span className="text-[10px] font-bold text-blue-500 animate-pulse">Saving…</span>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Phones / tablets: stacked order cards */}
                  <div className="lg:hidden space-y-3">
                    {filtered.map((order, idx) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        index={idx}
                        updating={updatingId === order._id}
                        onStatusChange={(s) => handleStatusChange(order._id, s)}
                        onOpen={() => openOrder(order)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>

        {/* Order details — bottom sheet on phones, centred dialog on md+ */}
        {selectedOrder && viewOrder && selectedAddress && (
          <div
            ref={dialogRef}
            className="fixed inset-0 z-[80] flex items-end md:items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm"
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
              ref={sheetRef}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] supports-[height:100dvh]:max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl md:rounded-[2.5rem] border border-b-0 md:border-b border-zinc-800 bg-zinc-950 shadow-2xl"
            >
              {/* Sticky header: grab handle, order ref, close */}
              <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0E0F11]/95 backdrop-blur-xl px-4 pt-2.5 pb-3 sm:px-6 md:px-10 md:pt-8 md:pb-6 lg:px-14">
                <div aria-hidden="true" className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-white/20 md:hidden" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={LABEL}>Order details</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h2 id="modal-title" className="text-xl md:text-3xl font-black text-blue-500 tabular-nums">
                        #{selectedOrder.orderNumber}
                      </h2>
                      <StatusBadge status={selectedOrder.status} />
                      {selectedOrder.finish && (
                        <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                          {selectedOrder.finish}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] text-zinc-600">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="h-11 w-11 md:h-12 md:w-12 flex flex-none items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all touch-manipulation"
                    aria-label="Close order details"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                className={`space-y-4 md:space-y-6 px-4 pt-4 sm:px-6 md:px-10 md:pt-8 lg:px-14 ${
                  isDirty ? 'pb-4 md:pb-8' : 'pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-12'
                }`}
              >
                {/* Status — the quick action, first */}
                <section>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className={LABEL}>Status</h3>
                    {updatingId === selectedOrder._id && (
                      <span className="text-[12px] font-medium text-blue-500 animate-pulse">Saving…</span>
                    )}
                  </div>
                  <StatusPills
                    value={selectedOrder.status}
                    disabled={updatingId === selectedOrder._id}
                    onChange={(s) => {
                      handleStatusChange(selectedOrder._id, s);
                      setSelectedOrder({ ...selectedOrder, status: s });
                    }}
                  />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Customer */}
                  <section className={SECTION}>
                    <h3 className={LABEL}>Customer</h3>
                    <p className="mt-3 text-lg font-black text-white leading-snug break-words">
                      {customerName(selectedOrder.customer)}
                    </p>
                    <p className="mt-0.5 text-base font-bold text-zinc-300 tabular-nums select-all">
                      {selectedOrder.customer.phone}
                    </p>
                    <ContactButtons
                      className="mt-4"
                      phone={selectedOrder.customer.phone}
                      message={whatsappGreeting(selectedOrder)}
                    />
                    <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
                      <div>
                        <p className={FIELD_LABEL}>Delivery address</p>
                        <p className="mt-1 text-[14px] font-medium text-zinc-400 leading-relaxed break-words">
                          {selectedAddress.full}
                        </p>
                      </div>
                      {selectedAddress.notes && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">Customer notes</p>
                          <p className="mt-1 text-[14px] font-medium text-amber-500/80 leading-relaxed italic break-words">
                            {selectedAddress.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Order information */}
                  <section className={SECTION}>
                    <h3 className={LABEL}>Order information</h3>
                    <dl className="mt-3 space-y-4">
                      <div>
                        <dt className={FIELD_LABEL}>Payment method</dt>
                        <dd className="mt-1 text-[15px] font-black text-white uppercase">
                          {paymentLabel(selectedOrder.paymentMethod)}
                        </dd>
                      </div>
                      <div>
                        <dt className={FIELD_LABEL}>Order date</dt>
                        <dd className="mt-1 text-[15px] font-bold text-zinc-300">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </dd>
                        <dd className="text-[13px] text-zinc-600 mt-0.5">
                          {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                        </dd>
                      </div>
                      <div>
                        <dt className={FIELD_LABEL}>Order ID</dt>
                        <dd className="mt-1 text-[12px] font-mono text-zinc-500 break-all">{selectedOrder._id}</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                {/* Products — editable */}
                <section className={SECTION}>
                  <div className="mb-3 md:mb-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className={LABEL}>Ordered items</h3>
                    <p className="text-[12px] font-medium text-zinc-500">Tap − / + to adjust quantity</p>
                  </div>
                  <div className="space-y-2.5 md:space-y-3">
                    {viewOrder.products.map((product, idx) => (
                      <div
                        key={`${product.productId}-${idx}`}
                        className="rounded-xl md:rounded-2xl bg-zinc-950 border border-zinc-900 p-3 sm:p-4 md:p-5"
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] md:text-base font-black text-white leading-snug break-words">{product.name}</p>
                            <p className="mt-0.5 text-[13px] text-zinc-600 font-bold tabular-nums">
                              {product.price.toFixed(0)} MAD each
                            </p>
                          </div>
                          {/* Remove line */}
                          <button
                            type="button"
                            onClick={() => removeDraftItem(idx)}
                            disabled={isSavingEdits || viewOrder.products.length <= 1}
                            aria-label="Remove item"
                            title="Remove item"
                            className="-mr-1 -mt-1 h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          {/* Quantity stepper */}
                          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
                            <button
                              type="button"
                              onClick={() => adjustDraftQuantity(idx, -1)}
                              disabled={isSavingEdits || product.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="h-11 w-11 md:h-9 md:w-9 rounded-lg flex items-center justify-center text-lg md:text-base font-black text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="min-w-[2rem] text-center text-base font-black text-white tabular-nums">
                              {product.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustDraftQuantity(idx, +1)}
                              disabled={isSavingEdits}
                              aria-label="Increase quantity"
                              className="h-11 w-11 md:h-9 md:w-9 rounded-lg flex items-center justify-center text-lg md:text-base font-black text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-[15px] font-black text-white tabular-nums whitespace-nowrap">
                            {(product.price * product.quantity).toFixed(0)}
                            <span className="ml-1 text-[12px] text-zinc-600">MAD</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {editError && !isDirty && (
                    <p className="mt-3 text-[13px] text-rose-400">{editError}</p>
                  )}
                </section>

                {/* Finish — Brilliant / Matte (per-order) */}
                <section className={SECTION}>
                  <h3 className={LABEL}>Finish · الوجه</h3>
                  <p className="mt-1.5 text-[13px] text-zinc-500">
                    Confirmed with the customer · ttabt m3a l-customer
                  </p>
                  <div className="mt-3 md:mt-5 grid grid-cols-2 gap-2.5 sm:gap-4">
                    {(['brilliant', 'matte'] as const).map((opt) => {
                      const active = (draftOrder?.finish ?? null) === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDraftFinish(opt)}
                          disabled={isSavingEdits}
                          aria-pressed={active}
                          className={`min-h-[64px] rounded-xl sm:rounded-2xl border-2 p-3.5 sm:p-5 text-left transition-all ${
                            active
                              ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          } ${isSavingEdits ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <p className={`text-sm sm:text-base font-black uppercase tracking-widest ${active ? 'text-blue-400' : 'text-zinc-200'}`}>
                            {opt}
                          </p>
                          <p className="text-[12px] sm:text-xs text-zinc-500 mt-1">
                            {opt === 'brilliant' ? 'Glossy · lamɛa' : 'No shine · bla lamɛa'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {(draftOrder?.finish ?? null) !== null && (
                    <button
                      type="button"
                      onClick={() => setDraftFinish(null)}
                      disabled={isSavingEdits}
                      className="mt-2 -ml-2 h-11 px-2 text-[12px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30"
                    >
                      Clear selection
                    </button>
                  )}
                </section>

                {/* Total */}
                <section className="rounded-2xl md:rounded-3xl border-2 border-blue-600/30 bg-blue-950/20 p-4 sm:p-6 md:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600 mb-1.5">
                        Total Amount
                      </p>
                      <p className="text-3xl md:text-4xl lg:text-5xl font-black text-white tabular-nums">
                        {selectedOrder.totalPrice.toFixed(0)}
                        <span className="text-base md:text-xl text-zinc-600 ml-1.5 md:ml-2">MAD</span>
                      </p>
                      {selectedOrder.discount && (
                        <p className="mt-1 text-[13px] font-semibold text-blue-400">
                          Includes {selectedOrder.discount.label}: −{selectedOrder.discount.amount} MAD
                        </p>
                      )}
                    </div>
                    <p className="text-[13px] font-semibold text-zinc-400">
                      {paymentLabel(selectedOrder.paymentMethod)}
                    </p>
                  </div>
                </section>
              </div>

              {/* Save bar — sticks to the bottom of the sheet while there are edits */}
              {isDirty && (
                <div className="sticky bottom-0 z-10 border-t border-amber-500/25 bg-[#0E0F11]/95 backdrop-blur-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:py-5 lg:px-14">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-black uppercase tracking-widest text-amber-400">
                        Unsaved changes
                      </p>
                      <p className="text-[13px] text-zinc-400 mt-0.5">
                        New total: <span className="text-white font-bold">{draftTotal.toFixed(0)} MAD</span>
                      </p>
                      {editError && (
                        <p className="text-[13px] text-rose-400 mt-1 break-words">{editError}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                      <button
                        type="button"
                        onClick={resetDraft}
                        disabled={isSavingEdits}
                        className="h-12 sm:h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-3 sm:px-5 text-[13px] font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-900 transition-colors disabled:opacity-30"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdits}
                        disabled={isSavingEdits}
                        className="h-12 sm:h-11 rounded-xl bg-blue-600 px-3 sm:px-5 text-[13px] font-bold uppercase tracking-widest text-white hover:bg-blue-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSavingEdits ? 'Saving…' : 'Save changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

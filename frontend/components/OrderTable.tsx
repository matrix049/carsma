'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Order, updateOrderStatus } from '@/lib/apiServices';
import { telHref, whatsappHref } from '@/lib/phone';

// ── Shared order bits ────────────────────────────────────────────────────────
// Used by this table and by the admin Orders page (app/admin/orders) so the
// phone-first order card, status pills and Call / WhatsApp buttons look and
// behave the same everywhere.

export const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;
export type OrderStatus = Order['status'];

export function orderStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'pending':   return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:          return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
}

/** Checkout copies a one-word name into both fields ("Ahmed Ahmed") — show it once. */
export function customerName(customer: Order['customer']) {
  const first = (customer.firstName || '').trim();
  const last = (customer.lastName || '').trim();
  return last && last.toLowerCase() !== first.toLowerCase() ? `${first} ${last}` : first || last;
}

/** Checkout stores "street, city"; older orders append "| Notes: …". */
export function parseAddress(address: string) {
  const [main = '', notes = ''] = (address || '').split('| Notes:');
  const full = main.trim().replace(/,\s*$/, '');
  const parts = full.split(',').map((s) => s.trim()).filter(Boolean);
  return { full, city: parts.length > 1 ? parts[parts.length - 1] : '', notes: notes.trim() };
}

export function paymentLabel(method: string) {
  return method === 'cod' ? 'Cash on delivery' : (method || '').toUpperCase();
}

/** "Today 14:32", "Yesterday 09:10", "28 Oct 14:32" — short enough for a card. */
export function formatOrderDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return `Today ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  if (d.getFullYear() !== today.getFullYear()) opts.year = 'numeric';
  return `${d.toLocaleDateString([], opts)} ${time}`;
}

/** Pre-filled first line for the WhatsApp chat (editable before sending). */
export function whatsappGreeting(order: Order) {
  const first = (order.customer.firstName || '').trim();
  return `Salam${first ? ` ${first}` : ''}, this is L7IT about your order #${order.orderNumber}.`;
}

const ICON_PHONE = 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z';
const ICON_CHAT = 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z';
const ICON_PIN = 'M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z';
const ICON_CHEVRON = 'M9 6l6 6-6 6';

function Icon({ d, className = 'h-[18px] w-[18px]' }: { d: string; className?: string }) {
  return (
    <svg className={`flex-none ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  return (
    <span className={`inline-flex flex-none items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${orderStatusStyle(status)} ${className}`}>
      {status}
    </span>
  );
}

/** One-tap status changer: four 44px segments, the current one in its status colour. */
export function StatusPills({
  value,
  onChange,
  disabled = false,
}: {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label="Order status" className="grid grid-cols-4 gap-1 rounded-2xl bg-white/[0.03] p-1 ring-1 ring-inset ring-white/[0.08]">
      {ORDER_STATUSES.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => { if (!active) onChange(s); }}
            className={`flex h-11 min-w-0 items-center justify-center rounded-xl border px-1 text-[12px] font-semibold capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:text-[13px] ${
              active ? orderStatusStyle(s) : 'border-transparent text-smoke hover:bg-white/[0.05] hover:text-chalk'
            }`}
          >
            <span className="truncate">{s}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Tap-to-call and WhatsApp buttons (44px). `children` are extra trailing buttons. */
export function ContactButtons({
  phone,
  message,
  className = '',
  children,
}: {
  phone: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const hasNumber = (phone || '').replace(/\D/g, '').length >= 6;
  const wa = hasNumber ? whatsappHref(phone, message) : null;
  if (!hasNumber && !children) return null;

  const base = 'flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium ring-1 ring-inset transition-colors';
  return (
    <div className={`flex gap-2 ${className}`}>
      {hasNumber && (
        <a href={telHref(phone)} className={`${base} bg-white/[0.04] text-chalk ring-white/10 hover:bg-white/[0.08] active:bg-white/[0.1]`}>
          <Icon d={ICON_PHONE} />
          Call
        </a>
      )}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-emerald-500/10 text-emerald-300 ring-emerald-500/25 hover:bg-emerald-500/15 active:bg-emerald-500/20`}
        >
          <Icon d={ICON_CHAT} />
          WhatsApp
        </a>
      )}
      {children}
    </div>
  );
}

const CHIP = 'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider';

interface OrderCardProps {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  /** True while this order's status is being saved. */
  updating?: boolean;
  /** Opens the order details; the card body and a chevron button call it. */
  onOpen?: () => void;
  /** Position in the list, for the staggered entrance. */
  index?: number;
}

/**
 * Phone-first order card: who → what → how much → status → actions.
 * Status pills and Call / WhatsApp sit outside the tappable body, so no
 * button is nested inside another.
 */
export function OrderCard({ order, onStatusChange, updating = false, onOpen, index = 0 }: OrderCardProps) {
  const { city, notes } = parseAddress(order.customer.address);
  const askFinish = !order.finish && (order.status === 'pending' || order.status === 'confirmed');

  const body = (
    <>
      {/* Ref + date + status */}
      <span className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="font-mono text-[13px] font-semibold text-xenon">#{order.orderNumber}</span>
          <span className="truncate text-[12px] text-smoke">{formatOrderDate(order.createdAt)}</span>
        </span>
        <StatusBadge status={order.status} />
      </span>

      {/* Who */}
      <span className="mt-3 block break-words text-base font-semibold leading-snug text-chalk">
        {customerName(order.customer)}
      </span>
      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-smoke">
        {city && (
          <span className="inline-flex min-w-0 items-center gap-1 text-silver">
            <Icon d={ICON_PIN} className="h-3.5 w-3.5" />
            <span className="break-words">{city}</span>
          </span>
        )}
        <span className="tabular-nums">{order.customer.phone}</span>
      </span>
      {notes && (
        <span className="mt-2 break-words rounded-lg bg-amber-500/[0.07] px-3 py-2 text-[13px] italic leading-snug text-amber-300/90 line-clamp-3">
          Note: {notes}
        </span>
      )}

      {/* What */}
      <span className="mt-3 block space-y-1.5 border-t border-white/[0.06] pt-3">
        {order.products.map((p, i) => (
          <span key={i} className="flex gap-2 text-[14px] leading-snug">
            <span className="flex-none font-semibold tabular-nums text-chalk">{p.quantity}×</span>
            <span className="min-w-0 break-words text-silver">{p.name}</span>
          </span>
        ))}
      </span>

      {/* How much */}
      <span className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xl font-semibold tabular-nums text-chalk">
          {order.totalPrice.toFixed(0)}
          <span className="ml-1 text-[12px] font-medium text-smoke">MAD</span>
        </span>
        <span className="flex flex-wrap items-center justify-end gap-1.5">
          {order.finish ? (
            <span className={`${CHIP} border-xenon/25 bg-xenon/10 text-xenon`}>{order.finish}</span>
          ) : askFinish ? (
            <span className={`${CHIP} border-amber-500/25 bg-amber-500/10 text-amber-300`}>No finish</span>
          ) : null}
          <span className={`${CHIP} border-white/10 bg-white/[0.04] text-silver`}>
            {order.paymentMethod === 'cod' ? 'COD' : paymentLabel(order.paymentMethod)}
          </span>
        </span>
      </span>
    </>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="overflow-hidden rounded-2xl bg-carbon ring-1 ring-white/[0.08]"
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="block w-full p-4 text-left transition-colors hover:bg-white/[0.03] active:bg-white/[0.05]"
        >
          {body}
        </button>
      ) : (
        <div className="p-4">{body}</div>
      )}

      {/* Status + actions */}
      <div className="space-y-2.5 border-t border-white/[0.06] px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-smoke">Status</span>
          {updating && <span className="animate-pulse text-[12px] font-medium text-xenon">Saving…</span>}
        </div>
        <StatusPills value={order.status} onChange={onStatusChange} disabled={updating} />
        <ContactButtons phone={order.customer.phone} message={whatsappGreeting(order)}>
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              aria-label={`Open order #${order.orderNumber}`}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[0.04] text-silver ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-chalk"
            >
              <Icon d={ICON_CHEVRON} />
            </button>
          )}
        </ContactButtons>
      </div>
    </motion.article>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────
interface OrderTableProps {
  orders: Order[];
  onOrderUpdated: () => void;
}

export default function OrderTable({ orders, onOrderUpdated }: OrderTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      onOrderUpdated();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-carbon p-12 text-center ring-1 ring-white/[0.08]">
        <p className="text-sm text-smoke">No orders found.</p>
      </div>
    );
  }

  // Reverse so newest orders are explicitly at top
  const sortedOrders = [...orders].reverse();

  return (
    <>
      {/* Phones / tablets: stacked cards */}
      <div className="space-y-3 lg:hidden">
        {sortedOrders.map((order, idx) => (
          <OrderCard
            key={order._id}
            order={order}
            index={idx}
            updating={updatingId === order._id}
            onStatusChange={(s) => handleStatusChange(order._id, s)}
          />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl bg-carbon ring-1 ring-white/[0.08] lg:block">
        <table className="w-full text-left text-sm text-silver">
          <thead className="border-b border-white/[0.07] text-[11px] uppercase tracking-[0.18em] text-smoke">
            <tr>
              <th className="px-6 py-4 font-semibold">Order</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {sortedOrders.map((order) => {
              const { full, notes } = parseAddress(order.customer.address);
              return (
                <tr key={order._id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 align-top">
                    <div className="font-mono text-[13px] font-semibold text-xenon" title={order._id}>
                      #{order.orderNumber}
                    </div>
                    <div className="mt-2 text-xs font-medium text-smoke">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <br />
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                    {order.paymentMethod === 'cod' && (
                      <span className={`${CHIP} mt-3 border-white/10 bg-white/[0.04] text-silver`}>COD</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="mb-1 text-sm font-semibold text-chalk">{customerName(order.customer)}</div>
                    <div className="mb-3 text-xs font-medium tabular-nums text-smoke">{order.customer.phone}</div>
                    <div className="max-w-xs whitespace-pre-wrap break-words rounded-lg bg-white/[0.03] p-3 text-xs leading-relaxed text-silver ring-1 ring-inset ring-white/[0.06]">
                      <span className="mb-1 block font-semibold text-smoke">Address:</span>
                      {full}
                    </div>
                    {notes && (
                      <div className="mt-3 max-w-xs break-words rounded-lg bg-amber-500/[0.07] p-3 text-xs leading-relaxed text-amber-200 ring-1 ring-inset ring-amber-500/20">
                        <span className="mb-1 block font-semibold text-amber-400">Cust Notes:</span>
                        {notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-3">
                      {order.products.map((p, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className="font-semibold text-smoke">{p.quantity}x</span>
                          <span className="font-medium text-chalk">{p.name}</span>
                        </div>
                      ))}
                    </div>
                    {order.finish && (
                      <span className={`${CHIP} mt-3 border-xenon/25 bg-xenon/10 text-xenon`}>{order.finish}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 align-top text-lg font-semibold text-chalk">
                    {order.totalPrice.toFixed(0)} <span className="text-sm text-smoke">MAD</span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex max-w-[160px] flex-col gap-3">
                      <StatusBadge status={order.status} className="justify-center" />
                      <div className="relative mt-1">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                          disabled={updatingId === order._id}
                          className={`block w-full appearance-none rounded-lg border border-white/10 bg-carbon-2 px-3 py-2 pr-8 text-sm font-medium capitalize text-chalk focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${updatingId === order._id ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-smoke">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      {updatingId === order._id && <span className="animate-pulse text-xs font-medium text-xenon">Updating...</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

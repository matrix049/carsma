'use client';

import React, { useState } from 'react';
import { CustomOrder, RequestBrief, updateCustomOrderStatus } from '@/lib/apiServices';
import { motion } from 'framer-motion';
import { ChatbotBadge, ChatTranscript } from '@/components/ChatTranscript';
import { BriefView, ContactButtons, briefFromNotes, timeAgo } from '@/components/admin/RequestBrief';

interface CustomOrderTableProps {
  orders: CustomOrder[];
  onOrderUpdated: () => void;
}

const STATUSES: { value: CustomOrder['status']; label: string; badge: string }[] = [
  { value: 'pending', label: 'New', badge: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  { value: 'reviewed', label: 'Reviewed', badge: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' },
  { value: 'contacted', label: 'Contacted', badge: 'bg-purple-500/10 text-purple-400 ring-purple-500/20' },
  { value: 'completed', label: 'Completed', badge: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
  { value: 'cancelled', label: 'Cancelled', badge: 'bg-rose-500/10 text-rose-400 ring-rose-500/20' },
];

/** The essentials for every request: who, how to reach them, and exactly what they want. */
function briefOf(order: CustomOrder): { brief: RequestBrief; note?: string } {
  if (order.source === 'chatbot') {
    const brief = order.brief ?? briefFromNotes(order.notes);
    if (brief) return { brief };
  }
  const car = [order.carDetails.carName, order.carDetails.model !== order.carDetails.carName ? order.carDetails.model : '']
    .filter(Boolean)
    .join(' ');
  const year = order.carDetails.year && order.carDetails.year !== '—' ? ` (${order.carDetails.year})` : '';
  return { brief: { want: `Custom piece of ${car}${year}` }, note: order.notes };
}

export default function CustomOrderTable({ orders, onOrderUpdated }: CustomOrderTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (requestId: string, newStatus: CustomOrder['status']) => {
    setUpdatingId(requestId);
    try {
      await updateCustomOrderStatus(requestId, newStatus);
      onOrderUpdated();
    } catch (error) {
      console.error('Failed to update custom order status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-carbon py-20 text-center ring-1 ring-white/[0.08]">
        <p className="text-[14px] text-smoke">No custom requests here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {orders.map((order, idx) => {
        const name = [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ');
        const { brief, note } = briefOf(order);
        const status = STATUSES.find((s) => s.value === order.status) ?? STATUSES[0];
        return (
          <motion.article
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx, 8) * 0.03 }}
            className={`flex min-w-0 flex-col rounded-2xl bg-carbon p-4 ring-1 sm:p-5 ${order.status === 'pending' ? 'ring-amber-500/25' : 'ring-white/[0.08]'}`}
          >
            {/* Who */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-[18px] font-semibold text-chalk">{name || 'No name'}</h3>
                <p className="mt-0.5 text-[14px] text-silver-light" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {order.customer.phone}
                </p>
              </div>
              <div className="flex flex-none flex-col items-end gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${status.badge}`}>{status.label}</span>
                <time dateTime={order.createdAt} title={new Date(order.createdAt).toLocaleString()} className="text-[12px] text-smoke">
                  {timeAgo(order.createdAt)}
                </time>
              </div>
            </div>
            {order.source === 'chatbot' && <ChatbotBadge />}

            {/* What */}
            <div className="mt-4 rounded-xl bg-white/[0.025] p-3.5 ring-1 ring-white/[0.05]">
              <BriefView brief={brief} />
              {note && (
                <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-silver" dir="auto">
                  <span className="font-semibold text-smoke">Note: </span>
                  {note}
                </p>
              )}
            </div>

            {/* Act */}
            <div className="mt-4 space-y-2.5">
              <ContactButtons phone={order.customer.phone} whatsappText={`Salam ${order.customer.firstName || ''}, L7IT hna 👋 Bkhosos talab dyalek: ${brief.want}`} />
              <label className="relative block">
                <span className="sr-only">Status</span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value as CustomOrder['status'])}
                  disabled={updatingId === order._id}
                  className="h-11 w-full cursor-pointer appearance-none rounded-full bg-carbon-2 pl-4 pr-10 text-[14px] font-medium text-chalk ring-1 ring-white/10 focus:outline-none focus:ring-xenon/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.value === 'pending' ? 'Status: New' : `Status: ${s.label}`}
                    </option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={updatingId === order._id ? 'M12 4v4m0 8v4m8-8h-4M8 12H4' : 'M6 9l6 6 6-6'} />
                </svg>
              </label>
            </div>

            <ChatTranscript transcript={order.transcript} />
          </motion.article>
        );
      })}
    </div>
  );
}

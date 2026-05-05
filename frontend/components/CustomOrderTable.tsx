'use client';

import React, { useState } from 'react';
import { CustomOrder, updateCustomOrderStatus } from '@/lib/apiServices';
import { motion } from 'framer-motion';

interface CustomOrderTableProps {
  orders: CustomOrder[];
  onOrderUpdated: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  reviewed:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function CustomOrderTable({ orders, onOrderUpdated }: CustomOrderTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (requestId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CustomOrder['status'];
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
      <div className="py-24 text-center">
        <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">No custom requests found.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop table (lg+) ──────────────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
              <th className="px-8 py-7">Date</th>
              <th className="px-8 py-7">Customer</th>
              <th className="px-8 py-7">Car Details</th>
              <th className="px-8 py-7">Notes</th>
              <th className="px-8 py-7 text-center">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {orders.map((order, idx) => (
              <motion.tr
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="hover:bg-zinc-800/10 transition-colors align-top"
              >
                <td className="px-8 py-7 whitespace-nowrap">
                  <p className="text-[10px] font-bold text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-[9px] text-zinc-700 mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </td>
                <td className="px-8 py-7">
                  <p className="text-[11px] font-black uppercase tracking-tight text-white">
                    {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1">{order.customer.phone}</p>
                  {order.customer.email && (
                    <p className="text-[9px] text-zinc-700 mt-0.5">{order.customer.email}</p>
                  )}
                </td>
                <td className="px-8 py-7">
                  <p className="text-[11px] font-black text-white truncate max-w-[150px]">{order.carDetails.carName}</p>
                  {order.carDetails.model && order.carDetails.model !== order.carDetails.carName && (
                    <p className="text-[10px] text-zinc-500 mt-1">{order.carDetails.model}</p>
                  )}
                  <span className="mt-2 inline-block rounded bg-zinc-800 px-2 py-0.5 text-[9px] font-black text-zinc-400">
                    {order.carDetails.year}
                  </span>
                </td>
                <td className="px-8 py-7">
                  <p className="text-[10px] leading-relaxed max-w-xs whitespace-pre-wrap italic text-zinc-500">
                    {order.notes || 'No notes provided.'}
                  </p>
                </td>
                <td className="px-8 py-7">
                  <div className="flex flex-col items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_BADGE[order.status] || STATUS_BADGE['pending']}`}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e)}
                      disabled={updatingId === order._id}
                      className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer ${updatingId === order._id ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
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

      {/* ── Mobile / tablet cards (< lg) ─────────────────────────────── */}
      <div className="lg:hidden divide-y divide-zinc-900/60">
        {orders.map((order, idx) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="p-5"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-zinc-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${STATUS_BADGE[order.status] || STATUS_BADGE['pending']}`}>
                {order.status}
              </span>
            </div>

            {/* Customer */}
            <p className="text-[13px] font-black uppercase tracking-tight text-white">
              {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ')}
            </p>
            <p className="text-[11px] text-zinc-500 font-bold mt-0.5">{order.customer.phone}</p>
            {order.customer.email && (
              <p className="text-[10px] text-zinc-700 mt-0.5">{order.customer.email}</p>
            )}

            {/* Car */}
            <div className="mt-3 pt-3 border-t border-zinc-900/60">
              <p className="text-[11px] font-black text-white">{order.carDetails.carName}</p>
              <div className="flex items-center gap-2 mt-1">
                {order.carDetails.model && order.carDetails.model !== order.carDetails.carName && (
                  <p className="text-[10px] text-zinc-500">{order.carDetails.model}</p>
                )}
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] font-black text-zinc-400">
                  {order.carDetails.year}
                </span>
              </div>
              {order.notes && (
                <p className="text-[10px] italic text-zinc-600 mt-2 leading-relaxed">{order.notes}</p>
              )}
            </div>

            {/* Status changer */}
            <div className="mt-4 pt-4 border-t border-zinc-900/60 flex items-center justify-between gap-4">
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Update Status</p>
              <div className="flex flex-col items-end gap-1">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e)}
                  disabled={updatingId === order._id}
                  className={`bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-[11px] font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer ${updatingId === order._id ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="contacted">Contacted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
  );
}

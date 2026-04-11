'use client';

import React, { useState } from 'react';
import { ContactMessage, updateContactMessageStatus } from '@/lib/apiServices';
import { motion } from 'framer-motion';

interface ContactMessageTableProps {
  messages: ContactMessage[];
  onStatusUpdate: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  unread:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  read:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export default function ContactMessageTable({ messages, onStatusUpdate }: ContactMessageTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (messageId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ContactMessage['status'];
    setUpdatingId(messageId);
    setError(null);
    try {
      await updateContactMessageStatus(messageId, newStatus);
      onStatusUpdate();
    } catch (err) {
      console.error('Failed to update contact message status:', err);
      setError('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">No contact messages found.</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Desktop table (lg+) ──────────────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
              <th className="px-8 py-7">Date</th>
              <th className="px-8 py-7">Customer</th>
              <th className="px-8 py-7">Message</th>
              <th className="px-8 py-7 text-center">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {messages.map((message, idx) => (
              <motion.tr
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="hover:bg-zinc-800/10 transition-colors align-top"
              >
                <td className="px-8 py-7 whitespace-nowrap">
                  <p className="text-[10px] font-bold text-zinc-400">{new Date(message.createdAt).toLocaleDateString()}</p>
                  <p className="text-[9px] text-zinc-700 mt-0.5">{new Date(message.createdAt).toLocaleTimeString()}</p>
                </td>
                <td className="px-8 py-7">
                  <p className="text-[11px] font-black uppercase tracking-tight text-white">
                    {message.customer.name}
                  </p>
                  <p className="text-[9px] text-zinc-700 mt-0.5">{message.customer.email}</p>
                </td>
                <td className="px-8 py-7">
                  <p className="text-[10px] leading-relaxed max-w-md whitespace-pre-wrap text-zinc-500 line-clamp-3">
                    {message.message}
                  </p>
                </td>
                <td className="px-8 py-7">
                  <div className="flex flex-col items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_BADGE[message.status] || STATUS_BADGE['unread']}`}>
                      {message.status}
                    </span>
                    <select
                      value={message.status}
                      onChange={(e) => handleStatusChange(message._id, e)}
                      disabled={updatingId === message._id}
                      className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer ${updatingId === message._id ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    {updatingId === message._id && (
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
        {messages.map((message, idx) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="p-5"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-zinc-500">
                {new Date(message.createdAt).toLocaleDateString()}
              </p>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${STATUS_BADGE[message.status] || STATUS_BADGE['unread']}`}>
                {message.status}
              </span>
            </div>

            {/* Customer */}
            <p className="text-[13px] font-black uppercase tracking-tight text-white">
              {message.customer.name}
            </p>
            <p className="text-[10px] text-zinc-700 mt-0.5">{message.customer.email}</p>

            {/* Message */}
            <div className="mt-3 pt-3 border-t border-zinc-900/60">
              <p className="text-[10px] leading-relaxed text-zinc-500 whitespace-pre-wrap">
                {message.message}
              </p>
            </div>

            {/* Status changer */}
            <div className="mt-4 pt-4 border-t border-zinc-900/60 flex items-center justify-between gap-4">
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Update Status</p>
              <div className="flex flex-col items-end gap-1">
                <select
                  value={message.status}
                  onChange={(e) => handleStatusChange(message._id, e)}
                  disabled={updatingId === message._id}
                  className={`bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-[11px] font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer ${updatingId === message._id ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
                {updatingId === message._id && (
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

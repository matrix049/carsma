'use client';

import React, { useState } from 'react';
import { ContactMessage, updateContactMessageStatus } from '@/lib/apiServices';
import { motion } from 'framer-motion';
import { ChatbotBadge, ChatTranscript } from '@/components/ChatTranscript';
import { BriefView } from '@/components/admin/RequestBrief';
import { telHref, whatsappHref } from '@/lib/phone';

interface ContactMessageTableProps {
  messages: ContactMessage[];
  onStatusUpdate: () => void;
}

type Status = ContactMessage['status'];

const STATUSES: { value: Status; label: string }[] = [
  { value: 'unread',   label: 'Unread' },
  { value: 'read',     label: 'Read' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_BADGE: Record<string, string> = {
  unread:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  read:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

/** Selected look of each status button on the phone cards. */
const STATUS_PILL_ACTIVE: Record<Status, string> = {
  unread:   'bg-amber-500/15 text-amber-300 ring-amber-500/40',
  read:     'bg-xenon/10 text-xenon ring-xenon/40',
  resolved: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
  archived: 'bg-white/[0.08] text-chalk ring-white/25',
};

/** Bigger tap area and readable text for the shared transcript toggle on phones
 *  (break-words is inherited, so long links in the conversation wrap too). */
const TRANSCRIPT_MOBILE = 'break-words';

const ICON_PHONE = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z';
const ICON_CHAT = 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
const ICON_MAIL = 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-[18px] w-[18px] flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** "28/10/2026 · 14:32" */
function formatWhen(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

const contactBtn =
  'flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold ring-1 ring-inset transition-colors';

export default function ContactMessageTable({ messages, onStatusUpdate }: ContactMessageTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; text: string } | null>(null);
  // Status shown straight away after a tap, until the refreshed message comes
  // back (its updatedAt changes) — so the buttons don't flick back meanwhile.
  const [pending, setPending] = useState<Record<string, { status: Status; updatedAt: string }>>({});

  const statusOf = (message: ContactMessage): Status => {
    const p = pending[message._id];
    return p && p.updatedAt === message.updatedAt ? p.status : message.status;
  };

  const handleStatusChange = async (message: ContactMessage, newStatus: Status) => {
    const messageId = message._id;
    setUpdatingId(messageId);
    setError(null);
    setPending((p) => ({ ...p, [messageId]: { status: newStatus, updatedAt: message.updatedAt } }));
    try {
      await updateContactMessageStatus(messageId, newStatus);
      onStatusUpdate();
    } catch (err) {
      console.error('Failed to update contact message status:', err);
      setPending((p) => {
        const next = { ...p };
        delete next[messageId];
        return next;
      });
      setError({ id: messageId, text: 'Failed to update status' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl bg-carbon py-20 text-center ring-1 ring-white/[0.08] lg:rounded-none lg:bg-transparent lg:py-24 lg:ring-0">
        <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">No contact messages found.</p>
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
              <th className="px-8 py-7">Message</th>
              <th className="px-8 py-7 text-center">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {messages.map((message, idx) => {
              const status = statusOf(message);
              const phone = message.customer.phone?.trim();
              const wa = phone ? whatsappHref(phone) : null;
              const busy = updatingId === message._id;
              return (
                <motion.tr
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-zinc-800/10 transition-colors align-top"
                >
                  <td className="px-8 py-7 whitespace-nowrap">
                    <p className="text-[11px] font-bold text-zinc-400">{new Date(message.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-zinc-700 mt-0.5">{new Date(message.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-7 max-w-[16rem]">
                    <p className="text-[12px] font-black uppercase tracking-tight text-white break-words" dir="auto">
                      {message.customer.name}
                    </p>
                    {phone && (
                      <>
                        <p className="text-[12px] text-zinc-400 font-bold mt-0.5 tabular-nums">{phone}</p>
                        <div className="mt-1 flex items-center gap-3 text-[11px] font-semibold">
                          <a href={telHref(phone)} className="text-zinc-500 hover:text-white">Call</a>
                          {wa && (
                            <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </>
                    )}
                    {message.customer.email && (
                      <a href={`mailto:${message.customer.email}`} className="block text-[11px] text-zinc-700 hover:text-white mt-0.5 break-all">
                        {message.customer.email}
                      </a>
                    )}
                    {message.source === 'chatbot' && <ChatbotBadge />}
                  </td>
                  {/* overflow-wrap:anywhere (not break-words) so a long link can't widen the table */}
                  <td className="px-8 py-7 [overflow-wrap:anywhere]">
                    {message.brief ? (
                      <div className="max-w-lg">
                        <BriefView brief={message.brief} heading="What they need" />
                      </div>
                    ) : (
                      <p className="text-[13px] leading-relaxed max-w-lg whitespace-pre-wrap text-zinc-400" dir="auto">
                        {message.message}
                      </p>
                    )}
                    <ChatTranscript transcript={message.transcript} />
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_BADGE[status] || STATUS_BADGE['unread']}`}>
                        {status}
                      </span>
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(message, e.target.value as Status)}
                        disabled={busy}
                        aria-label={`Status of message from ${message.customer.name}`}
                        className={`w-full min-w-[7.5rem] bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-300 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer ${busy ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {busy && (
                        <span className="text-[10px] font-bold text-blue-500 animate-pulse">Saving…</span>
                      )}
                      {error?.id === message._id && (
                        <span role="alert" className="text-[11px] font-semibold text-rose-400">{error.text}</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Phone / tablet cards (< lg) ──────────────────────────────── */}
      <ul className="lg:hidden space-y-3">
        {messages.map((message, idx) => {
          const status = statusOf(message);
          const phone = message.customer.phone?.trim();
          const email = message.customer.email?.trim();
          const wa = phone ? whatsappHref(phone) : null;
          const busy = updatingId === message._id;
          const unread = status === 'unread';
          return (
            <motion.li
              key={message._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx, 10) * 0.04 }}
              className={`min-w-0 rounded-2xl bg-carbon p-4 ring-1 sm:p-5 ${unread ? 'ring-amber-500/30' : 'ring-white/[0.08]'}`}
            >
              {/* Who + when */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-base font-semibold leading-snug text-chalk">
                    {unread && <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />}
                    <span className="min-w-0 break-words" dir="auto">{message.customer.name}</span>
                  </p>
                  {phone && (
                    <p className="mt-0.5 select-all text-[15px] font-medium tabular-nums text-silver">{phone}</p>
                  )}
                  {email && (
                    <p className="mt-0.5 break-all text-[13px] text-smoke">{email}</p>
                  )}
                  <p className="mt-1 text-xs text-smoke">{formatWhen(message.createdAt)}</p>
                </div>
                <span className={`flex-none rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${STATUS_BADGE[status] || STATUS_BADGE['unread']}`}>
                  {status}
                </span>
              </div>
              {message.source === 'chatbot' && <ChatbotBadge />}

              {/* What they wrote */}
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                {message.brief ? (
                  <BriefView brief={message.brief} heading="What they need" />
                ) : (
                  <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-zinc-300" dir="auto">
                    {message.message}
                  </p>
                )}
                <div className={TRANSCRIPT_MOBILE}>
                  <ChatTranscript transcript={message.transcript} />
                </div>
              </div>

              {/* Reach the customer */}
              {(phone || email) && (
                <div className={`mt-3 grid gap-2 ${phone && wa ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {phone ? (
                    <>
                      <a
                        href={telHref(phone)}
                        className={`${contactBtn} bg-white/[0.04] text-chalk ring-white/10 active:bg-white/[0.1]`}
                      >
                        <Icon d={ICON_PHONE} />
                        Call
                      </a>
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${contactBtn} bg-emerald-500/10 text-emerald-300 ring-emerald-500/30 active:bg-emerald-500/20`}
                        >
                          <Icon d={ICON_CHAT} />
                          WhatsApp
                        </a>
                      )}
                    </>
                  ) : (
                    <a
                      href={`mailto:${email}`}
                      className={`${contactBtn} bg-white/[0.04] text-chalk ring-white/10 active:bg-white/[0.1]`}
                    >
                      <Icon d={ICON_MAIL} />
                      Email
                    </a>
                  )}
                </div>
              )}

              {/* Status — one tap */}
              <div className="mt-4 border-t border-white/[0.06] pt-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke">Status</p>
                  {busy && <span className="text-[11px] font-semibold text-xenon animate-pulse">Saving…</span>}
                </div>
                <div role="group" aria-label={`Status of message from ${message.customer.name}`} className="grid grid-cols-4 gap-1.5">
                  {STATUSES.map((s) => {
                    const active = status === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        aria-pressed={active}
                        disabled={busy}
                        onClick={() => { if (!active) handleStatusChange(message, s.value); }}
                        className={`h-11 min-w-0 truncate rounded-xl px-1 text-[12px] font-semibold ring-1 ring-inset transition-colors disabled:opacity-50 ${
                          active ? STATUS_PILL_ACTIVE[s.value] : 'bg-white/[0.03] text-smoke ring-white/[0.08] active:bg-white/[0.08]'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                {error?.id === message._id && (
                  <p role="alert" className="mt-2 text-[13px] text-rose-400">{error.text}</p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </>
  );
}

import React from 'react';
import type { RequestBrief } from '@/lib/apiServices';
import { telHref, whatsappHref } from '@/lib/phone';

const DETAILS: { key: keyof RequestBrief; label: string }[] = [
  { key: 'piece', label: 'Piece' },
  { key: 'side', label: 'Side' },
  { key: 'style', label: 'Style' },
  { key: 'colour', label: 'Colour' },
  { key: 'size', label: 'Size' },
  { key: 'price', label: 'Price' },
];

/**
 * Older chat orders have no brief: rebuild one from the customer's recap
 * lines ("• Piece: …") stored in the notes.
 */
export function briefFromNotes(notes?: string): RequestBrief | null {
  if (!notes) return null;
  const recap = notes.split("Customer's recap:")[1];
  const lines = (recap ?? '')
    .split('\n')
    .map((l) => l.replace(/^\s*[•\-]\s*/, '').trim())
    .filter(Boolean);
  return lines.length ? { want: lines.join(' · ') } : null;
}

/** "What they want" in one sentence, the key details as chips, and what they wait for. */
export function BriefView({ brief, heading = 'What they want' }: { brief: RequestBrief; heading?: string }) {
  const chips = DETAILS.filter((d) => brief[d.key]);
  return (
    <div className="min-w-0 [overflow-wrap:anywhere]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke">{heading}</p>
      <p className="mt-1.5 text-[16px] font-medium leading-snug text-chalk" dir="auto">
        {brief.want}
      </p>
      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((d) => (
            <li key={d.key} className="max-w-full rounded-2xl bg-white/[0.05] px-2.5 py-1 text-[12px] ring-1 ring-white/[0.08]" dir="auto">
              <span className="text-smoke">{d.label}</span> <span className="font-medium text-chalk">{brief[d.key]}</span>
            </li>
          ))}
        </ul>
      )}
      {brief.pending && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[13px] text-amber-200 ring-1 ring-amber-500/20" dir="auto">
          <svg className="mt-0.5 h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <span className="font-semibold">Waiting for:</span> {brief.pending}
          </span>
        </p>
      )}
    </div>
  );
}

/** Big Call + WhatsApp buttons for a customer's number. */
export function ContactButtons({ phone, whatsappText }: { phone: string; whatsappText?: string }) {
  const wa = whatsappHref(phone, whatsappText);
  return (
    <div className="flex gap-2">
      <a
        href={telHref(phone)}
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 text-[14px] font-semibold text-chalk ring-1 ring-white/10 transition-colors hover:bg-white/[0.1]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
        </svg>
        Call
      </a>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-chalk px-4 text-[14px] font-semibold text-asphalt transition-colors hover:bg-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20l1.4-4.2A8 8 0 1112 20a8 8 0 01-4-1.1L4 20z" />
          </svg>
          WhatsApp
        </a>
      )}
    </div>
  );
}

/** "5 min ago", "3 h ago" (today), "Yesterday", "3 days ago", "12 Oct" — by calendar day. */
export function timeAgo(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const mins = Math.round((now.getTime() - then.getTime()) / 60000);
  const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysAgo = Math.round((dayStart(now) - dayStart(then)) / 86400000);
  if (daysAgo <= 0) {
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.round(mins / 60)} h ago`;
  }
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

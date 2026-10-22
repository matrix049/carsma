import React from 'react';
import { ChatTurn } from '@/lib/apiServices';

/** "Chatbot" tag for admin rows that came from the chat assistant. */
export function ChatbotBadge() {
  return (
    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-400">
      <span className="h-1 w-1 rounded-full bg-blue-500" />
      Chatbot
    </span>
  );
}

/** Collapsible full conversation with the chat assistant. */
export function ChatTranscript({ transcript }: { transcript?: ChatTurn[] }) {
  if (!transcript?.length) return null;
  return (
    <details className="group/tr mt-3">
      <summary className="cursor-pointer list-none text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white [&::-webkit-details-marker]:hidden">
        <span className="group-open/tr:hidden">View conversation ({transcript.length}) ↓</span>
        <span className="hidden group-open/tr:inline">Hide conversation ↑</span>
      </summary>
      <ol className="mt-3 space-y-2 border-l border-zinc-800 pl-3">
        {transcript.map((turn, i) => (
          <li key={i} className="text-[11px] leading-relaxed" dir="auto">
            <span className={`font-black uppercase tracking-widest ${turn.role === 'user' ? 'text-white' : 'text-zinc-500'}`}>
              {turn.role === 'user' ? 'Customer' : 'Bot'}
            </span>{' '}
            <span className="whitespace-pre-wrap text-zinc-300">{turn.text}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

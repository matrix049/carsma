import React from 'react';
import { ChatTurn } from '@/lib/apiServices';

/** "Chatbot" tag for admin rows that came from the chat assistant. */
export function ChatbotBadge() {
  return (
    <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      Chat assistant
    </span>
  );
}

/** Collapsible full conversation with the chat assistant. */
export function ChatTranscript({ transcript }: { transcript?: ChatTurn[] }) {
  if (!transcript?.length) return null;
  return (
    <details className="group/tr mt-3">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-1.5 text-[13px] font-semibold text-smoke hover:text-chalk [&::-webkit-details-marker]:hidden">
        <svg className="h-4 w-4 transition-transform group-open/tr:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
        <span className="group-open/tr:hidden">Show the conversation ({transcript.length} messages)</span>
        <span className="hidden group-open/tr:inline">Hide the conversation</span>
      </summary>
      <ol className="mt-2 max-h-[50vh] space-y-2.5 overflow-y-auto border-l border-white/10 pl-3">
        {transcript.map((turn, i) => (
          <li key={i} className="text-[13px] leading-relaxed" dir="auto">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${turn.role === 'user' ? 'text-chalk' : 'text-smoke'}`}>
              {turn.role === 'user' ? 'Customer' : 'Assistant'}
            </span>
            <span className="block whitespace-pre-wrap text-silver-light">{turn.text}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

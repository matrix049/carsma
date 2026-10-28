'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Plate from '@/components/Plate';
import Loader from '@/components/Loader';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { hideBrokenImage } from '@/components/ProductCard';
import { ChatReply, ChatTurn, fetchProducts, sendChatHandoff, sendChatMessage, sendChatOrder } from '@/lib/apiServices';
import { whatsappLink, inputField } from '@/lib/uiStyles';
import { trackEvent } from '@/lib/tracker';
import {
  CHAT_LANGUAGES,
  CHIP_TOPICS,
  ChatLang,
  ChipTopic,
  FlowStep,
  STRINGS,
  TopicId,
  isAffirmative,
  planReply,
  topicAnswer,
} from '@/lib/chatbot';

interface Action {
  kind: 'side' | 'style' | 'color' | 'confirm' | 'notyet' | 'handoff' | 'edit' | 'other';
  label: string;
  value?: number;
}

/** A recap the customer can confirm as an order. */
interface OrderDraft {
  lines: string[];
  item?: string;
}

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  products?: ChatReply['products'];
  actions?: Action[];
  order?: OrderDraft;
}

interface Flow {
  step: FlowStep | 'done';
  item?: string;
  side?: string;
  style?: string;
  color?: string;
}

interface Saved {
  lang: ChatLang | null;
  msgs: Msg[];
  flow: Flow | null;
}

type Panel = { kind: 'handoff' } | { kind: 'order'; order: OrderDraft; msgId: string } | null;

const STORAGE_KEY = 'l7it-chat';
const MAX_HISTORY = 20;

let counter = 0;
const uid = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

function load(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const isArabic = (s: string) => /[؀-ۿ]/.test(s);

/**
 * The L7IT chat assistant.
 *
 * Language first, then: quick-question chips and common questions answered
 * instantly from built-in content; a guided set of questions for custom
 * pieces (what, side, 2D/3D, colour); everything else goes to the AI. When
 * the customer is ready, the assistant asks them to confirm the order and
 * only needs their name and phone: the order lands in Admin → Custom
 * Orders. Questions it can't answer go to Admin → Contact Messages.
 */
export default function ChatBot({ inputId = 'chat-input' }: { inputId?: string }) {
  // Rendered client-only (see the contact page), so the conversation saved in
  // this tab can seed the initial state directly.
  const [saved] = useState(load);
  const [lang, setLang] = useState<ChatLang | null>(saved?.lang ?? null);
  const [msgs, setMsgs] = useState<Msg[]>(saved?.msgs ?? []);
  const [flow, setFlow] = useState<Flow | null>(saved?.flow ?? null);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [prices, setPrices] = useState<{ min: number; max: number } | undefined>();
  const busyRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = lang ? STRINGS[lang] : null;
  const rtl = !!lang && CHAT_LANGUAGES.find((l) => l.id === lang)?.rtl;

  // Keep the conversation for this tab (survives reloads and page changes).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, msgs: msgs.slice(-60), flow } satisfies Saved));
    } catch {
      /* storage unavailable — the chat still works */
    }
  }, [lang, msgs, flow]);

  // Catalogue price range for the built-in price answer.
  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((list) => {
        const p = list.map((x) => x.price).filter((n) => Number.isFinite(n) && n > 0);
        if (active && p.length) setPrices({ min: Math.min(...p), max: Math.max(...p) });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, pending, panel]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setSlow(true), 6000);
    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [pending]);

  /** Append a message — never the same assistant text twice in a row. */
  const say = (role: Msg['role'], text: string, extra: Partial<Msg> = {}) =>
    setMsgs((m) => {
      const last = m[m.length - 1];
      if (role === 'assistant' && last?.role === 'assistant' && last.text === text) return m;
      return [...m, { id: uid(), role, text, ...extra }];
    });

  const history = (list: Msg[]): ChatTurn[] => list.map(({ role, text }) => ({ role, text })).slice(-MAX_HISTORY);

  const openPanel = (next: Panel) => {
    setSendState('idle');
    setPanel(next);
  };

  /* ── Custom-request flow ─────────────────────────────────────────── */

  const askStep = (l: ChatLang, step: FlowStep) => {
    const f = STRINGS[l].flow;
    if (step === 'item') say('assistant', f.item);
    if (step === 'side') say('assistant', f.side, { actions: f.sides.map((label, i) => ({ kind: 'side', label, value: i })) });
    if (step === 'style') say('assistant', f.style, { actions: f.styles.map((label, i) => ({ kind: 'style', label, value: i })) });
    if (step === 'color') say('assistant', f.color, { actions: f.colors.map((label, i) => ({ kind: 'color', label, value: i })) });
    if (step === 'otherColor') say('assistant', f.otherColor);
  };

  const startFlow = (l: ChatLang, prefillItem?: string) => {
    say('assistant', STRINGS[l].flow.intro);
    if (prefillItem) {
      setFlow({ step: 'side', item: prefillItem });
      askStep(l, 'side');
    } else {
      setFlow({ step: 'item' });
      askStep(l, 'item');
    }
  };

  const flowLines = (f: Flow, l: ChatLang): string[] => {
    const labels = STRINGS[l].flow.labels;
    return [
      f.item && `${labels.item}: ${f.item}`,
      f.side && `${labels.side}: ${f.side}`,
      f.style && `${labels.style}: ${f.style}`,
      f.color && `${labels.color}: ${f.color}`,
    ].filter(Boolean) as string[];
  };

  /** Recap + "do you want to confirm this order?" */
  const finishFlow = (l: ChatLang, f: Flow) => {
    const s = STRINGS[l].flow;
    const lines = flowLines(f, l);
    setFlow({ ...f, step: 'done' });
    say('assistant', [s.summary, ...lines.map((d) => `• ${d}`), '', s.deposit, '', s.confirm].join('\n'), {
      order: { lines, item: f.item },
      actions: [
        { kind: 'confirm', label: s.confirmYes },
        { kind: 'edit', label: s.edit },
        { kind: 'other', label: s.other },
      ],
    });
  };

  const advanceFlow = (l: ChatLang, f: Flow, answer: string, optionIndex?: number) => {
    const s = STRINGS[l].flow;
    if (f.step === 'item') {
      setFlow({ ...f, item: answer, step: 'side' });
      askStep(l, 'side');
    } else if (f.step === 'side') {
      setFlow({ ...f, side: answer, step: 'style' });
      askStep(l, 'style');
    } else if (f.step === 'style') {
      setFlow({ ...f, style: answer, step: 'color' });
      askStep(l, 'color');
    } else if (f.step === 'color') {
      if (optionIndex === 2) {
        setFlow({ ...f, step: 'otherColor' });
        askStep(l, 'otherColor');
      } else {
        finishFlow(l, { ...f, color: answer });
      }
    } else if (f.step === 'otherColor') {
      finishFlow(l, { ...f, color: `${answer} (${s.colors[2]})` });
    }
  };

  /* ── Answers ─────────────────────────────────────────────────────── */

  const answerTopics = (l: ChatLang, topics: Exclude<TopicId, 'custom'>[], offer = false) => {
    const text = topics.map((tp) => topicAnswer(l, tp, prices)).join('\n\n');
    const wantsTeam = offer || topics.some((tp) => tp === 'order' || tp === 'human');
    say('assistant', text, wantsTeam ? { actions: [{ kind: 'handoff', label: STRINGS[l].handoff.button }] } : {});
  };

  const askAI = async (l: ChatLang, list: Msg[], fallback: Exclude<TopicId, 'custom'>[]) => {
    busyRef.current = true;
    setPending(true);
    try {
      const res = await sendChatMessage(history(list), l);
      const reply = res.reply || STRINGS[l].answers.fallback;
      const s = STRINGS[l].flow;
      const confirmable = res.askConfirm && res.orderSummary && res.orderSummary.length > 0;
      say('assistant', reply, {
        products: res.products?.length ? res.products : undefined,
        order: confirmable ? { lines: res.orderSummary! } : undefined,
        actions: confirmable
          ? [
              { kind: 'confirm', label: s.confirmYes },
              { kind: 'notyet', label: s.notYet },
            ]
          : res.offerHandoff
            ? [{ kind: 'handoff', label: STRINGS[l].handoff.button }]
            : undefined,
      });
    } catch {
      if (fallback.length) answerTopics(l, fallback, true);
      else say('assistant', STRINGS[l].answers.fallback, { actions: [{ kind: 'handoff', label: STRINGS[l].handoff.button }] });
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  const handleUserText = (raw: string) => {
    const text = raw.trim();
    // busyRef blocks a second send (double tap / double Enter) before React re-renders.
    if (!text || !lang || pending || busyRef.current) return;
    const userMsg: Msg = { id: uid(), role: 'user', text };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setInput('');

    // "yes / wakha / oui" right after "do you want to confirm this order?"
    const last = msgs[msgs.length - 1];
    if (last?.role === 'assistant' && last.order && isAffirmative(text)) {
      openPanel({ kind: 'order', order: last.order, msgId: last.id });
      return;
    }

    if (flow && flow.step !== 'done') {
      advanceFlow(lang, flow, text);
      return;
    }

    const plan = planReply(text);
    if (plan.kind === 'flow') {
      if (plan.lead?.length) answerTopics(lang, plan.lead);
      startFlow(lang, plan.prefillItem);
    } else if (plan.kind === 'answer') {
      answerTopics(lang, plan.topics);
    } else {
      void askAI(lang, next, plan.fallback);
    }
  };

  const onChip = (topic: ChipTopic) => {
    if (!lang || pending) return;
    const s = STRINGS[lang];
    say('user', s.chips[topic]);
    setFlow(null);
    if (topic === 'custom') startFlow(lang);
    else if (topic === 'human') {
      say('assistant', s.answers.human);
      openPanel({ kind: 'handoff' });
    } else if (topic === 'delivery') answerTopics(lang, ['delivery', 'payment']);
    else answerTopics(lang, [topic]);
  };

  const onAction = (msg: Msg, action: Action) => {
    if (!lang) return;
    const isLatest = msgs[msgs.length - 1]?.id === msg.id;
    if (action.kind === 'handoff') {
      openPanel({ kind: 'handoff' });
      return;
    }
    if (action.kind === 'confirm' && msg.order) {
      openPanel({ kind: 'order', order: msg.order, msgId: msg.id });
      return;
    }
    // Option buttons only work on the newest message.
    if (!isLatest) return;
    say('user', action.label);
    if (action.kind === 'edit') {
      setFlow(null);
      startFlow(lang);
    } else if (action.kind === 'other' || action.kind === 'notyet') {
      setFlow(null);
      inputRef.current?.focus();
    } else if (flow) {
      advanceFlow(lang, flow, action.label, action.value);
    }
  };

  const pickLanguage = (l: ChatLang) => {
    trackEvent('chat_open');
    setLang(l);
    setMsgs([{ id: uid(), role: 'assistant', text: STRINGS[l].hello }]);
    setFlow(null);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const reset = () => {
    setLang(null);
    setMsgs([]);
    setFlow(null);
    setPanel(null);
    setSendState('idle');
    setInput('');
  };

  const submitPanel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lang || !panel || sendState === 'sending') return;
    setSendState('sending');
    const contact = { name: form.name.trim(), phone: form.phone.trim(), language: lang };
    const messages = msgs.map(({ role, text }) => ({ role, text }));
    try {
      if (panel.kind === 'order') {
        await sendChatOrder({ ...contact, summary: panel.order.lines, item: panel.order.item, messages });
        // That recap is now an order: drop its buttons so it can't be sent twice.
        setMsgs((m) => m.map((x) => (x.id === panel.msgId ? { ...x, actions: undefined, order: undefined } : x)));
        say('assistant', STRINGS[lang].order.done);
        setFlow(null);
      } else {
        await sendChatHandoff({ ...contact, messages, details: flow ? flowLines(flow, lang) : undefined });
        say('assistant', STRINGS[lang].handoff.done);
      }
      setPanel(null);
      setSendState('idle');
    } catch {
      setSendState('error');
    }
  };

  const lastId = msgs[msgs.length - 1]?.id;
  const inFlowStep = flow && flow.step !== 'done';

  return (
    <section
      aria-label="L7IT chat assistant"
      className="flex h-[min(540px,70vh)] min-h-[400px] flex-col overflow-hidden rounded-3xl bg-carbon ring-1 ring-white/[0.08]"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Plate size="sm" left="L7IT" letter="ح" right="1" className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-chalk stretch-125">Assistant</p>
            <p className="flex items-center gap-1.5 text-[11px] text-smoke">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-xenon shadow-[0_0_6px_#8FCBFF]" />
              <span className="truncate" dir="auto">{t ? t.subtitle : 'Online · 24/7'}</span>
            </p>
          </div>
        </div>
        {lang && (
          <button
            type="button"
            onClick={reset}
            aria-label={t?.newChat}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-smoke transition-colors hover:bg-white/[0.06] hover:text-chalk"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4v6h6M20 20v-6h-6M5.6 15a7 7 0 0011.8 2.6L20 14M18.4 9A7 7 0 006.6 6.4L4 10" />
            </svg>
            <span dir="auto" className="hidden sm:inline">{t?.newChat}</span>
          </button>
        )}
      </header>

      {/* Conversation */}
      <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {!lang ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-display text-lg font-semibold uppercase text-chalk stretch-125">Salam 👋</p>
            <p className="mt-1.5 text-sm text-smoke">
              Choose your language · Choisissez votre langue · <span className="font-ar">اختار اللغة</span>
            </p>
            <div className="mt-5 grid w-full max-w-xs grid-cols-2 gap-2">
              {CHAT_LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => pickLanguage(l.id)}
                  className="flex flex-col items-center gap-0.5 rounded-2xl bg-carbon-2 px-3 py-3 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.07] hover:ring-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon"
                >
                  <span className={`text-base font-semibold text-chalk ${l.rtl ? 'font-ar' : ''}`}>{l.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-smoke">{l.sub}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {msgs.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  dir="auto"
                  className={`max-w-[88%] whitespace-pre-line px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-2xl rounded-br-md bg-chalk text-asphalt'
                      : 'rounded-2xl rounded-bl-md bg-carbon-2 text-chalk ring-1 ring-white/[0.06]'
                  } ${isArabic(m.text) ? 'font-ar' : ''}`}
                >
                  {m.text}
                </div>

                {m.products && m.products.length > 0 && (
                  <div className="mt-2 grid w-full max-w-[88%] grid-cols-2 gap-2">
                    {m.products.map((p) => (
                      <Link
                        key={p._id}
                        href={`/product/${p._id}`}
                        className="group overflow-hidden rounded-xl bg-carbon-2 ring-1 ring-white/[0.08] transition-colors hover:ring-white/25"
                      >
                        <div className="aspect-[16/9] overflow-hidden bg-carbon-3">
                          {p.image && (
                            <img src={p.image} alt={p.name} loading="lazy" onError={hideBrokenImage} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          )}
                        </div>
                        <div className="space-y-1.5 p-2">
                          <p className="line-clamp-1 text-xs font-semibold text-chalk">{p.name}</p>
                          <Plate size="sm" left={p.price} letter="د.م" right="MAD" aria-label={`${p.price} MAD`} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {m.actions && (m.id === lastId || m.actions.some((a) => a.kind === 'handoff' || a.kind === 'confirm')) && (
                  <div className="mt-1.5 flex max-w-[92%] flex-wrap gap-1.5" dir={rtl ? 'rtl' : 'ltr'}>
                    {m.actions
                      .filter((a) => m.id === lastId || a.kind === 'handoff' || a.kind === 'confirm')
                      .map((a) => (
                        <button
                          key={`${a.kind}-${a.label}`}
                          type="button"
                          onClick={() => onAction(m, a)}
                          disabled={pending}
                          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40 ${
                            a.kind === 'handoff' || a.kind === 'confirm'
                              ? 'bg-chalk text-asphalt hover:bg-white'
                              : 'bg-white/[0.05] text-chalk ring-1 ring-inset ring-white/15 hover:bg-white/[0.1]'
                          } ${isArabic(a.label) ? 'font-ar' : ''}`}
                        >
                          {a.label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}

            {pending && (
              <div className="flex w-fit items-center gap-3 rounded-2xl rounded-bl-md bg-carbon-2 px-3.5 py-2.5 text-sm text-smoke ring-1 ring-white/[0.06]">
                <Loader size="sm" label={t?.typing} />
                <span dir="auto" className={rtl ? 'font-ar' : ''}>{slow ? t?.slow : t?.typing}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order / hand-off form, or the composer */}
      {lang && t && (
        <div className="border-t border-white/[0.07] bg-carbon/80 p-3" dir={rtl ? 'rtl' : 'ltr'}>
          <AnimatePresence initial={false} mode="wait">
            {panel ? (
              <motion.form
                key={panel.kind}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onSubmit={submitPanel}
                className="space-y-2"
              >
                <p className={`text-sm font-semibold text-chalk ${rtl ? 'font-ar' : ''}`}>
                  {panel.kind === 'order' ? t.order.title : t.handoff.title}
                </p>
                {panel.kind === 'order' && (
                  <div className="space-y-1.5 rounded-xl bg-carbon-2 px-3 py-2.5 ring-1 ring-inset ring-white/10">
                    <ul dir="auto" className={`space-y-0.5 text-[13px] text-chalk ${rtl ? 'font-ar' : ''}`}>
                      {panel.order.lines.map((line) => (
                        <li key={line}>• {line}</li>
                      ))}
                    </ul>
                    <p className={`text-xs text-smoke ${rtl ? 'font-ar' : ''}`}>{t.order.hint}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    minLength={2}
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={t.handoff.name}
                    aria-label={t.handoff.name}
                    className={`${inputField} !py-2.5`}
                  />
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    pattern="[0-9+ ()\-]{6,}"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder={`${t.handoff.phone} · 06…`}
                    aria-label={t.handoff.phone}
                    dir="ltr"
                    className={`${inputField} !py-2.5`}
                  />
                </div>
                {sendState === 'error' && (
                  <p className={`text-sm text-red-300 ${rtl ? 'font-ar' : ''}`}>
                    {panel.kind === 'order' ? t.order.error : t.handoff.error}{' '}
                    <a href={whatsappLink('Salam L7it!')} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      WhatsApp
                    </a>
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={sendState === 'sending'}
                    className="flex-1 rounded-full bg-chalk px-4 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-white disabled:opacity-50"
                  >
                    {panel.kind === 'order'
                      ? sendState === 'sending'
                        ? t.order.sending
                        : t.order.submit
                      : sendState === 'sending'
                        ? t.handoff.sending
                        : t.handoff.submit}
                  </button>
                  <button
                    type="button"
                    onClick={() => openPanel(null)}
                    className="rounded-full px-4 py-2.5 text-sm font-medium text-smoke ring-1 ring-inset ring-white/15 transition-colors hover:text-chalk"
                  >
                    {t.handoff.cancel}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {!inFlowStep && (
                  <div className="no-scrollbar -mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1">
                    {CHIP_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => onChip(topic)}
                        disabled={pending}
                        className={`shrink-0 rounded-full bg-white/[0.04] px-3 py-1 text-xs text-silver ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-chalk disabled:opacity-40 ${
                          rtl ? 'font-ar' : ''
                        }`}
                      >
                        {t.chips[topic]}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUserText(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    id={inputId}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    aria-label={t.placeholder}
                    maxLength={600}
                    autoComplete="off"
                    dir="auto"
                    className={`${inputField} !rounded-full !py-2.5 ${rtl ? 'font-ar' : ''}`}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || pending}
                    aria-label={t.send}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chalk text-asphalt transition-colors hover:bg-white disabled:opacity-40"
                  >
                    <svg className={`h-[18px] w-[18px] ${rtl ? '-scale-x-100' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h13M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </form>
                <a
                  href={whatsappLink('Salam L7it!')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-smoke transition-colors hover:text-chalk"
                >
                  <WhatsAppIcon className="h-3 w-3" />
                  WhatsApp · +212 765 810 304
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

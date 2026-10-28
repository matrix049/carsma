'use client';

/**
 * Small, dependency-free chart kit for the admin dashboard (dark only).
 * Marks wear one validated blue (#3987e5 passes band/chroma/contrast on the
 * #121316 card surface); text always wears the chalk/smoke text tokens.
 * Order statuses use the fixed status colours, always with a label.
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import type { Compare, StatsRange } from '@/lib/apiServices';

export const MARK = '#3987e5';
const SURFACE = '#121316';
const GRID = 'rgba(255,255,255,0.07)';
const AXIS = 'rgba(255,255,255,0.14)';
const MUTED = '#8E929A';

// ── Formatting ──────────────────────────────────────────────────────────────

export const formatNumber = (n: number) => Math.round(n).toLocaleString('en-US');

export const compact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${Math.round(n / 1000)}K`;
  if (abs >= 1000) return `${+(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
};

export const formatMAD = (n: number) => `${formatNumber(n)} MAD`;

/** "2026-10-28" → "Oct 28"; "14" → "14h". */
export function bucketLabel(key: string, bucket: 'hour' | 'day', long = false): string {
  if (bucket === 'hour') return long ? `${key}:00 – ${key}:59` : `${key}h`;
  const d = new Date(`${key}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', ...(long ? { weekday: 'short' } : {}) });
}

// ── Layout helpers ──────────────────────────────────────────────────────────

/** Width of an element, kept in sync with resizes (charts draw at real pixels so text never scales). */
function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-2xl bg-carbon p-4 ring-1 ring-white/[0.08] sm:p-6 ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-chalk">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-smoke">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

// ── Range control ───────────────────────────────────────────────────────────

const RANGE_LABELS: { key: StatsRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
];

export function RangeTabs({ value, onChange }: { value: StatsRange; onChange: (r: StatsRange) => void }) {
  return (
    <div role="radiogroup" aria-label="Period" className="inline-flex rounded-full bg-carbon p-1 ring-1 ring-white/[0.08]">
      {RANGE_LABELS.map((r) => {
        const active = r.key === value;
        return (
          <button
            key={r.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r.key)}
            className={`h-10 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-colors sm:px-4 ${
              active ? 'bg-chalk text-asphalt' : 'text-smoke hover:bg-white/[0.04] hover:text-chalk'
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Delta + stat tile ───────────────────────────────────────────────────────

/** Change vs the previous period: arrow + sign + %, green when it went the good way. */
export function Delta({ cmp, label = 'vs previous period', points = false }: { cmp: Compare; label?: string; points?: boolean }) {
  const { current, previous } = cmp;
  if (!previous && !current) return <span className="text-[12px] text-smoke">No data yet</span>;
  if (!previous) return <span className="text-[12px] text-smoke">No earlier data to compare</span>;
  const change = points ? current - previous : ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;
  if (rounded === 0) return <span className="text-[12px] text-smoke">No change {label}</span>;
  const up = rounded > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
      <svg className="h-3 w-3" viewBox="0 0 12 12" aria-hidden="true">
        <path d={up ? 'M6 2l4 5H2z' : 'M6 10L2 5h8z'} fill="currentColor" />
      </svg>
      {up ? '+' : '−'}
      {Math.abs(rounded)}
      {points ? ' pts' : '%'}
      {label && <span className="font-normal text-smoke">{label}</span>}
    </span>
  );
}

export function Sparkline({ values, height = 28 }: { values: number[]; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const max = Math.max(...values, 0);
  const pts =
    width && values.length > 1
      ? values.map((v, i) => [(i / (values.length - 1)) * (width - 6) + 3, height - 3 - (max ? (v / max) * (height - 6) : 0)] as const)
      : [];
  const last = pts[pts.length - 1];
  return (
    <div ref={ref} className="h-7 w-full" aria-hidden="true">
      {pts.length > 1 && (
        <svg width={width} height={height}>
          <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="rgba(195,200,207,0.45)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={last[0]} cy={last[1]} r="3" fill={MARK} stroke={SURFACE} strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  cmp,
  spark,
  hero = false,
  points = false,
  unit,
}: {
  label: string;
  value: string;
  /** Small suffix after the value, e.g. "MAD". */
  unit?: string;
  cmp: Compare;
  spark?: number[];
  hero?: boolean;
  points?: boolean;
}) {
  return (
    <div className={`flex min-w-0 flex-col rounded-2xl bg-carbon p-4 ring-1 ring-white/[0.08] sm:p-5 ${hero ? 'col-span-2' : ''}`}>
      <p className="text-[13px] font-medium text-smoke">{label}</p>
      <p className={`mt-1.5 truncate font-semibold tracking-tight text-chalk ${hero ? 'text-[40px] leading-[1.05] sm:text-5xl' : 'text-[26px] leading-tight sm:text-[30px]'}`}>
        {value}
        {unit && <span className="ml-1.5 text-[0.45em] font-medium tracking-normal text-smoke">{unit}</span>}
      </p>
      <div className="mt-1.5 min-h-[18px]">
        <Delta cmp={cmp} points={points} />
      </div>
      {spark && spark.length > 1 && (
        <div className="mt-3">
          <Sparkline values={spark} />
        </div>
      )}
    </div>
  );
}

// ── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ x, width, title, rows }: { x: number; width: number; title: string; rows: { label: string; value: string }[] }) {
  const W = 168;
  const left = Math.max(0, Math.min(width - W, x - W / 2));
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-0 z-10 rounded-xl bg-[#202227] px-3 py-2 shadow-xl ring-1 ring-white/10"
      style={{ left, width: W }}
    >
      <p className="text-[11px] font-medium text-smoke">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className="text-[14px] font-semibold text-chalk">{r.value}</span>
          <span className="text-[11px] text-smoke">{r.label}</span>
        </p>
      ))}
    </div>
  );
}

/** Pointer → nearest bucket. Touch keeps the last tapped bucket shown. */
function useHover(count: number, plotLeft: number, plotWidth: number) {
  const [hover, setHover] = useState<number | null>(null);
  const pick = (e: React.PointerEvent<SVGElement>) => {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left - plotLeft;
    const i = Math.round((x / plotWidth) * count - 0.5);
    setHover(Math.max(0, Math.min(count - 1, i)));
  };
  return {
    hover,
    setHover,
    handlers: {
      onPointerMove: pick,
      onPointerDown: pick,
      onPointerLeave: (e: React.PointerEvent<SVGElement>) => {
        if (e.pointerType === 'mouse') setHover(null);
      },
    },
  };
}

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** Keep x labels inside the chart: pin the ones near an edge to that edge. */
function anchorAt(x: number, width: number): 'start' | 'middle' | 'end' {
  if (x < 24) return 'start';
  if (x > width - 24) return 'end';
  return 'middle';
}

/** Which x labels to print so they never collide (~one per 64px). */
function labelEvery(count: number, plotWidth: number): number {
  return Math.max(1, Math.ceil(count / Math.max(1, Math.floor(plotWidth / 64))));
}

// ── Column chart (one series) ───────────────────────────────────────────────

export interface ChartRow {
  key: string;
  value: number;
}

export function ColumnChart({
  rows,
  bucket,
  format,
  tooltipRows,
  height = 200,
  ariaLabel,
}: {
  rows: ChartRow[];
  bucket: 'hour' | 'day';
  format: (n: number) => string;
  tooltipRows: (i: number) => { label: string; value: string }[];
  height?: number;
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const left = 40;
  const top = 8;
  const bottom = 24;
  const plotW = Math.max(1, width - left);
  const plotH = height - top - bottom;
  const max = niceMax(Math.max(...rows.map((r) => r.value), 0));
  const band = plotW / Math.max(1, rows.length);
  const barW = Math.max(2, Math.min(24, band - 2));
  const { hover, setHover, handlers } = useHover(rows.length, left, plotW);
  const every = labelEvery(rows.length, plotW);
  const y = (v: number) => top + plotH - (v / max) * plotH;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} {...handlers} style={{ touchAction: 'pan-y' }}>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={left} x2={width} y1={y(max * t)} y2={y(max * t)} stroke={t === 0 ? AXIS : GRID} strokeWidth="1" />
              <text x={left - 8} y={y(max * t) + 4} textAnchor="end" fontSize="11" fill={MUTED} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {compact(max * t)}
              </text>
            </g>
          ))}
          {rows.map((r, i) => {
            const cx = left + band * i + band / 2;
            const h = Math.max(0, (r.value / max) * plotH);
            const x0 = cx - barW / 2;
            const yTop = top + plotH - h;
            const rad = Math.min(4, barW / 2, h);
            return (
              <g key={r.key}>
                {hover === i && <rect x={left + band * i} y={top} width={band} height={plotH} fill="rgba(255,255,255,0.04)" />}
                {h > 0 && (
                  <path
                    d={`M${x0},${top + plotH} V${yTop + rad} Q${x0},${yTop} ${x0 + rad},${yTop} H${x0 + barW - rad} Q${x0 + barW},${yTop} ${x0 + barW},${yTop + rad} V${top + plotH} Z`}
                    fill={MARK}
                    opacity={hover === null || hover === i ? 1 : 0.55}
                  />
                )}
                {i % every === 0 && (
                  <text x={cx} y={height - 6} textAnchor={anchorAt(cx, width)} fontSize="11" fill={MUTED}>
                    {bucketLabel(r.key, bucket)}
                  </text>
                )}
                {/* Keyboard: each column is focusable and shows the same tooltip. */}
                <rect
                  x={left + band * i}
                  y={top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${bucketLabel(r.key, bucket, true)}: ${format(r.value)}`}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="outline-none focus-visible:stroke-white/40"
                />
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && rows[hover] && (
        <Tooltip x={left + band * hover + band / 2} width={width} title={bucketLabel(rows[hover].key, bucket, true)} rows={tooltipRows(hover)} />
      )}
    </div>
  );
}

// ── Area chart (one series, crosshair) ──────────────────────────────────────

export function AreaChart({
  rows,
  bucket,
  tooltipRows,
  height = 200,
  ariaLabel,
}: {
  rows: ChartRow[];
  bucket: 'hour' | 'day';
  tooltipRows: (i: number) => { label: string; value: string }[];
  height?: number;
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const gradient = useId();
  const left = 40;
  const right = 10;
  const top = 8;
  const bottom = 24;
  const plotW = Math.max(1, width - left - right);
  const plotH = height - top - bottom;
  const max = niceMax(Math.max(...rows.map((r) => r.value), 0));
  const step = rows.length > 1 ? plotW / (rows.length - 1) : 0;
  const x = (i: number) => left + (rows.length > 1 ? step * i : plotW / 2);
  const y = (v: number) => top + plotH - (v / max) * plotH;
  const every = labelEvery(rows.length, plotW);

  const [hover, setHover] = useState<number | null>(null);
  const pick = (e: React.PointerEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = rows.length > 1 ? Math.round((e.clientX - rect.left - left) / step) : 0;
    setHover(Math.max(0, Math.min(rows.length - 1, i)));
  };

  const line = rows.map((r, i) => `${i ? 'L' : 'M'}${x(i)},${y(r.value)}`).join(' ');
  const area = rows.length ? `${line} L${x(rows.length - 1)},${top + plotH} L${x(0)},${top + plotH} Z` : '';
  const lastIndex = rows.length - 1;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && rows.length > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setHover((h) => Math.min(lastIndex, (h ?? -1) + 1));
            if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? rows.length) - 1));
          }}
          onBlur={() => setHover(null)}
          className="outline-none"
          style={{ touchAction: 'pan-y' }}
        >
          <defs>
            <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={MARK} stopOpacity="0.14" />
              <stop offset="100%" stopColor={MARK} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={left} x2={width - right} y1={y(max * t)} y2={y(max * t)} stroke={t === 0 ? AXIS : GRID} strokeWidth="1" />
              <text x={left - 8} y={y(max * t) + 4} textAnchor="end" fontSize="11" fill={MUTED} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {compact(max * t)}
              </text>
            </g>
          ))}
          <path d={area} fill={`url(#${gradient})`} />
          <path d={line} fill="none" stroke={MARK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {rows.map((r, i) =>
            i % every === 0 ? (
              <text key={r.key} x={x(i)} y={height - 6} textAnchor={anchorAt(x(i), width)} fontSize="11" fill={MUTED}>
                {bucketLabel(r.key, bucket)}
              </text>
            ) : null
          )}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={top} y2={top + plotH} stroke="rgba(255,255,255,0.28)" strokeWidth="1" />}
          <circle
            cx={x(hover ?? lastIndex)}
            cy={y(rows[hover ?? lastIndex].value)}
            r="4.5"
            fill={MARK}
            stroke={SURFACE}
            strokeWidth="2"
          />
        </svg>
      )}
      {hover !== null && rows[hover] && (
        <Tooltip x={x(hover)} width={width} title={bucketLabel(rows[hover].key, bucket, true)} rows={tooltipRows(hover)} />
      )}
    </div>
  );
}

// ── Bar list (ranked magnitudes) ────────────────────────────────────────────

export function BarList({
  items,
  format = formatNumber,
  empty = 'Nothing yet',
}: {
  items: { label: React.ReactNode; value: number; note?: string; key: string }[];
  format?: (n: number) => string;
  empty?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 0);
  if (!items.length || !max) return <p className="py-6 text-center text-[13px] text-smoke">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[14px] text-silver-light">{item.label}</span>
            <span className="flex-none text-[14px] font-semibold text-chalk" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {format(item.value)}
              {item.note && <span className="ml-1.5 text-[12px] font-normal text-smoke">{item.note}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#3987e5]/[0.14]">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, (item.value / max) * 100)}%`, background: MARK }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Order status (part-to-whole) ────────────────────────────────────────────

const STATUS = [
  { key: 'delivered', label: 'Delivered', color: '#0ca30c' },
  { key: 'confirmed', label: 'Confirmed', color: MARK },
  { key: 'pending', label: 'Pending', color: '#fab219' },
  { key: 'cancelled', label: 'Cancelled', color: '#d03b3b' },
] as const;

export function StatusBar({ counts }: { counts: Record<(typeof STATUS)[number]['key'], number> }) {
  const total = STATUS.reduce((s, st) => s + counts[st.key], 0);
  if (!total) return <p className="py-6 text-center text-[13px] text-smoke">No orders in this period</p>;
  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={STATUS.map((s) => `${s.label} ${counts[s.key]}`).join(', ')}>
        {STATUS.filter((s) => counts[s.key] > 0).map((s) => (
          <div key={s.key} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(counts[s.key] / total) * 100}%`, background: s.color }} title={`${s.label}: ${counts[s.key]}`} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {STATUS.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-[14px]">
            <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: s.color }} aria-hidden="true" />
            <span className="text-smoke">{s.label}</span>
            <span className="ml-auto font-semibold text-chalk" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {counts[s.key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

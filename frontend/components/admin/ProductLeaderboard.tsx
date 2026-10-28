'use client';

import React, { useState } from 'react';
import type { ProductPerformance } from '@/lib/apiServices';
import { formatMAD, formatNumber } from '@/components/admin/StatsKit';

type Metric = 'views' | 'clicks' | 'addToCart' | 'sold';

const METRICS: { key: Metric; tab: string; unit: string }[] = [
  { key: 'views', tab: 'Most viewed', unit: 'views' },
  { key: 'clicks', tab: 'Most clicked', unit: 'clicks' },
  { key: 'addToCart', tab: 'Added to cart', unit: 'adds' },
  { key: 'sold', tab: 'Best sellers', unit: 'sold' },
];

function stockNote(p: ProductPerformance): string | null {
  if (!p.inStock || p.stockQuantity === 0) return 'Sold out';
  if (typeof p.stockQuantity === 'number') return `${p.stockQuantity} left`;
  return null;
}

/** Products ranked by what visitors do with them: views, clicks, cart adds, sales. */
export default function ProductLeaderboard({ products, limit }: { products: ProductPerformance[]; limit?: number }) {
  const [metric, setMetric] = useState<Metric>('views');
  const active = METRICS.find((m) => m.key === metric)!;
  const ranked = products
    .filter((p) => p[metric] > 0)
    .sort((a, b) => b[metric] - a[metric] || b.views - a.views);
  const shown = limit ? ranked.slice(0, limit) : ranked;
  const max = shown[0]?.[metric] ?? 0;

  return (
    <div>
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Rank products by">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={m.key === metric}
            onClick={() => setMetric(m.key)}
            className={`h-9 flex-none rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
              m.key === metric ? 'bg-white/[0.1] text-chalk ring-1 ring-white/15' : 'text-smoke hover:bg-white/[0.04] hover:text-chalk'
            }`}
          >
            {m.tab}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-smoke">No product activity in this period yet.</p>
      ) : (
        <ol className="divide-y divide-white/[0.06]">
          {shown.map((p, i) => {
            const stock = stockNote(p);
            const viewToCart = p.visitors ? Math.min(100, Math.round((p.cartVisitors / p.visitors) * 100)) : 0;
            return (
              <li key={p._id} className="flex items-center gap-3 py-3">
                <span className="w-5 flex-none text-right text-[13px] font-semibold text-smoke" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {i + 1}
                </span>
                <div className="h-11 w-11 flex-none overflow-hidden rounded-lg bg-carbon-2 ring-1 ring-white/[0.08]">
                  {p.image && <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-chalk">{p.name}</p>
                  <p className="mt-0.5 truncate text-[12px] text-smoke">
                    {formatNumber(p.views)} views · {formatNumber(p.clicks)} clicks · {formatNumber(p.addToCart)} carts · {formatNumber(p.sold)} sold
                  </p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#3987e5]/[0.14]">
                    <div className="h-full rounded-full bg-[#3987e5]" style={{ width: `${max ? Math.max(3, (p[metric] / max) * 100) : 0}%` }} />
                  </div>
                </div>
                <div className="flex-none text-right">
                  <p className="text-[16px] font-semibold text-chalk" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatNumber(p[metric])}
                  </p>
                  <p className="text-[11px] text-smoke">{active.unit}</p>
                  {!limit && (
                    <p className="mt-0.5 hidden text-[11px] text-smoke sm:block">
                      {p.revenue ? formatMAD(p.revenue) : `${formatMAD(p.price)} each`}
                      {stock ? ` · ${stock}` : ''}
                      {p.visitors ? ` · ${viewToCart}% of viewers add to cart` : ''}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

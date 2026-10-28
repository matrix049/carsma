'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Loader from '@/components/Loader';
import ProductLeaderboard from '@/components/admin/ProductLeaderboard';
import { AreaChart, BarList, Card, RangeTabs, StatTile, formatNumber } from '@/components/admin/StatsKit';
import { useAuth } from '@/contexts/AuthContext';
import { useOverview } from '@/hooks/useOverview';
import { StatsRange } from '@/lib/apiServices';

const PAGE_NAMES: Record<string, string> = {
  home: 'Home',
  shop: 'Shop',
  product: 'Product pages',
  contact: 'Contact & assistant',
  faq: 'FAQ',
  cart: 'Cart',
  checkout: 'Checkout',
  customize: 'Custom order',
};
const DEVICE_NAMES: Record<string, string> = { mobile: 'Phone', tablet: 'Tablet', desktop: 'Computer' };
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '');

export default function AdminAnalytics() {
  const { logout } = useAuth();
  const [range, setRange] = useState<StatsRange>('30d');
  const { data, error, loading, refresh } = useOverview(range);
  const series = data?.series ?? [];
  const bucket = data?.range.bucket ?? 'day';
  const deviceTotal = data?.devices.reduce((s, d) => s + d.visitors, 0) ?? 0;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-asphalt text-chalk">
        <AdminSidebar onLogout={logout} />

        <main className="min-w-0 flex-1 px-4 pb-16 pt-20 sm:px-6 md:px-10 md:pt-10 lg:px-12">
          <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-chalk sm:text-4xl">Analytics</h1>
              <p className="mt-1 text-[13px] text-smoke">Products and visitors, tracked on l7it.art (your own visits are not counted)</p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="min-w-0 flex-1 overflow-x-auto sm:flex-none">
                <RangeTabs value={range} onChange={setRange} />
              </div>
              <button
                type="button"
                onClick={refresh}
                aria-label="Refresh numbers"
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-carbon text-smoke ring-1 ring-white/[0.08] transition-colors hover:text-chalk"
              >
                <svg className={`h-5 w-5 ${loading && data ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-rose-500/10 px-4 py-3 ring-1 ring-rose-500/20">
              <p className="text-[14px] text-rose-300">Couldn&apos;t load the numbers: {error}</p>
              <button type="button" onClick={refresh} className="h-10 flex-none rounded-full bg-white/[0.08] px-4 text-[13px] font-semibold text-chalk">
                Retry
              </button>
            </div>
          )}

          {!data ? (
            !error && (
              <div className="flex justify-center py-32">
                <Loader size="lg" />
              </div>
            )
          ) : (
            <div className={`space-y-5 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile label="Visitors" value={formatNumber(data.kpis.visitors.current)} cmp={data.kpis.visitors} spark={series.map((s) => s.visitors)} />
                <StatTile label="Pages opened" value={formatNumber(data.kpis.pageViews.current)} cmp={data.kpis.pageViews} spark={series.map((s) => s.pageViews)} />
                <StatTile label="Product clicks" value={formatNumber(data.actions.productClicks.current)} cmp={data.actions.productClicks} />
                <StatTile label="Added to cart" value={formatNumber(data.actions.addToCart.current)} cmp={data.actions.addToCart} />
              </div>

              <Card title="Pages opened" subtitle={`Per ${bucket === 'hour' ? 'hour' : 'day'} · hover or tap for visitors`}>
                <AreaChart
                  rows={series.map((s) => ({ key: s.key, value: s.pageViews }))}
                  bucket={bucket}
                  ariaLabel="Pages opened over time"
                  tooltipRows={(i) => [
                    { label: 'pages opened', value: formatNumber(series[i].pageViews) },
                    { label: 'visitors', value: formatNumber(series[i].visitors) },
                  ]}
                />
              </Card>

              <Card title="Every product" subtitle="Views = product page opened · clicks = opened from a card, the chat or a suggestion">
                <ProductLeaderboard products={data.products} />
              </Card>

              <div className="grid gap-5 md:grid-cols-2">
                <Card title="Where visitors come from" subtitle="First page of each visit">
                  <BarList items={data.sources.map((s) => ({ key: s.source, label: s.source.charAt(0).toUpperCase() + s.source.slice(1), value: s.visits }))} empty="No visits tracked yet" />
                </Card>
                <Card title="Devices" subtitle="Visitors by screen">
                  <BarList items={data.devices.map((d) => ({ key: d.device, label: DEVICE_NAMES[d.device] || d.device, value: d.visitors, note: pct(d.visitors, deviceTotal) }))} empty="No visits tracked yet" />
                </Card>
                <Card title="Pages" subtitle="Pages opened, with unique visitors">
                  <BarList items={data.pages.map((p) => ({ key: p.page, label: PAGE_NAMES[p.page] || p.page, value: p.views, note: `${formatNumber(p.visitors)} visitors` }))} empty="No pages tracked yet" />
                </Card>
                <Card title="Top cities" subtitle="Where orders ship to">
                  <BarList items={data.cities.map((c) => ({ key: c.city, label: c.city, value: c.orders }))} empty="No orders in this period" />
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

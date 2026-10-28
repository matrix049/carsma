'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Loader from '@/components/Loader';
import ProductLeaderboard from '@/components/admin/ProductLeaderboard';
import {
  AreaChart,
  BarList,
  Card,
  ColumnChart,
  Delta,
  RangeTabs,
  StatTile,
  StatusBar,
  formatMAD,
  formatNumber,
} from '@/components/admin/StatsKit';
import { useAuth } from '@/contexts/AuthContext';
import { useOverview } from '@/hooks/useOverview';
import { fetchOrders, Order, StatsRange, Compare } from '@/lib/apiServices';

// ── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(orders: Order[]) {
  const rows = [
    ['Order ID', 'Date', 'Customer', 'Phone', 'Address', 'Products', 'Total (MAD)', 'Payment', 'Status'],
    ...orders.map((o) => [
      `#L7-${o._id.slice(-6).toUpperCase()}`,
      new Date(o.createdAt).toLocaleString(),
      `${o.customer.firstName} ${o.customer.lastName}`,
      o.customer.phone,
      `"${o.customer.address.replace(/"/g, '""')}"`,
      `"${o.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')}"`,
      o.totalPrice.toFixed(0),
      o.paymentMethod.toUpperCase(),
      o.status,
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `l7it-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_STYLE: Record<string, string> = {
  delivered: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
};

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

const RANGE_WORDS: Record<StatsRange, string> = {
  today: 'today',
  '7d': 'the last 7 days',
  '30d': 'the last 30 days',
  '90d': 'the last 90 days',
};

const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '—');
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function cityOf(address: string) {
  const parts = address.split('| Notes:')[0].split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

// ── Small pieces ────────────────────────────────────────────────────────────

function TodoChip({ href, count, label, tone }: { href: string; count: number; label: string; tone: 'amber' | 'blue' | 'rose' }) {
  const dot = { amber: 'bg-amber-400', blue: 'bg-[#8FCBFF]', rose: 'bg-rose-400' }[tone];
  return (
    <Link
      href={href}
      className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition-colors ${
        count ? 'bg-carbon ring-white/[0.1] hover:bg-carbon-2' : 'bg-carbon/60 ring-white/[0.05] hover:bg-carbon'
      }`}
    >
      <span className={`h-2 w-2 flex-none rounded-full ${count ? dot : 'bg-white/20'}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[20px] font-semibold leading-none text-chalk">{count}</span>
        <span className="mt-1 line-clamp-2 block text-[12px] leading-snug text-smoke">{label}</span>
      </span>
      <svg className="h-4 w-4 flex-none text-smoke" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

function ActionTile({ label, cmp, icon }: { label: string; cmp: Compare; icon: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-carbon-2/60 p-4 ring-1 ring-white/[0.06]">
      <div className="flex items-center gap-2 text-smoke">
        <svg className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d={icon} />
        </svg>
        <p className="truncate text-[13px] font-medium">{label}</p>
      </div>
      <p className="mt-2 text-[24px] font-semibold leading-none text-chalk">{formatNumber(cmp.current)}</p>
      <div className="mt-2">
        <Delta cmp={cmp} label="" />
      </div>
    </div>
  );
}

const ICONS = {
  whatsapp: 'M4 20l1.4-4.2A8 8 0 1112 20a8 8 0 01-4-1.1L4 20z',
  call: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  chat: 'M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12zM8 11h8M8 14h5',
  cart: 'M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L21 8H6M9 21h.01M18 21h.01',
  click: 'M9 9l11 4-5 2-2 5-4-11zM4 4l2 2M4 12H2M12 4V2',
  instagram: 'M4 8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4zM12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM17 7h.01',
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { logout } = useAuth();
  const [range, setRange] = useState<StatsRange>('7d');
  const { data, error, loading, refresh } = useOverview(range);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchOrders().then(
      (list) => !cancelled && setOrders(list),
      () => !cancelled && setOrders([])
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const bucket = data?.range.bucket ?? 'day';
  const series = data?.series ?? [];
  const trackingStartedLate = data && (!data.trackingSince || new Date(data.trackingSince) > new Date(data.range.from));

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-asphalt text-chalk">
        <AdminSidebar onLogout={logout} />

        <main className="min-w-0 flex-1 px-4 pb-16 pt-20 sm:px-6 md:px-10 md:pt-10 lg:px-12">
          {/* Header */}
          <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-chalk sm:text-4xl">Dashboard</h1>
              <p className="mt-1 text-[13px] text-smoke">Real numbers from l7it.art · Moroccan time</p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="min-w-0 flex-1 overflow-x-auto sm:flex-none">
                <RangeTabs value={range} onChange={setRange} />
              </div>
              <button
                type="button"
                onClick={refresh}
                aria-label="Refresh numbers"
                title="Refresh"
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
              {/* To do */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <TodoChip href="/admin/orders" count={data.inbox.pendingOrders} label="Orders to confirm" tone="amber" />
                <TodoChip href="/admin/custom-orders" count={data.inbox.newCustomOrders} label="New requests" tone="blue" />
                <TodoChip href="/admin/contact-messages" count={data.inbox.unreadMessages} label="Unread messages" tone="blue" />
                <TodoChip
                  href="/admin/products"
                  count={data.inbox.lowStock.length + data.inbox.soldOut}
                  label={
                    data.inbox.lowStock.length
                      ? `Low stock: ${data.inbox.lowStock.map((p) => `${p.name} (${p.stockQuantity})`).join(', ')}`
                      : data.inbox.soldOut
                        ? `${data.inbox.soldOut} sold out`
                        : 'Stock is fine'
                  }
                  tone="rose"
                />
              </div>

              {trackingStartedLate && (
                <p className="rounded-xl bg-white/[0.03] px-4 py-2.5 text-[13px] text-smoke ring-1 ring-white/[0.06]">
                  Full visitor tracking started{' '}
                  {data.trackingSince
                    ? new Date(data.trackingSince).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'with this update'}
                  . Before that only product views were counted, so visitor numbers grow from here.
                </p>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <StatTile hero label={`Revenue · ${RANGE_WORDS[range]}`} value={formatNumber(data.kpis.revenue.current)} unit="MAD" cmp={data.kpis.revenue} spark={series.map((s) => s.revenue)} />
                <StatTile label="Orders" value={formatNumber(data.kpis.orders.current)} cmp={data.kpis.orders} spark={series.map((s) => s.orders)} />
                <StatTile label="Visitors" value={formatNumber(data.kpis.visitors.current)} cmp={data.kpis.visitors} spark={series.map((s) => s.visitors)} />
                <StatTile label="Visitors who order" value={`${data.kpis.conversion.current}%`} cmp={data.kpis.conversion} points />
                <StatTile label="Average order" value={formatNumber(data.kpis.avgOrder.current)} unit="MAD" cmp={data.kpis.avgOrder} />
              </div>

              {/* Trends */}
              <div className="grid gap-5 lg:grid-cols-2">
                <Card
                  title="Sales"
                  subtitle={`Revenue from confirmed + delivered orders, per ${bucket === 'hour' ? 'hour' : 'day'}`}
                  action={
                    <button
                      type="button"
                      onClick={() => setShowTable((v) => !v)}
                      className="h-9 flex-none rounded-full px-3 text-[12px] font-semibold text-smoke ring-1 ring-white/[0.08] hover:text-chalk"
                    >
                      {showTable ? 'Chart' : 'Table'}
                    </button>
                  }
                >
                  {showTable ? (
                    <div className="max-h-[220px] overflow-y-auto">
                      <table className="w-full text-[13px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <thead className="sticky top-0 bg-carbon text-left text-smoke">
                          <tr>
                            <th className="py-1.5 font-medium">{bucket === 'hour' ? 'Hour' : 'Day'}</th>
                            <th className="py-1.5 text-right font-medium">Orders</th>
                            <th className="py-1.5 text-right font-medium">Revenue</th>
                            <th className="py-1.5 text-right font-medium">Visitors</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-silver-light">
                          {[...series].reverse().map((s) => (
                            <tr key={s.key}>
                              <td className="py-1.5">{bucket === 'hour' ? `${s.key}h` : new Date(`${s.key}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })}</td>
                              <td className="py-1.5 text-right">{s.orders}</td>
                              <td className="py-1.5 text-right">{formatMAD(s.revenue)}</td>
                              <td className="py-1.5 text-right">{s.visitors}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <ColumnChart
                      rows={series.map((s) => ({ key: s.key, value: s.revenue }))}
                      bucket={bucket}
                      format={formatMAD}
                      ariaLabel="Revenue over time"
                      tooltipRows={(i) => [
                        { label: 'revenue', value: formatMAD(series[i].revenue) },
                        { label: 'orders', value: String(series[i].orders) },
                      ]}
                    />
                  )}
                </Card>

                <Card title="Visitors" subtitle={`${formatNumber(data.kpis.pageViews.current)} pages opened · per ${bucket === 'hour' ? 'hour' : 'day'}`}>
                  <AreaChart
                    rows={series.map((s) => ({ key: s.key, value: s.visitors }))}
                    bucket={bucket}
                    ariaLabel="Visitors over time"
                    tooltipRows={(i) => [
                      { label: 'visitors', value: formatNumber(series[i].visitors) },
                      { label: 'pages opened', value: formatNumber(series[i].pageViews) },
                    ]}
                  />
                </Card>
              </div>

              {/* Funnel + order status */}
              <div className="grid gap-5 lg:grid-cols-2">
                <Card title="From visit to order" subtitle="How many visitors reach each step">
                  <BarList
                    items={[
                      { key: 'v', label: 'Visited the site', value: data.funnel.visitors },
                      { key: 'p', label: 'Opened a product', value: data.funnel.viewedProduct, note: pct(data.funnel.viewedProduct, data.funnel.visitors) },
                      { key: 'c', label: 'Added to cart', value: data.funnel.addedToCart, note: pct(data.funnel.addedToCart, data.funnel.visitors) },
                      { key: 'k', label: 'Reached checkout', value: data.funnel.checkout, note: pct(data.funnel.checkout, data.funnel.visitors) },
                      { key: 'o', label: 'Placed an order', value: data.funnel.orders, note: pct(data.funnel.orders, data.funnel.visitors) },
                    ]}
                    empty="No visitors in this period yet"
                  />
                </Card>
                <Card title="Orders by status" subtitle={data.pendingValue ? `${formatMAD(data.pendingValue)} waiting in pending orders` : 'Orders placed in this period'}>
                  <StatusBar counts={data.orderStatus} />
                </Card>
              </div>

              {/* Products */}
              <Card
                title="Products"
                subtitle="What visitors look at, click, add to cart and buy"
                action={
                  <Link href="/admin/analytics" className="flex h-9 flex-none items-center rounded-full px-3 text-[12px] font-semibold text-smoke ring-1 ring-white/[0.08] hover:text-chalk">
                    All products →
                  </Link>
                }
              >
                <ProductLeaderboard products={data.products} limit={6} />
              </Card>

              {/* How customers reach out */}
              <Card title="How customers reach you" subtitle={`Clicks on WhatsApp, call and Instagram links, and chats started · ${plural(data.requests.chatOrders, 'order')} and ${plural(data.requests.chatQuestions, 'question')} came through the chat assistant`}>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  <ActionTile label="WhatsApp" cmp={data.actions.whatsapp} icon={ICONS.whatsapp} />
                  <ActionTile label="Calls" cmp={data.actions.calls} icon={ICONS.call} />
                  <ActionTile label="Chats" cmp={data.actions.chats} icon={ICONS.chat} />
                  <ActionTile label="Product clicks" cmp={data.actions.productClicks} icon={ICONS.click} />
                  <ActionTile label="Cart adds" cmp={data.actions.addToCart} icon={ICONS.cart} />
                  <ActionTile label="Instagram" cmp={data.actions.instagram} icon={ICONS.instagram} />
                </div>
              </Card>

              {/* Where from */}
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Where visitors come from" subtitle="First page of each visit">
                  <BarList items={data.sources.map((s) => ({ key: s.source, label: s.source.charAt(0).toUpperCase() + s.source.slice(1), value: s.visits }))} empty="No visits tracked yet" />
                </Card>
                <Card title="Devices" subtitle="Visitors by screen">
                  <BarList
                    items={data.devices.map((d) => ({
                      key: d.device,
                      label: DEVICE_NAMES[d.device] || d.device,
                      value: d.visitors,
                      note: pct(d.visitors, data.devices.reduce((s, x) => s + x.visitors, 0)),
                    }))}
                    empty="No visits tracked yet"
                  />
                </Card>
                <Card title="Top cities" subtitle="Where orders ship to">
                  <BarList items={data.cities.map((c) => ({ key: c.city, label: c.city, value: c.orders }))} empty="No orders in this period" />
                </Card>
              </div>

              <Card title="Most visited pages" subtitle="Pages opened in this period">
                <BarList
                  items={data.pages.map((p) => ({ key: p.page, label: PAGE_NAMES[p.page] || p.page, value: p.views, note: `${formatNumber(p.visitors)} visitors` }))}
                  empty="No pages tracked yet"
                />
              </Card>

              {/* Recent orders */}
              <Card
                title="Latest orders"
                action={
                  <div className="flex flex-none gap-2">
                    <button
                      type="button"
                      onClick={() => orders && exportCSV(orders)}
                      disabled={!orders?.length}
                      className="h-9 rounded-full px-3 text-[12px] font-semibold text-smoke ring-1 ring-white/[0.08] hover:text-chalk disabled:opacity-40"
                    >
                      CSV
                    </button>
                    <Link href="/admin/orders" className="flex h-9 items-center rounded-full bg-chalk px-3.5 text-[12px] font-semibold text-asphalt">
                      All orders
                    </Link>
                  </div>
                }
              >
                {!orders ? (
                  <div className="flex justify-center py-8">
                    <Loader size="sm" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-smoke">No orders yet</p>
                ) : (
                  <ul className="divide-y divide-white/[0.06]">
                    {orders.slice(0, 6).map((o) => (
                      <li key={o._id}>
                        <Link href="/admin/orders" className="flex items-center gap-3 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-medium text-chalk">
                              {o.customer.firstName} {o.customer.lastName}
                            </p>
                            <p className="mt-0.5 truncate text-[12px] text-smoke">
                              {[cityOf(o.customer.address), o.products.map((p) => `${p.quantity}× ${p.name}`).join(', ')].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <div className="flex-none text-right">
                            <p className="text-[14px] font-semibold text-chalk">{formatMAD(o.totalPrice)}</p>
                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ${STATUS_STYLE[o.status] || STATUS_STYLE.pending}`}>
                              {o.status}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

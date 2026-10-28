import Order from '../models/Order';
import PageView from '../models/PageView';
import SiteEvent from '../models/SiteEvent';
import Product from '../models/Product';
import CustomOrder from '../models/CustomOrder';
import ContactMessage from '../models/ContactMessage';

/**
 * Everything the admin dashboard shows, for one period, in Moroccan time.
 * Each figure comes with the same span just before it ("previous") so the
 * dashboard can say whether things went up or down.
 */

export const TIME_ZONE = 'Africa/Casablanca';
export const RANGES = { today: 1, '7d': 7, '30d': 30, '90d': 90 } as const;
export type RangeKey = keyof typeof RANGES;

const DAY = 24 * 60 * 60 * 1000;
const PAID = ['confirmed', 'delivered'];

export interface Compare {
  current: number;
  previous: number;
}

export interface Overview {
  range: { key: RangeKey; days: number; from: string; to: string; bucket: 'hour' | 'day'; timeZone: string };
  /** First page view recorded by the site-wide tracker (product views were tracked before that). */
  trackingSince: string | null;
  kpis: {
    revenue: Compare;
    orders: Compare;
    avgOrder: Compare;
    visitors: Compare;
    pageViews: Compare;
    /** Orders ÷ visitors, in %. */
    conversion: Compare;
  };
  series: { key: string; orders: number; revenue: number; visitors: number; pageViews: number }[];
  orderStatus: { pending: number; confirmed: number; delivered: number; cancelled: number };
  pendingValue: number;
  funnel: { visitors: number; viewedProduct: number; addedToCart: number; checkout: number; orders: number };
  actions: {
    productClicks: Compare;
    addToCart: Compare;
    whatsapp: Compare;
    calls: Compare;
    instagram: Compare;
    chats: Compare;
  };
  requests: { chatOrders: number; chatQuestions: number; formRequests: number; formMessages: number };
  devices: { device: string; visitors: number }[];
  sources: { source: string; visits: number }[];
  pages: { page: string; views: number; visitors: number }[];
  cities: { city: string; orders: number }[];
  products: {
    _id: string;
    name: string;
    image: string;
    price: number;
    category: string;
    stockQuantity: number | null;
    inStock: boolean;
    views: number;
    visitors: number;
    clicks: number;
    addToCart: number;
    sold: number;
    revenue: number;
  }[];
  inbox: {
    pendingOrders: number;
    newCustomOrders: number;
    unreadMessages: number;
    soldOut: number;
    lowStock: { _id: string; name: string; stockQuantity: number }[];
  };
}

// ── Time helpers ────────────────────────────────────────────────────────────

const partsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function localParts(at: Date): Record<string, string> {
  return Object.fromEntries(partsFormat.formatToParts(at).map((p) => [p.type, p.value]));
}

/** Milliseconds Morocco is ahead of UTC at that moment (+1h most of the year, 0 in Ramadan). */
function offsetMs(at: Date): number {
  const p = localParts(at);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

function startOfLocalDay(at: Date): Date {
  const offset = offsetMs(at);
  const local = Math.floor((at.getTime() + offset) / DAY) * DAY;
  return new Date(local - offsetMs(new Date(local - offset)));
}

/** Bucket key in Moroccan time: "2026-10-28" for days, "14" for hours. */
function bucketKey(at: Date, bucket: 'hour' | 'day'): string {
  const p = localParts(at);
  return bucket === 'hour' ? p.hour : `${p.year}-${p.month}-${p.day}`;
}

// ── Small helpers ───────────────────────────────────────────────────────────

/** City = last part of "street, city", without the checkout "| Notes:" suffix. */
export function cityOf(address: string): string {
  const main = String(address || '').split('| Notes:')[0];
  const parts = main.split(',').map((s) => s.trim()).filter(Boolean);
  const raw = (parts.length > 1 ? parts[parts.length - 1] : '').replace(/[\d.]+/g, '').trim();
  if (!raw) return 'Unknown';
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const round1 = (n: number) => Math.round(n * 10) / 10;

async function distinctSessions(match: Record<string, unknown>, model: typeof PageView | typeof SiteEvent = PageView): Promise<number> {
  const [row] = await (model as typeof PageView).aggregate([{ $match: match }, { $group: { _id: '$sessionId' } }, { $count: 'n' }]);
  return row?.n ?? 0;
}

// ── The overview ────────────────────────────────────────────────────────────

const cache = new Map<RangeKey, { at: number; data: Overview }>();
const CACHE_MS = 60 * 1000;

export async function getOverview(key: RangeKey, fresh = false): Promise<Overview> {
  const hit = cache.get(key);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  const data = await buildOverview(key);
  cache.set(key, { at: Date.now(), data });
  return data;
}

async function buildOverview(key: RangeKey): Promise<Overview> {
  const days = RANGES[key];
  const bucket: 'hour' | 'day' = days === 1 ? 'hour' : 'day';
  const to = new Date();
  const from = new Date(startOfLocalDay(to).getTime() - (days - 1) * DAY);
  // Same length just before, up to the same time of day — a fair comparison.
  const prevFrom = new Date(from.getTime() - days * DAY);
  const prevTo = new Date(to.getTime() - days * DAY);

  const cur = { $gte: from, $lte: to };
  const prev = { $gte: prevFrom, $lte: prevTo };
  const dateFormat = bucket === 'hour' ? '%H' : '%Y-%m-%d';

  const [
    orders,
    prevOrders,
    visitors,
    prevVisitors,
    pageViews,
    prevPageViews,
    trafficSeries,
    devices,
    sources,
    pages,
    productViews,
    viewedProduct,
    reachedCheckout,
    eventCounts,
    prevEventCounts,
    productEvents,
    addedToCart,
    customOrders,
    messages,
    products,
    pendingOrders,
    newCustomOrders,
    unreadMessages,
    firstTracked,
  ] = await Promise.all([
    Order.find({ createdAt: cur }, { status: 1, totalPrice: 1, products: 1, createdAt: 1, 'customer.address': 1 }).lean(),
    Order.find({ createdAt: prev }, { status: 1, totalPrice: 1 }).lean(),
    distinctSessions({ timestamp: cur }),
    distinctSessions({ timestamp: prev }),
    PageView.countDocuments({ timestamp: cur }),
    PageView.countDocuments({ timestamp: prev }),
    PageView.aggregate<{ _id: string; views: number; visitors: number }>([
      { $match: { timestamp: cur } },
      { $group: { _id: { k: { $dateToString: { format: dateFormat, date: '$timestamp', timezone: TIME_ZONE } }, s: '$sessionId' }, views: { $sum: 1 } } },
      { $group: { _id: '$_id.k', views: { $sum: '$views' }, visitors: { $sum: 1 } } },
    ]),
    PageView.aggregate<{ _id: string; visitors: number }>([
      { $match: { timestamp: cur, device: { $exists: true } } },
      { $group: { _id: { d: '$device', s: '$sessionId' } } },
      { $group: { _id: '$_id.d', visitors: { $sum: 1 } } },
      { $sort: { visitors: -1 } },
    ]),
    PageView.aggregate<{ _id: string; visits: number }>([
      { $match: { timestamp: cur, landing: true } },
      { $group: { _id: { $ifNull: ['$source', 'direct'] }, visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: 8 },
    ]),
    PageView.aggregate<{ _id: string; views: number; sessions: string[] }>([
      { $match: { timestamp: cur } },
      { $group: { _id: '$pageType', views: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
      { $sort: { views: -1 } },
    ]),
    PageView.aggregate<{ _id: unknown; views: number; sessions: string[] }>([
      { $match: { timestamp: cur, pageType: 'product', productId: { $exists: true, $ne: null } } },
      { $group: { _id: '$productId', views: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
    ]),
    distinctSessions({ timestamp: cur, pageType: 'product' }),
    distinctSessions({ timestamp: cur, pageType: 'checkout' }),
    SiteEvent.aggregate<{ _id: string; count: number }>([{ $match: { timestamp: cur } }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
    SiteEvent.aggregate<{ _id: string; count: number }>([{ $match: { timestamp: prev } }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
    SiteEvent.aggregate<{ _id: { p: unknown; t: string }; count: number }>([
      { $match: { timestamp: cur, productId: { $exists: true, $ne: null }, type: { $in: ['product_click', 'add_to_cart'] } } },
      { $group: { _id: { p: '$productId', t: '$type' }, count: { $sum: 1 } } },
    ]),
    distinctSessions({ timestamp: cur, type: 'add_to_cart' }, SiteEvent),
    CustomOrder.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: cur } },
      { $group: { _id: { $ifNull: ['$source', 'form'] }, count: { $sum: 1 } } },
    ]),
    ContactMessage.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: cur } },
      { $group: { _id: { $ifNull: ['$source', 'form'] }, count: { $sum: 1 } } },
    ]),
    Product.find({}, { name: 1, image: 1, price: 1, category: 1, stockQuantity: 1, inStock: 1 }).lean(),
    Order.countDocuments({ status: 'pending' }),
    CustomOrder.countDocuments({ status: 'pending' }),
    ContactMessage.countDocuments({ status: 'unread' }),
    PageView.findOne({ path: { $exists: true } }, { timestamp: 1 }).sort({ timestamp: 1 }).lean(),
  ]);

  // ── Sales ──
  const live = orders.filter((o) => o.status !== 'cancelled');
  const revenueOf = (list: { status: string; totalPrice: number }[]) =>
    list.filter((o) => PAID.includes(o.status)).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const prevLive = prevOrders.filter((o) => o.status !== 'cancelled');
  const avg = (list: { totalPrice: number }[]) => (list.length ? Math.round(list.reduce((s, o) => s + (o.totalPrice || 0), 0) / list.length) : 0);

  const orderStatus = { pending: 0, confirmed: 0, delivered: 0, cancelled: 0 };
  for (const o of orders) if (o.status in orderStatus) orderStatus[o.status as keyof typeof orderStatus]++;
  const pendingValue = orders.filter((o) => o.status === 'pending').reduce((s, o) => s + (o.totalPrice || 0), 0);

  // ── Series (every bucket present, even empty ones) ──
  const keys =
    bucket === 'hour'
      ? Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'))
      : Array.from({ length: days }, (_, i) => bucketKey(new Date(from.getTime() + i * DAY + 12 * 60 * 60 * 1000), 'day'));
  const series = new Map(keys.map((k) => [k, { key: k, orders: 0, revenue: 0, visitors: 0, pageViews: 0 }]));
  for (const o of live) {
    const row = series.get(bucketKey(new Date(o.createdAt), bucket));
    if (!row) continue;
    row.orders++;
    if (PAID.includes(o.status)) row.revenue += o.totalPrice || 0;
  }
  for (const t of trafficSeries) {
    const row = series.get(t._id);
    if (row) Object.assign(row, { visitors: t.visitors, pageViews: t.views });
  }

  // ── Cities ──
  const cityCounts = new Map<string, number>();
  for (const o of live) {
    const city = cityOf((o as { customer?: { address?: string } }).customer?.address || '');
    cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
  }
  const cities = [...cityCounts]
    .map(([city, n]) => ({ city, orders: n }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  // ── Products ──
  const stats = new Map<string, { views: number; visitors: number; clicks: number; addToCart: number; sold: number; revenue: number }>();
  const statOf = (id: string) => {
    let s = stats.get(id);
    if (!s) stats.set(id, (s = { views: 0, visitors: 0, clicks: 0, addToCart: 0, sold: 0, revenue: 0 }));
    return s;
  };
  for (const v of productViews) Object.assign(statOf(String(v._id)), { views: v.views, visitors: v.sessions.length });
  for (const e of productEvents) {
    const s = statOf(String(e._id.p));
    if (e._id.t === 'product_click') s.clicks += e.count;
    else s.addToCart += e.count;
  }
  for (const o of live) {
    for (const line of o.products || []) {
      if (!line.productId) continue;
      const s = statOf(String(line.productId));
      s.sold += line.quantity || 0;
      if (PAID.includes(o.status)) s.revenue += (line.price || 0) * (line.quantity || 0);
    }
  }
  const productRows = products
    .map((p) => {
      const s = stats.get(String(p._id)) || { views: 0, visitors: 0, clicks: 0, addToCart: 0, sold: 0, revenue: 0 };
      return {
        _id: String(p._id),
        name: p.name,
        image: p.image,
        price: p.price,
        category: p.category,
        stockQuantity: typeof p.stockQuantity === 'number' ? p.stockQuantity : null,
        inStock: p.inStock !== false,
        ...s,
      };
    })
    .sort((a, b) => b.views - a.views || b.clicks - a.clicks || b.sold - a.sold || a.name.localeCompare(b.name));

  // ── Events ──
  const countOf = (rows: { _id: string; count: number }[], type: string) => rows.find((r) => r._id === type)?.count ?? 0;
  const compareEvent = (type: string): Compare => ({ current: countOf(eventCounts, type), previous: countOf(prevEventCounts, type) });

  const lowStock = products
    .filter((p) => typeof p.stockQuantity === 'number' && p.stockQuantity > 0 && p.stockQuantity <= 3 && p.inStock !== false)
    .map((p) => ({ _id: String(p._id), name: p.name, stockQuantity: p.stockQuantity as number }));
  const soldOut = products.filter((p) => p.inStock === false || p.stockQuantity === 0).length;

  return {
    range: { key, days, from: from.toISOString(), to: to.toISOString(), bucket, timeZone: TIME_ZONE },
    trackingSince: firstTracked?.timestamp ? new Date(firstTracked.timestamp).toISOString() : null,
    kpis: {
      revenue: { current: revenueOf(orders), previous: revenueOf(prevOrders) },
      orders: { current: live.length, previous: prevLive.length },
      avgOrder: { current: avg(live), previous: avg(prevLive) },
      visitors: { current: visitors, previous: prevVisitors },
      pageViews: { current: pageViews, previous: prevPageViews },
      conversion: {
        current: visitors ? round1((live.length / visitors) * 100) : 0,
        previous: prevVisitors ? round1((prevLive.length / prevVisitors) * 100) : 0,
      },
    },
    series: keys.map((k) => series.get(k)!),
    orderStatus,
    pendingValue,
    funnel: { visitors, viewedProduct, addedToCart, checkout: reachedCheckout, orders: live.length },
    actions: {
      productClicks: compareEvent('product_click'),
      addToCart: compareEvent('add_to_cart'),
      whatsapp: compareEvent('whatsapp_click'),
      calls: compareEvent('call_click'),
      instagram: compareEvent('instagram_click'),
      chats: compareEvent('chat_open'),
    },
    requests: {
      chatOrders: countOf(customOrders, 'chatbot'),
      chatQuestions: countOf(messages, 'chatbot'),
      formRequests: countOf(customOrders, 'form'),
      formMessages: countOf(messages, 'form'),
    },
    devices: devices.map((d) => ({ device: d._id, visitors: d.visitors })),
    sources: sources.map((s) => ({ source: s._id, visits: s.visits })),
    pages: pages.map((p) => ({ page: p._id, views: p.views, visitors: p.sessions.length })),
    cities,
    products: productRows,
    inbox: { pendingOrders, newCustomOrders, unreadMessages, soldOut, lowStock },
  };
}

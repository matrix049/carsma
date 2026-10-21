/**
 * Everything the chat assistant is allowed to know: the shop's fixed rules
 * plus the live catalogue from MongoDB. Edit SHOP_FACTS when a policy
 * changes; products update by themselves.
 */
import mongoose from 'mongoose';
import Product from '../models/Product';

export const SHOP_FACTS = `
SHOP
- L7IT (الحيط, "the wall"): automotive wall art. Studio in Salé, Morocco. Website catalogue: "The Garage".
- WhatsApp and phone calls: +212 765 810 304. Instagram: @l7it.art. There is no email address.

PRODUCT
- Wall panels printed with UV ink on 3 mm Alucobond (aluminium composite). Pre-drilled, ready to hang, no frame needed.
- Finish: matte or glossy; the team confirms the finish with the customer after the order.
- Standard size 120 x 35 cm. Also 120 x 50 cm. A custom size is possible on some orders — the customer must ask the team before ordering.
- Two styles: 2D (flat print) and 3D (layered, real depth). 2D is cheaper. 3D costs more because it takes much more work.
- Colours: black and white are always possible. Any other colour must first be checked by the team; the team then replies. Never promise another colour.
- Care: keep away from direct sun and moisture; wipe with a soft dry cloth.

CUSTOM WORK
- Yes, we make anything custom: any car, a motorbike, a plane, a logo, a brand, anything the customer wants.
- To prepare a custom piece we need: what exactly (car make, model and year, or the logo/design), which side (front, side or rear), 2D or 3D, and the colour.
- Custom pieces that are not in the catalogue need a partial advance payment (a deposit) before production. Not the full price — only part of it. The rest is paid on delivery.
- Custom prices are quoted by the team (they depend on the design, size and 2D/3D). Never invent a custom price.

ORDERING, PAYMENT, DELIVERY
- Order on the website (add to cart, checkout with name, phone, address and city) or on WhatsApp.
- Catalogue pieces: cash on delivery, nothing to pay in advance.
- Delivery to every city in Morocco (Casablanca, Rabat, Salé, Marrakech, Fès, Tanger, Agadir, Oujda, Laâyoune/العيون, Dakhla and all others) in 24 hours to 3 days. Delivery is free. A tracking number is sent when it ships. No delivery outside Morocco.
- Returns are not accepted: every piece is made to order. Customers should ask their questions before ordering.
- The assistant cannot see orders. For an order status the customer sends a request to the team (or WhatsApp).
`.trim();

interface CatalogItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  dimensions: string;
  inStock: boolean;
}

const CATALOG_TTL_MS = 5 * 60 * 1000;
let cache: { items: CatalogItem[]; at: number } | null = null;

export async function getCatalog(): Promise<CatalogItem[]> {
  if (cache && Date.now() - cache.at < CATALOG_TTL_MS) return cache.items;
  // Don't let a chat reply wait on Mongoose's command buffering while the DB is down.
  if (mongoose.connection.readyState !== 1) return cache?.items || [];
  try {
    const docs = await Product.find({}, 'name category price image dimensions inStock').sort({ createdAt: -1 }).lean();
    const items = docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      category: d.category,
      price: d.price,
      image: d.image,
      dimensions: d.dimensions || '120cm x 35cm',
      inStock: d.inStock !== false,
    }));
    cache = { items, at: Date.now() };
    return items;
  } catch (err) {
    console.warn('⚠ Chat catalogue load failed:', (err as Error).message);
    return cache?.items || [];
  }
}

export function catalogText(items: CatalogItem[]): string {
  if (!items.length) return '(catalogue unavailable right now — point customers to the website)';
  return items
    .map((p) => `- id:${p._id} | ${p.name} | brand: ${p.category} | ${p.price} MAD | ${p.dimensions} | ${p.inStock ? 'in stock' : 'out of stock'}`)
    .join('\n');
}

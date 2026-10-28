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
- Two styles, both premium: 2D = a clean, elegant design with the car's essential lines. 3D = rich in details with real depth, the closest to the real car. Present both positively and let the customer choose. Only if the customer asks about price: 3D is priced higher than 2D because of the extra detail, and the team confirms the exact price.
- Colours: black and white are always possible. Any other colour must first be checked by the team; the team then replies. Never promise another colour.
- Care: keep away from direct sun and moisture; wipe with a soft dry cloth.

NEW 3D EDITIONS (the pieces we push first — in stock, ready to ship)
- G-Class 3D: 120 x 75 cm. 911 3D: 120 x 50 cm. Each comes in that one size only: no bigger or smaller version. Stock is limited (see the catalogue line for the pieces left).
- If a customer likes a 3D edition but finds it too expensive, suggest the 2D version of the same car from the catalogue (G Class AMG G63 for the G-Class, 911 GT3 RS for the 911): same car, a lighter budget. Show it with its product id.

CUSTOM WORK
- Yes, we make anything custom: any car, a motorbike, a plane, a logo, a brand, anything the customer wants.
- To prepare a custom piece we need: what exactly (car make, model and year, or the logo/design), which side (front, side or rear), 2D or 3D, and the colour.
- To start a custom piece that is not in the catalogue we ask for a partial advance payment. Not the full price — only part of it. The rest is paid on delivery.
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
  stockQuantity: number | null;
}

const CATALOG_TTL_MS = 5 * 60 * 1000;
let cache: { items: CatalogItem[]; at: number } | null = null;

export async function getCatalog(): Promise<CatalogItem[]> {
  if (cache && Date.now() - cache.at < CATALOG_TTL_MS) return cache.items;
  // Don't let a chat reply wait on Mongoose's command buffering while the DB is down.
  if (mongoose.connection.readyState !== 1) return cache?.items || [];
  try {
    const docs = await Product.find({}, 'name category price image dimensions inStock stockQuantity').sort({ createdAt: -1 }).lean();
    const items = docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      category: d.category,
      price: d.price,
      image: d.image,
      dimensions: d.dimensions || '120cm x 35cm',
      inStock: d.inStock !== false && d.stockQuantity !== 0,
      stockQuantity: typeof d.stockQuantity === 'number' ? d.stockQuantity : null,
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
    .map((p) => {
      const stock = !p.inStock ? 'out of stock' : p.stockQuantity !== null ? `${p.stockQuantity} left` : 'in stock';
      return `- id:${p._id} | ${p.name} | brand: ${p.category} | ${p.price} MAD | ${p.dimensions} | ${stock}`;
    })
    .join('\n');
}

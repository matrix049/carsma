import mongoose, { Document, Schema } from 'mongoose';

/** Things visitors do on the storefront, besides opening pages. */
export const SITE_EVENT_TYPES = [
  'product_click', // opened a product from a card, the chat, the upsell…
  'add_to_cart',
  'whatsapp_click',
  'call_click',
  'instagram_click',
  'chat_open', // started a conversation with the chat assistant
] as const;
export type SiteEventType = (typeof SITE_EVENT_TYPES)[number];

export const PAGE_TYPES = ['home', 'shop', 'product', 'contact', 'faq', 'cart', 'checkout', 'customize'] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const DEVICES = ['mobile', 'tablet', 'desktop'] as const;
export type Device = (typeof DEVICES)[number];

export interface ISiteEvent extends Document {
  type: SiteEventType;
  productId?: mongoose.Types.ObjectId;
  /** Page the visitor was on when it happened. */
  page?: PageType;
  sessionId: string;
  device?: Device;
  timestamp: Date;
}

const SiteEventSchema = new Schema<ISiteEvent>({
  type: { type: String, enum: SITE_EVENT_TYPES, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  page: { type: String, enum: PAGE_TYPES },
  sessionId: { type: String, required: true, maxlength: 100 },
  device: { type: String, enum: DEVICES },
  timestamp: { type: Date, default: Date.now, required: true },
});

SiteEventSchema.index({ timestamp: -1, type: 1 });
SiteEventSchema.index({ productId: 1, timestamp: -1 });
// Keep one year, like page views.
SiteEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

const SiteEvent = mongoose.model<ISiteEvent>('SiteEvent', SiteEventSchema);

export default SiteEvent;

import crypto from 'crypto';
import mongoose from 'mongoose';
import Order, { IOrder, WhatsAppState } from '../models/Order';
import { sendNotification } from './notificationService';

/**
 * Order confirmation on WhatsApp, through Meta's official Cloud API.
 *
 * New order → an approved template message (name, items, total, address) with
 * "Confirm" / "Cancel" buttons → the customer's answer comes back on the webhook
 * and shows on the order in the admin. Numbers without WhatsApp (landlines, or
 * Meta reporting "not on WhatsApp") are flagged so the team calls them instead.
 *
 * Off until WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set.
 */

const config = () => ({
  token: process.env.WHATSAPP_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  template: process.env.WHATSAPP_TEMPLATE || 'order_confirmation',
  language: process.env.WHATSAPP_TEMPLATE_LANG || 'ar',
  apiBase: (process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com/v23.0').replace(/\/+$/, ''),
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
  appSecret: process.env.WHATSAPP_APP_SECRET || '',
});

export const whatsappEnabled = () => {
  const c = config();
  return Boolean(c.token && c.phoneNumberId);
};

/** Meta's error when the number has no WhatsApp account. */
const NOT_ON_WHATSAPP = 131026;
/** Still waiting for the customer: later delivery/read receipts may move these forward. */
const WAITING: WhatsAppState[] = ['sent', 'delivered', 'read'];
const RECEIPT_ORDER: Partial<Record<WhatsAppState, number>> = { sent: 1, delivered: 2, read: 3 };

// ---------- phone numbers ----------

/**
 * What the customer typed → a WhatsApp number ("212612345678").
 * Moroccan 05… numbers are landlines: no WhatsApp, the team calls them.
 */
export function classifyPhone(phone: string): { kind: 'mobile' | 'landline' | 'invalid'; to?: string } {
  let d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 13 && d.startsWith('2120')) d = `212${d.slice(4)}`; // "+212 06…"
  if (d.length === 10 && d.startsWith('0')) d = `212${d.slice(1)}`;
  if (d.length === 9 && /^[567]/.test(d)) d = `212${d}`;
  if (d.startsWith('212')) {
    if (!/^212[5-7]\d{8}$/.test(d)) return { kind: 'invalid' };
    return d[3] === '5' ? { kind: 'landline', to: d } : { kind: 'mobile', to: d };
  }
  return /^[1-9]\d{7,14}$/.test(d) ? { kind: 'mobile', to: d } : { kind: 'invalid' };
}

// ---------- reading the customer's answer ----------

const YES = ['نعم', 'ايه', 'إيه', 'اه', 'آه', 'أكد', 'اكد', 'أكيد', 'اكيد', 'واخا', 'صافي', 'ok', 'okay', 'oui', 'yes', 'wakha', 'wah', 'ah', 'confirm', 'confirme', 'confirmé', 'safi'];
const NO = ['لا', 'ألغي', 'الغي', 'إلغاء', 'الغاء', 'مابغيتش', 'no', 'non', 'la', 'annuler', 'annule', 'cancel', 'mabghitch'];

/** A typed reply that clearly says yes or no; anything else is left for the team to read. */
export function readAnswer(text: string): 'confirmed' | 'declined' | null {
  const t = (text || '').trim().toLowerCase();
  if (!t) return null;
  if (/^(✅|👍)/u.test(t)) return 'confirmed';
  if (/^(❌|👎)/u.test(t) || t.startsWith('ما بغيت')) return 'declined';
  const first = t.split(/[\s,.!?؟،]+/).find(Boolean) || '';
  if (YES.includes(first)) return 'confirmed';
  if (NO.includes(first)) return 'declined';
  return null;
}

// ---------- sending ----------

/** Template parameters can't hold line breaks or long runs of spaces. */
const clean = (value: unknown) =>
  String(value ?? '').replace(/[\r\n\t]+/g, ' ').replace(/ {4,}/g, '   ').trim().slice(0, 300) || '-';

const itemsText = (order: IOrder) => order.products.map((p) => `${p.name} ×${p.quantity}`).join('، ');

async function graph(body: Record<string, unknown>): Promise<any> {
  const c = config();
  const res = await fetch(`${c.apiBase}/${c.phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
    signal: AbortSignal.timeout(15000),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(json?.error?.message || `WhatsApp API error ${res.status}`), { code: json?.error?.code });
  }
  return json;
}

const sendText = (to: string, text: string) => graph({ to, type: 'text', text: { body: text } });

const setWhatsApp = (orderId: IOrder['_id'], whatsapp: Record<string, unknown>) =>
  Order.updateOne({ _id: orderId }, { $set: { whatsapp } });

/** Sends the confirmation template for an order (also used to resend from the admin). */
export async function sendOrderConfirmation(order: IOrder): Promise<void> {
  const at = new Date();
  const phone = classifyPhone(order.customer.phone);
  if (phone.kind !== 'mobile') {
    await setWhatsApp(order._id, {
      state: phone.kind === 'landline' ? 'no_whatsapp' : 'bad_number',
      to: phone.to ?? null,
      at,
      error: phone.kind === 'landline' ? 'Landline number' : 'Phone number not usable',
    });
    return;
  }

  const c = config();
  const id = order._id.toString();
  try {
    const result = await graph({
      to: phone.to,
      type: 'template',
      template: {
        name: c.template,
        language: { code: c.language },
        components: [
          {
            type: 'body',
            parameters: [order.customer.firstName, itemsText(order), String(order.totalPrice), order.customer.address]
              .map((text) => ({ type: 'text', text: clean(text) })),
          },
          // The order id rides on the buttons, so a tap always lands on the right order.
          { type: 'button', sub_type: 'quick_reply', index: '0', parameters: [{ type: 'payload', payload: `CONFIRM:${id}` }] },
          { type: 'button', sub_type: 'quick_reply', index: '1', parameters: [{ type: 'payload', payload: `CANCEL:${id}` }] },
        ],
      },
    });
    await setWhatsApp(order._id, { state: 'sent', to: phone.to, messageId: result?.messages?.[0]?.id ?? null, at });
  } catch (error: any) {
    await setWhatsApp(order._id, {
      state: error?.code === NOT_ON_WHATSAPP ? 'no_whatsapp' : 'failed',
      to: phone.to,
      at,
      error: String(error?.message || 'WhatsApp error').slice(0, 300),
    });
  }
}

// ---------- webhook ----------

export function verifyWebhook(mode: unknown, token: unknown): boolean {
  const expected = config().verifyToken;
  return mode === 'subscribe' && Boolean(expected) && token === expected;
}

/** Meta signs every webhook with the app secret; anything else is refused. */
export function validSignature(raw: Buffer, header: string | undefined): boolean {
  const secret = config().appSecret;
  if (!secret || !header?.startsWith('sha256=')) return false;
  const expected = Buffer.from(crypto.createHmac('sha256', secret).update(raw).digest('hex'), 'hex');
  const given = Buffer.from(header.slice(7), 'hex');
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

async function onStatus(status: any): Promise<void> {
  if (!status?.id) return;
  if (status.status === 'failed') {
    const error = status.errors?.[0];
    await Order.updateOne(
      { 'whatsapp.messageId': status.id, 'whatsapp.state': { $in: WAITING } },
      { $set: {
        'whatsapp.state': error?.code === NOT_ON_WHATSAPP ? 'no_whatsapp' : 'failed',
        'whatsapp.error': String(error?.title || error?.message || 'Not delivered').slice(0, 300),
      } },
    );
    return;
  }
  const rank = RECEIPT_ORDER[status.status as WhatsAppState];
  if (!rank) return;
  // Only forward (sent → delivered → read), and never over an answer.
  const earlier = WAITING.filter((s) => (RECEIPT_ORDER[s] || 0) < rank);
  await Order.updateOne(
    { 'whatsapp.messageId': status.id, 'whatsapp.state': { $in: earlier } },
    { $set: { 'whatsapp.state': status.status } },
  );
}

async function onMessage(message: any): Promise<void> {
  const from = String(message?.from || '');
  if (!from) return;
  const payload: string = message.button?.payload || message.interactive?.button_reply?.id || '';
  const text: string = message.button?.text || message.interactive?.button_reply?.title || message.text?.body || '';
  const [action, orderId] = payload.split(':');

  let order: IOrder | null = null;
  if (orderId && mongoose.isValidObjectId(orderId)) order = await Order.findById(orderId);
  if (!order) order = await Order.findOne({ 'whatsapp.to': from }).sort({ createdAt: -1 });
  // Only the customer the message went to can answer for that order.
  if (!order?.whatsapp || order.whatsapp.to !== from) return;

  const before = order.whatsapp.state;
  const answer = action === 'CONFIRM' ? 'confirmed' : action === 'CANCEL' ? 'declined' : readAnswer(text);
  const state: WhatsAppState = answer || (WAITING.includes(before) || before === 'failed' ? 'replied' : before);

  await Order.updateOne({ _id: order._id }, {
    $set: { 'whatsapp.state': state, 'whatsapp.reply': clean(text).slice(0, 500), 'whatsapp.repliedAt': new Date() },
  });
  if (state === before && state !== 'replied') return; // same answer again (or a repeat delivery from Meta)

  const name = order.customer.firstName;
  const adminUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/orders` : undefined;
  try {
    if (state === 'confirmed') {
      await sendText(from, `شكرا ${name} 🙏 الطلب ديالك تأكد ✅ غادي نصيفطوه ليك، والموزع غادي يعيط ليك قبل ما يوصل، عافاك جاوبو 📞`);
    } else if (state === 'declined') {
      await sendText(from, `واخا ${name}، الطلب تلغى. إلا بدلتي رأيك ولا عندك شي سؤال، كتب لينا هنا 🙏`);
    }
  } catch (error) {
    console.error('WhatsApp auto-reply failed:', (error as Error).message);
  }
  const title = state === 'confirmed' ? '✅ تأكد ف واتساب' : state === 'declined' ? '❌ تلغى ف واتساب' : '💬 رد ف واتساب';
  await sendNotification({
    title,
    message: `#${order.orderNumber} ${name}${state === 'replied' ? `: ${clean(text).slice(0, 200)}` : ''}`,
    priority: 'high',
    tags: ['speech_balloon'],
    click: adminUrl,
  }).catch(() => {});
}

/** Everything Meta sends on the webhook: delivery receipts and customer messages. */
export async function handleWebhook(body: any): Promise<void> {
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value ?? {};
      for (const status of value.statuses ?? []) await onStatus(status);
      for (const message of value.messages ?? []) await onMessage(message);
    }
  }
}

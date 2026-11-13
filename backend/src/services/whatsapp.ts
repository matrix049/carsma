import crypto from 'crypto';
import mongoose from 'mongoose';
import Order, { IOrder, WhatsAppState } from '../models/Order';
import { sendNotification } from './notificationService';
import { accountsLine, transferReference } from './bankTransfer';

/**
 * Order confirmation on WhatsApp, through Meta's official Cloud API.
 *
 * New order → an approved template message (name, items, total, address) with
 * "Confirm" / "Cancel" buttons → the customer's answer comes back on the webhook
 * and shows on the order in the admin. Numbers without WhatsApp (landlines, or
 * Meta reporting "not on WhatsApp") are flagged so the team calls them instead.
 *
 * Bank transfer orders get their own template instead: the total, the accounts
 * (from the server's settings, see bankTransfer.ts), the order reference to put as
 * the transfer reason, and "I paid" / "Cancel" / "Talk to someone" buttons.
 * Screenshots sent back are kept on the order so the team can see them in the
 * admin. Until that template exists, transfer orders get the normal confirmation.
 *
 * Off until WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set.
 */

const config = () => ({
  token: process.env.WHATSAPP_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  template: process.env.WHATSAPP_TEMPLATE || 'order_confirmation',
  transferTemplate: process.env.WHATSAPP_TEMPLATE_TRANSFER || 'order_transfer',
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
/** Meta's error when the template doesn't exist (yet) in that language. */
const NO_TEMPLATE = 132001;
/** Screenshots kept per order. */
const MAX_MEDIA = 5;

const isTransfer = (order: IOrder) => order.paymentMethod === 'bank_transfer';
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
const PAID = ['خلصت', 'خلصنا', 'حولت', 'payé', 'paye', 'payée', 'paid', 'khlst', 'khalast', 'khlast', 'khalst', 'tkhlst'];

/** A typed reply that clearly says yes, no or "I paid"; anything else is left for the team to read. */
export function readAnswer(text: string): 'confirmed' | 'declined' | 'paid' | null {
  const t = (text || '').trim().toLowerCase();
  if (!t) return null;
  if (/^(✅|👍)/u.test(t)) return 'confirmed';
  if (/^(❌|👎)/u.test(t) || t.startsWith('ما بغيت')) return 'declined';
  const first = t.split(/[\s,.!?؟،]+/).find(Boolean) || '';
  if (PAID.includes(first)) return 'paid';
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

/** A fresh send replaces the old status, but screenshots already received stay. */
const setWhatsApp = (order: IOrder, whatsapp: Record<string, unknown>) =>
  Order.updateOne({ _id: order._id }, { $set: { whatsapp: { ...whatsapp, media: order.whatsapp?.media ?? [] } } });

/** Sends the confirmation template for an order (also used to resend from the admin). */
export async function sendOrderConfirmation(order: IOrder): Promise<void> {
  const at = new Date();
  const phone = classifyPhone(order.customer.phone);
  if (phone.kind !== 'mobile') {
    await setWhatsApp(order, {
      state: phone.kind === 'landline' ? 'no_whatsapp' : 'bad_number',
      to: phone.to ?? null,
      at,
      error: phone.kind === 'landline' ? 'Landline number' : 'Phone number not usable',
    });
    return;
  }

  const c = config();
  const id = order._id.toString();
  // The order id rides on the buttons, so a tap always lands on the right order.
  const buttons = (payloads: string[]) => payloads.map((p, i) => ({
    type: 'button', sub_type: 'quick_reply', index: String(i), parameters: [{ type: 'payload', payload: `${p}:${id}` }],
  }));
  const body = (values: unknown[]) => ({ type: 'body', parameters: values.map((text) => ({ type: 'text', text: clean(text) })) });
  const send = (name: string, components: unknown[]) =>
    graph({ to: phone.to, type: 'template', template: { name, language: { code: c.language }, components } });
  const confirmation = () => send(c.template, [
    body([order.customer.firstName, itemsText(order), String(order.totalPrice), order.customer.address]),
    ...buttons(['CONFIRM', 'CANCEL']),
  ]);

  try {
    let template = c.template;
    let result;
    const accounts = accountsLine();
    if (isTransfer(order) && accounts) {
      try {
        result = await send(c.transferTemplate, [
          body([order.customer.firstName, String(order.totalPrice), accounts, transferReference(order.orderNumber)]),
          ...buttons(['PAID', 'CANCEL', 'HUMAN']),
        ]);
        template = c.transferTemplate;
      } catch (error: any) {
        if (error?.code !== NO_TEMPLATE) throw error;
        result = await confirmation(); // transfer template not created yet
      }
    } else {
      result = await confirmation();
    }
    await setWhatsApp(order, { state: 'sent', to: phone.to, messageId: result?.messages?.[0]?.id ?? null, template, at });
  } catch (error: any) {
    await setWhatsApp(order, {
      state: error?.code === NOT_ON_WHATSAPP ? 'no_whatsapp' : 'failed',
      to: phone.to,
      at,
      error: String(error?.message || 'WhatsApp error').slice(0, 300),
    });
  }
}

/** A screenshot (or file) the customer sent, for the admin to look at. */
export async function fetchMedia(mediaId: string): Promise<{ data: Buffer; mime: string }> {
  const c = config();
  const auth = { Authorization: `Bearer ${c.token}` };
  const info = await fetch(`${c.apiBase}/${encodeURIComponent(mediaId)}`, { headers: auth, signal: AbortSignal.timeout(15000) });
  const meta: any = await info.json().catch(() => ({}));
  if (!info.ok || !meta?.url) throw new Error(meta?.error?.message || 'Media not found');
  const file = await fetch(meta.url, { headers: auth, signal: AbortSignal.timeout(30000) });
  if (!file.ok) throw new Error(`Media download failed (${file.status})`);
  return { data: Buffer.from(await file.arrayBuffer()), mime: meta.mime_type || file.headers.get('content-type') || 'application/octet-stream' };
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
  const file = message.image || message.document;
  const text: string =
    message.button?.text || message.interactive?.button_reply?.title || message.text?.body ||
    (file ? `📷 ${file.caption || file.filename || 'Photo'}` : '');
  const [action, orderId] = payload.split(':');

  let order: IOrder | null = null;
  if (orderId && mongoose.isValidObjectId(orderId)) order = await Order.findById(orderId);
  if (!order) order = await Order.findOne({ 'whatsapp.to': from }).sort({ createdAt: -1 });
  // Only the customer the message went to can answer for that order.
  if (!order?.whatsapp || order.whatsapp.to !== from) return;

  const before = order.whatsapp.state;
  const transfer = isTransfer(order);
  let answer: WhatsAppState | null =
    action === 'CONFIRM' ? 'confirmed' : action === 'CANCEL' ? 'declined' : action === 'PAID' ? 'paid' : action === 'HUMAN' ? 'replied' : readAnswer(text);
  if (file && transfer && before !== 'declined') answer = 'paid'; // a screenshot of the transfer
  if (answer === 'paid' && !transfer) answer = 'replied'; // "I paid" means nothing on cash on delivery: let the team read it
  const open = WAITING.includes(before) || before === 'failed' || before === 'replied';
  const state: WhatsAppState = answer ?? (open ? 'replied' : before);
  const reply = action === 'HUMAN' ? '💬 Wants to talk to someone' : clean(text).slice(0, 500);

  const update: Record<string, unknown> = { 'whatsapp.state': state, 'whatsapp.reply': reply, 'whatsapp.repliedAt': new Date() };
  const media = order.whatsapp.media ?? [];
  const newFile = Boolean(file?.id) && !media.some((m) => m.id === String(file.id));
  if (newFile) {
    await Order.updateOne({ _id: order._id }, {
      $push: { 'whatsapp.media': { $each: [{ id: String(file.id), mime: String(file.mime_type || ''), at: new Date() }], $slice: -MAX_MEDIA } },
    });
  }
  await Order.updateOne({ _id: order._id }, { $set: update });
  // Same answer again (or Meta repeating a delivery): nothing to say — unless it's the first screenshot.
  const firstScreenshot = newFile && media.length === 0 && state === 'paid';
  if (state === before && state !== 'replied' && !firstScreenshot) return;

  const name = order.customer.firstName;
  const adminUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/orders` : undefined;
  try {
    if (state === 'confirmed') {
      await sendText(from, `شكرا ${name} 🙏 الطلب ديالك تأكد ✅ غادي نصيفطوه ليك، والموزع غادي يعيط ليك قبل ما يوصل، عافاك جاوبو 📞`);
    } else if (state === 'declined') {
      await sendText(from, `واخا ${name}، الطلب تلغى. إلا بدلتي رأيك ولا عندك شي سؤال، كتب لينا هنا 🙏`);
    } else if (state === 'paid') {
      await sendText(from, file
        ? `توصلنا بالسكرين ✅ شكرا ${name}! غادي نتأكدو من التحويل ونصيفطو الطلب ديالك ف أقرب وقت.`
        : `شكرا ${name} 🙏 عافاك صيفط لينا السكرين ديال التحويل هنا، باش نتأكدو منو ونصيفطو الطلب ديالك.`);
    } else if (action === 'HUMAN') {
      await sendText(from, `واخا ${name}، شي واحد من الفريق غادي يتواصل معاك دابا 🙏`);
    }
  } catch (error) {
    console.error('WhatsApp auto-reply failed:', (error as Error).message);
  }
  const title =
    state === 'confirmed' ? '✅ تأكد ف واتساب'
    : state === 'declined' ? '❌ تلغى ف واتساب'
    : state === 'paid' ? (file ? '📷 صيفط السكرين ديال التحويل (شوف البنك)' : '💳 قال خلص (شوف البنك)')
    : action === 'HUMAN' ? '🙋 بغا يهضر مع شي واحد'
    : '💬 رد ف واتساب';
  await sendNotification({
    title,
    message: `#${order.orderNumber} ${name}${state === 'replied' && action !== 'HUMAN' ? `: ${clean(text).slice(0, 200)}` : ''}`,
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

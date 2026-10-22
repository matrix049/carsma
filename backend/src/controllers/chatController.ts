import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import CustomOrder from '../models/CustomOrder';
import { notifyNewContactMessage, notifyNewCustomOrder } from '../services/notificationService';
import { generate, GeminiContent, GeminiUnavailableError } from '../services/geminiClient';
import { SHOP_FACTS, getCatalog, catalogText } from '../services/shopKnowledge';

type Role = 'user' | 'assistant';
interface Turn {
  role: Role;
  text: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  darija: 'Moroccan Darija',
  fr: 'French',
  en: 'English',
  ar: 'Modern Standard Arabic',
};

const MAX_TURNS = 24;
const MAX_TEXT = 800;

/** Keep only well-formed turns, trimmed and capped. */
function cleanTurns(raw: unknown, maxTurns: number, maxText: number): Turn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is Turn => !!t && (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string')
    .map((t) => ({ role: t.role, text: t.text.trim().slice(0, maxText) }))
    .filter((t) => t.text.length > 0)
    .slice(-maxTurns);
}

function cleanLines(raw: unknown, max: number, maxText: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((d): d is string => typeof d === 'string')
    .map((d) => d.trim().slice(0, maxText))
    .filter(Boolean)
    .slice(0, max);
}

function languageHint(language: unknown): string {
  const name = typeof language === 'string' ? LANGUAGE_NAMES[language] : undefined;
  if (!name) return '';
  const script =
    language === 'darija' ? ' For Darija, match the script the customer types in (Latin letters or Arabic letters); if unclear use Arabic letters.' : '';
  return `\nThe customer picked ${name} at the start of the chat. Use it unless they write in another language.${script}`;
}

function systemPrompt(catalog: string, language: unknown): string {
  return `You are "L7IT Assistant", the chat assistant on the L7IT website. You talk with customers in Morocco. Your goal is to help them and turn their interest into a confirmed order.

RULES
1. Use ONLY the shop facts and the catalogue below. If the answer is not there, say the team will confirm and set offerHandoff to true. Never invent prices, dates, discounts, colours, sizes, stock or policies.
2. Reply in the language AND script of the customer's last message. Moroccan Darija in Latin letters (e.g. "ch7al", "bghit", "wach") gets Darija in Latin letters with digits like 3, 7, 9. Darija in Arabic letters gets Darija in Arabic letters. French gets French, English gets English, Modern Standard Arabic gets Arabic.${languageHint(language)}
3. Be warm, short, positive and natural, like an enthusiastic Moroccan car-culture shop assistant: 1 to 3 short sentences. No markdown, no headings. At most one emoji. Never repeat a sentence you already wrote.
4. Custom requests (a car, a logo, a plane, anything): always say yes, we can make it. Then collect what is missing, ONE question at a time: what exactly (make, model and year, or the logo/design), which side (front, side or rear), 2D or 3D, and the colour (black and white are always possible; any other colour needs the team's confirmation). Present 2D and 3D as two great options: 2D is a clean, elegant design with the car's essential lines; 3D is rich in details with real depth, the closest to the real car. Never call one "cheaper" or say the other is "expensive" or "a lot of work"; only talk about price if the customer asks. If the piece is not in the catalogue, mention once, positively, that we start custom pieces with a partial advance payment.
5. Close the sale: as soon as the customer clearly wants a piece (a catalogue piece, or a custom piece with the main details known), recap it in one short line and ask if they want to confirm the order. Then set askConfirm to true and fill orderSummary with 2 to 5 short recap lines in the customer's language (piece, side, style, colour, size, and the price for a catalogue piece). If the customer says yes, the website shows a form for their name and phone number.
6. When the customer asks about a car or brand that is in the catalogue, put the matching product ids (max 4, in-stock first) in productIds and mention the pieces briefly. Only use ids from the catalogue and never write the ids in the reply text.
7. Never ask for a phone number, name or address in the chat: the website's form collects them.
8. Set offerHandoff to true when the customer asks something the facts do not cover, asks about an order status, has a problem, or wants to talk to a person. Otherwise false.
9. Stay on topic. For unrelated requests, politely bring the conversation back to L7IT.

SHOP FACTS
${SHOP_FACTS}

CATALOGUE (id | name | brand | price | size | stock)
${catalog}`;
}

const REPLY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    offerHandoff: { type: 'BOOLEAN' },
    askConfirm: { type: 'BOOLEAN' },
    orderSummary: { type: 'ARRAY', items: { type: 'STRING' } },
    productIds: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['reply', 'offerHandoff', 'askConfirm'],
};

function toContents(turns: Turn[]): GeminiContent[] {
  const contents = turns.map<GeminiContent>((t) => ({
    role: t.role === 'user' ? 'user' : 'model',
    parts: [{ text: t.text }],
  }));
  // Gemini expects the conversation to open with the customer.
  while (contents.length && contents[0].role === 'model') contents.shift();
  return contents;
}

/**
 * Answer a customer message.
 * POST /api/chat   { messages: [{ role, text }], language }
 */
export async function chat(req: Request, res: Response): Promise<void> {
  const turns = cleanTurns(req.body?.messages, MAX_TURNS, MAX_TEXT);
  if (!turns.length || turns[turns.length - 1].role !== 'user') {
    res.status(400).json({ error: true, message: 'The last message must be from the customer' });
    return;
  }

  try {
    const catalog = await getCatalog();
    const raw = await generate({
      system: systemPrompt(catalogText(catalog), req.body?.language),
      contents: toContents(turns),
      schema: REPLY_SCHEMA,
      temperature: 0.4,
    });

    let parsed: { reply?: string; offerHandoff?: boolean; askConfirm?: boolean; orderSummary?: string[]; productIds?: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw, offerHandoff: false };
    }

    const ids = new Set((parsed.productIds || []).map(String));
    const products = catalog
      .filter((p) => ids.has(p._id))
      .sort((a, b) => Number(b.inStock) - Number(a.inStock))
      .slice(0, 4)
      .map(({ _id, name, price, image, category, inStock }) => ({ _id, name, price, image, category, inStock }));
    const orderSummary = cleanLines(parsed.orderSummary, 6, 160);

    res.json({
      success: true,
      reply: (parsed.reply || '').trim(),
      offerHandoff: !!parsed.offerHandoff,
      askConfirm: !!parsed.askConfirm && orderSummary.length > 0,
      orderSummary,
      products,
    });
  } catch (error) {
    if (error instanceof GeminiUnavailableError) {
      console.warn('⚠ Chat assistant unavailable:', error.message);
      res.status(503).json({ error: true, unavailable: true, message: 'Assistant temporarily unavailable' });
      return;
    }
    console.error('Chat error:', error);
    res.status(500).json({ error: true, message: 'Chat failed' });
  }
}

/** Short English notes for the team; falls back to the raw details when the AI is busy. */
async function summarise(transcript: Turn[], details: string[]): Promise<string> {
  const conversation = transcript.map((t) => `${t.role === 'user' ? 'Customer' : 'Assistant'}: ${t.text}`).join('\n');
  try {
    return await generate({
      system:
        'You write short hand-off notes for the L7IT team (automotive wall art shop). Read the conversation between a customer and the shop assistant. ' +
        "Write in English, plain text, at most 8 lines, each starting with '- '. Cover what the customer wants (item, car make/model/year, side, 2D or 3D, colour, size) when mentioned, " +
        'the questions the assistant could not answer, and what the customer is waiting for. Mention the language the customer used. Never invent details.',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${details.length ? `Request details:\n${details.join('\n')}\n\n` : ''}Conversation:\n${conversation}` }],
        },
      ],
      temperature: 0.2,
      deadlineMs: 20_000,
    });
  } catch {
    return fallbackSummary(transcript, details);
  }
}

function fallbackSummary(transcript: Turn[], details: string[]): string {
  const asked = transcript
    .filter((t) => t.role === 'user')
    .slice(-4)
    .map((t) => `- Customer: ${t.text}`);
  return [...details.map((d) => `- ${d}`), ...asked].join('\n') || '- (empty conversation)';
}

function readContact(body: any): { name: string; phone: string; error?: string } {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  if (name.length < 2 || name.length > 100) return { name, phone, error: 'Please enter your name' };
  if (phone.replace(/\D/g, '').length < 6 || phone.length > 40) return { name, phone, error: 'Please enter a valid phone number' };
  return { name, phone };
}

/**
 * Send a question to the team: saves a Contact Message (source "chatbot")
 * with the full transcript and pings the admin. The customer gets an
 * answer straight away; the AI summary is filled in afterwards.
 * POST /api/chat/handoff   { name, phone, note?, language?, messages, details? }
 */
export async function handoff(req: Request, res: Response): Promise<void> {
  const { name, phone, error } = readContact(req.body);
  if (error) {
    res.status(400).json({ error: true, message: error });
    return;
  }
  const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 500) : '';
  const details = cleanLines(req.body?.details, 8, 200);
  const transcript = cleanTurns(req.body?.messages, 40, 1200);
  const language = LANGUAGE_NAMES[req.body?.language] || 'not chosen';
  const compose = (summary: string) =>
    [`Chat assistant hand-off · language: ${language}`, '', summary, note ? `\nCustomer note: ${note}` : '']
      .join('\n')
      .trim()
      .slice(0, 2000);

  try {
    const quick = fallbackSummary(transcript, details);
    const saved = await ContactMessage.create({
      customer: { name, phone },
      message: compose(quick),
      status: 'unread',
      source: 'chatbot',
      transcript,
    });

    res.status(201).json({ success: true, messageId: saved._id });

    await notifyNewContactMessage({
      customerName: name,
      phone,
      messagePreview: `[Chatbot] ${quick.replace(/\s+/g, ' ').slice(0, 100)}`,
    }).catch(() => {});
    const summary = await summarise(transcript, details);
    await ContactMessage.updateOne({ _id: saved._id }, { message: compose(summary) }).catch(() => {});
  } catch (err: any) {
    console.error('Chat hand-off error:', err);
    if (res.headersSent) return;
    if (err?.name === 'ValidationError') {
      res.status(400).json({ error: true, message: 'Please check your name and phone number' });
      return;
    }
    res.status(500).json({ error: true, message: 'Could not send your request' });
  }
}

/**
 * The customer confirmed an order in the chat: saves a Custom Order
 * (source "chatbot") with their recap and the conversation, and pings the
 * admin. Team notes in English are added in the background.
 * POST /api/chat/order   { name, phone, language, summary: string[], item?, messages }
 */
export async function confirmOrder(req: Request, res: Response): Promise<void> {
  const { name, phone, error } = readContact(req.body);
  if (error) {
    res.status(400).json({ error: true, message: error });
    return;
  }
  const summary = cleanLines(req.body?.summary, 8, 200);
  const transcript = cleanTurns(req.body?.messages, 40, 1200);
  if (!summary.length) {
    res.status(400).json({ error: true, message: 'Missing order details' });
    return;
  }

  const item = (typeof req.body?.item === 'string' && req.body.item.trim()) || summary[0].replace(/^[^:]{1,20}:\s*/, '');
  const everything = [item, ...summary, ...transcript.filter((t) => t.role === 'user').map((t) => t.text)].join(' ');
  const year = everything.match(/\b(19[5-9]\d|20[0-4]\d)\b/)?.[1] || '—';
  const language = LANGUAGE_NAMES[req.body?.language] || 'not chosen';
  const recap = summary.map((l) => `• ${l}`).join('\n');
  const compose = (teamNotes?: string) =>
    [`Confirmed in the chat assistant · language: ${language}`, '', teamNotes ? `${teamNotes}\n\nCustomer's recap:` : "Customer's recap:", recap]
      .join('\n')
      .slice(0, 2000);

  try {
    const saved = await CustomOrder.create({
      customer: { firstName: name, lastName: '', phone },
      carDetails: { carName: item.slice(0, 120), model: '', year },
      notes: compose(),
      source: 'chatbot',
      transcript,
    });

    res.status(201).json({ success: true, orderId: saved._id });

    await notifyNewCustomOrder({ customerName: name, carName: `${item.slice(0, 60)} (chat)`, model: '', year }).catch(() => {});
    const teamNotes = await summarise(transcript, summary);
    await CustomOrder.updateOne({ _id: saved._id }, { notes: compose(teamNotes) }).catch(() => {});
  } catch (err: any) {
    console.error('Chat order error:', err);
    if (res.headersSent) return;
    res.status(err?.name === 'ValidationError' ? 400 : 500).json({ error: true, message: 'Could not confirm your order' });
  }
}

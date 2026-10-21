import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { notifyNewContactMessage } from '../services/notificationService';
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

function languageHint(language: unknown): string {
  const name = typeof language === 'string' ? LANGUAGE_NAMES[language] : undefined;
  if (!name) return '';
  const script =
    language === 'darija' ? ' For Darija, match the script the customer types in (Latin letters or Arabic letters); if unclear use Arabic letters.' : '';
  return `\nThe customer picked ${name} at the start of the chat. Use it unless they write in another language.${script}`;
}

function systemPrompt(catalog: string, language: unknown): string {
  return `You are "L7IT Assistant", the chat assistant on the L7IT website. You talk with customers in Morocco.

RULES
1. Use ONLY the shop facts and the catalogue below. If the answer is not there, say the team will confirm and set offerHandoff to true. Never invent prices, dates, discounts, colours, sizes, stock or policies.
2. Reply in the language AND script of the customer's last message. Moroccan Darija in Latin letters (e.g. "ch7al", "bghit", "wach") gets Darija in Latin letters with digits like 3, 7, 9. Darija in Arabic letters gets Darija in Arabic letters. French gets French, English gets English, Modern Standard Arabic gets Arabic.${languageHint(language)}
3. Be warm, short and natural, like a friendly Moroccan shop assistant: 1 to 3 short sentences. No markdown, no headings. At most one emoji.
4. Custom requests (a car, a logo, a plane, anything): always say yes, we can make it. Then collect what is missing, ONE question at a time: what exactly (make, model and year, or the logo/design), which side (front, side or rear), 2D or 3D (say 2D is cheaper and 3D costs more because of the extra work), and the colour (black and white are always possible; any other colour needs the team's confirmation). If it is not in the catalogue, mention once that we ask for a partial advance payment (a deposit, not the full price). When the details are clear, recap them in one line and set offerHandoff to true so the customer can send the request to the team.
5. When the customer asks about a car or brand that is in the catalogue, put the matching product ids (max 4, in-stock first) in productIds and mention the pieces briefly. Only use ids from the catalogue and never write the ids in the reply text.
6. Never ask for a phone number or address in the chat: the "send to the team" button collects them.
7. Set offerHandoff to true when the customer wants a quote or a custom piece and the details are clear, asks something the facts do not cover, asks about an order status, has a problem, or wants to talk to a person. Otherwise false.
8. Stay on topic. For unrelated requests, politely bring the conversation back to L7IT.

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
    productIds: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['reply', 'offerHandoff'],
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

    let parsed: { reply?: string; offerHandoff?: boolean; productIds?: string[] };
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

    res.json({
      success: true,
      reply: (parsed.reply || '').trim(),
      offerHandoff: !!parsed.offerHandoff,
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

async function summarise(transcript: Turn[], details: string[]): Promise<string> {
  const conversation = transcript.map((t) => `${t.role === 'user' ? 'Customer' : 'Assistant'}: ${t.text}`).join('\n');
  try {
    const text = await generate({
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
      deadlineMs: 18_000,
    });
    return text;
  } catch {
    // No AI summary: fall back to the request details and the customer's last messages.
    const asked = transcript
      .filter((t) => t.role === 'user')
      .slice(-4)
      .map((t) => `- Customer: ${t.text}`);
    return [...details.map((d) => `- ${d}`), ...asked].join('\n') || '- (empty conversation)';
  }
}

/**
 * Send the conversation to the team: saves a Contact Message (source "chatbot")
 * with a summary and the full transcript, and pings the admin.
 * POST /api/chat/handoff   { name, phone, note?, language?, messages, details? }
 */
export async function handoff(req: Request, res: Response): Promise<void> {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 500) : '';
  const details = Array.isArray(req.body?.details)
    ? req.body.details.filter((d: unknown): d is string => typeof d === 'string').map((d: string) => d.slice(0, 200)).slice(0, 8)
    : [];
  const transcript = cleanTurns(req.body?.messages, 40, 1200);

  if (name.length < 2 || name.length > 100) {
    res.status(400).json({ error: true, message: 'Please enter your name' });
    return;
  }
  if (phone.replace(/\D/g, '').length < 6 || phone.length > 40) {
    res.status(400).json({ error: true, message: 'Please enter a valid phone number' });
    return;
  }

  try {
    const summary = await summarise(transcript, details);
    const language = LANGUAGE_NAMES[req.body?.language] || 'not chosen';
    const message = [`Chat assistant hand-off · language: ${language}`, '', summary, note ? `\nCustomer note: ${note}` : '']
      .join('\n')
      .trim()
      .slice(0, 2000);

    const saved = await ContactMessage.create({
      customer: { name, phone },
      message,
      status: 'unread',
      source: 'chatbot',
      transcript,
    });

    await notifyNewContactMessage({
      customerName: name,
      phone,
      messagePreview: `[Chatbot] ${summary.replace(/\s+/g, ' ').slice(0, 100)}`,
    });

    res.status(201).json({ success: true, messageId: saved._id });
  } catch (error: any) {
    console.error('Chat hand-off error:', error);
    if (error?.name === 'ValidationError') {
      res.status(400).json({ error: true, message: 'Please check your name and phone number' });
      return;
    }
    res.status(500).json({ error: true, message: 'Could not send your request' });
  }
}

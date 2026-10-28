import { Request, Response } from 'express';
import mongoose from 'mongoose';
import PageView from '../models/PageView';
import SiteEvent, { DEVICES, Device, PAGE_TYPES, PageType, SITE_EVENT_TYPES, SiteEventType } from '../models/SiteEvent';

// Crawlers, link previews and automated browsers don't count as visitors.
const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|facebookexternalhit|curl|wget|python|node-fetch|axios/i;

/**
 * The storefront sends beacons as text/plain (no CORS preflight, survives the
 * page closing), regular calls as JSON. Accept both.
 */
function readBody(req: Request): Record<string, unknown> {
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return req.body && typeof req.body === 'object' ? req.body : {};
}

function oneOf<T extends string>(list: readonly T[], value: unknown): T | undefined {
  return typeof value === 'string' && (list as readonly string[]).includes(value) ? (value as T) : undefined;
}

function sessionOf(value: unknown): string | null {
  return typeof value === 'string' && /^[\w.-]{6,100}$/.test(value) ? value : null;
}

function productOf(value: unknown): mongoose.Types.ObjectId | undefined {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value) && /^[a-f\d]{24}$/i.test(value)
    ? new mongoose.Types.ObjectId(value)
    : undefined;
}

function isBot(req: Request): boolean {
  const ua = req.get('User-Agent') || '';
  return !ua || BOT_UA.test(ua);
}

/**
 * A page was opened.
 * POST /api/analytics/track  { pageType, productId?, sessionId, path?, device?, landing?, source? }
 */
export const trackPageView = async (req: Request, res: Response): Promise<void> => {
  const body = readBody(req);
  const pageType = oneOf<PageType>(PAGE_TYPES, body.pageType);
  const sessionId = sessionOf(body.sessionId);
  if (!pageType || !sessionId) {
    res.status(400).json({ success: false, message: 'pageType and sessionId are required' });
    return;
  }
  // Answer straight away; tracking must never slow the shop down.
  res.status(204).end();
  if (isBot(req)) return;

  try {
    await PageView.create({
      pageType,
      productId: pageType === 'product' ? productOf(body.productId) : undefined,
      sessionId,
      userAgent: req.get('User-Agent')?.substring(0, 500),
      path: typeof body.path === 'string' ? body.path.slice(0, 200) : undefined,
      device: oneOf<Device>(DEVICES, body.device),
      landing: body.landing === true ? true : undefined,
      source: body.landing === true && typeof body.source === 'string' ? body.source.trim().toLowerCase().slice(0, 60) || 'direct' : undefined,
    });
  } catch (error) {
    console.error('Page view tracking error:', error);
  }
};

/**
 * Something was clicked or done on the storefront.
 * POST /api/analytics/event  { type, sessionId, productId?, page?, device? }
 */
export const trackEvent = async (req: Request, res: Response): Promise<void> => {
  const body = readBody(req);
  const type = oneOf<SiteEventType>(SITE_EVENT_TYPES, body.type);
  const sessionId = sessionOf(body.sessionId);
  if (!type || !sessionId) {
    res.status(400).json({ success: false, message: 'type and sessionId are required' });
    return;
  }
  res.status(204).end();
  if (isBot(req)) return;

  try {
    await SiteEvent.create({
      type,
      sessionId,
      productId: productOf(body.productId),
      page: oneOf<PageType>(PAGE_TYPES, body.page),
      device: oneOf<Device>(DEVICES, body.device),
    });
  } catch (error) {
    console.error('Event tracking error:', error);
  }
};

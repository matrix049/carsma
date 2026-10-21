import { Router } from 'express';
import { chat, handoff } from '../controllers/chatController';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Public — the storefront chat assistant. Limits protect the free Gemini quota.
router.post(
  '/',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 30, message: 'Too many messages, please wait a few minutes' }),
  chat
);
router.post(
  '/handoff',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 6, message: 'Too many requests, please try again later' }),
  handoff
);

export default router;

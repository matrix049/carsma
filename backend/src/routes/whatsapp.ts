import express, { Router } from 'express';
import { handleWebhook, validSignature, verifyWebhook } from '../services/whatsapp';

/**
 * Meta's WhatsApp webhook (set in the Meta app as https://<api>/api/whatsapp/webhook).
 * Mounted before express.json(): the signature is checked on the raw body.
 */
const router = Router();

// GET: Meta checks the URL once when the webhook is set up.
router.get('/webhook', (req, res) => {
  if (verifyWebhook(req.query['hub.mode'], req.query['hub.verify_token'])) {
    res.status(200).send(String(req.query['hub.challenge'] ?? ''));
  } else {
    res.sendStatus(403);
  }
});

// POST: delivery receipts and customer replies.
router.post('/webhook', express.raw({ type: '*/*', limit: '1mb' }), (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!validSignature(raw, req.get('x-hub-signature-256'))) {
    res.sendStatus(401);
    return;
  }
  let body: unknown;
  try {
    body = JSON.parse(raw.toString('utf8'));
  } catch {
    res.sendStatus(400);
    return;
  }
  // Answer Meta straight away (it retries slow webhooks), then do the work.
  res.sendStatus(200);
  handleWebhook(body).catch((err) => console.error('❌ WhatsApp webhook error:', err));
});

export default router;

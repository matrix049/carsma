import { Response } from 'express';
import LedgerEntry, { LedgerStatus, LedgerSource } from '../models/LedgerEntry';
import { AuthRequest } from '../middleware/auth';

const VALID_STATUSES: LedgerStatus[] = ['payee', 'annuler', 'en_attente', null];
const VALID_SOURCES: LedgerSource[] = ['manual', 'whatsapp', 'instagram', 'website', 'other'];

interface LedgerPayload {
  date?: string;
  cost?: number;
  commande?: string;
  city?: string;
  deliveryCost?: number;
  customerOwes?: number;
  status?: LedgerStatus;
  totalDhs?: number | null;
  apport?: number;
  source?: LedgerSource;
  notes?: string;
  orderRef?: string | null;
}

function normalize(body: LedgerPayload) {
  const updates: Record<string, unknown> = {};

  if (body.date !== undefined) {
    const parsed = new Date(body.date);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid date');
    }
    updates.date = parsed;
  }
  if (body.cost !== undefined) {
    if (typeof body.cost !== 'number' || body.cost < 0) throw new Error('cost must be a non-negative number');
    updates.cost = body.cost;
  }
  if (body.commande !== undefined) updates.commande = String(body.commande).trim();
  if (body.city !== undefined) updates.city = String(body.city).trim();
  if (body.deliveryCost !== undefined) {
    if (typeof body.deliveryCost !== 'number' || body.deliveryCost < 0) throw new Error('deliveryCost must be a non-negative number');
    updates.deliveryCost = body.deliveryCost;
  }
  if (body.customerOwes !== undefined) {
    if (typeof body.customerOwes !== 'number' || body.customerOwes < 0) throw new Error('customerOwes must be a non-negative number');
    updates.customerOwes = body.customerOwes;
  }
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    updates.status = body.status;
  }
  if (body.totalDhs !== undefined) {
    if (body.totalDhs !== null && typeof body.totalDhs !== 'number') throw new Error('totalDhs must be a number or null');
    updates.totalDhs = body.totalDhs;
  }
  if (body.apport !== undefined) {
    if (typeof body.apport !== 'number') throw new Error('apport must be a number');
    updates.apport = body.apport;
  }
  if (body.source !== undefined) {
    if (!VALID_SOURCES.includes(body.source)) throw new Error(`source must be one of: ${VALID_SOURCES.join(', ')}`);
    updates.source = body.source;
  }
  if (body.notes !== undefined) updates.notes = String(body.notes).trim();
  if (body.orderRef !== undefined) {
    updates.orderRef = body.orderRef === null || body.orderRef === '' ? null : body.orderRef;
  }

  return updates;
}

/**
 * GET /api/ledger — list all entries oldest-first so the UI can scroll
 * forward chronologically and compute Caisse as a running sum.
 */
export async function getLedger(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const entries = await LedgerEntry.find().sort({ date: 1, createdAt: 1 });
    res.status(200).json({ entries });
  } catch (error: any) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: true, message: 'Failed to retrieve ledger' });
  }
}

/**
 * POST /api/ledger — create a new entry.
 */
export async function createLedgerEntry(req: AuthRequest, res: Response): Promise<void> {
  try {
    const updates = normalize(req.body);
    if (!updates.date) {
      res.status(400).json({ error: true, message: 'Date is required' });
      return;
    }
    const entry = await LedgerEntry.create(updates);
    res.status(201).json({ entry });
  } catch (error: any) {
    if (error?.message && typeof error.message === 'string') {
      res.status(400).json({ error: true, message: error.message });
      return;
    }
    console.error('Create ledger entry error:', error);
    res.status(500).json({ error: true, message: 'Failed to create ledger entry' });
  }
}

/**
 * PUT /api/ledger/:id — patch any subset of fields.
 */
export async function updateLedgerEntry(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = normalize(req.body);
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: true, message: 'No updatable fields provided' });
      return;
    }
    const entry = await LedgerEntry.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!entry) {
      res.status(404).json({ error: true, message: 'Ledger entry not found' });
      return;
    }
    res.status(200).json({ entry });
  } catch (error: any) {
    if (error?.name === 'CastError') {
      res.status(400).json({ error: true, message: 'Invalid ledger entry ID' });
      return;
    }
    if (error?.message && typeof error.message === 'string') {
      res.status(400).json({ error: true, message: error.message });
      return;
    }
    console.error('Update ledger entry error:', error);
    res.status(500).json({ error: true, message: 'Failed to update ledger entry' });
  }
}

/**
 * DELETE /api/ledger/:id
 */
export async function deleteLedgerEntry(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const entry = await LedgerEntry.findByIdAndDelete(id);
    if (!entry) {
      res.status(404).json({ error: true, message: 'Ledger entry not found' });
      return;
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    if (error?.name === 'CastError') {
      res.status(400).json({ error: true, message: 'Invalid ledger entry ID' });
      return;
    }
    console.error('Delete ledger entry error:', error);
    res.status(500).json({ error: true, message: 'Failed to delete ledger entry' });
  }
}

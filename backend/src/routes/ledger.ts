import { Router } from 'express';
import {
  getLedger,
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
} from '../controllers/ledgerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All ledger routes require admin auth.
router.use(authenticateToken);

router.get('/', getLedger);
router.post('/', createLedgerEntry);
router.put('/:id', updateLedgerEntry);
router.delete('/:id', deleteLedgerEntry);

export default router;

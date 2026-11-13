import { Router } from 'express';
import { bankAccounts } from '../services/bankTransfer';
import { TRANSFER_DISCOUNT_RATE } from '../services/bundles';

const router = Router();

// GET /api/payment/options - How customers can pay (public). Bank names only: never the RIBs.
router.get('/options', (_req, res) => {
  res.json({
    transfer: {
      banks: bankAccounts().map((a) => a.bank),
      discountRate: TRANSFER_DISCOUNT_RATE,
    },
  });
});

export default router;

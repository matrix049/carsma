import express from 'express';
import { testNotification, testOrderNotification, checkNtfyConfig } from '../controllers/testController';

const router = express.Router();

// Test notification endpoints (for debugging)
router.post('/notification', testNotification);
router.post('/order-notification', testOrderNotification);
router.get('/ntfy-config', checkNtfyConfig);

export default router;
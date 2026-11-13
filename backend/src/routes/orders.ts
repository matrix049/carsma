import { Router } from 'express';
import { createOrder, getOrders, updateOrder, resendWhatsApp, getWhatsAppMedia } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/orders - Create new order (public)
router.post('/', createOrder);

// GET /api/orders - Get all orders (admin protected)
router.get('/', authenticateToken, getOrders);

// PUT /api/orders/:id - Update order (status / finish / products) admin only
router.put('/:id', authenticateToken, updateOrder);

// POST /api/orders/:id/whatsapp - (Re)send the WhatsApp confirmation, admin only
router.post('/:id/whatsapp', authenticateToken, resendWhatsApp);

// GET /api/orders/:id/whatsapp/media/:mediaId - A screenshot the customer sent, admin only
router.get('/:id/whatsapp/media/:mediaId', authenticateToken, getWhatsAppMedia);

export default router;

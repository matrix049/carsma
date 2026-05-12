import { Router } from 'express';
import { createOrder, getOrders, updateOrder } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/orders - Create new order (public)
router.post('/', createOrder);

// GET /api/orders - Get all orders (admin protected)
router.get('/', authenticateToken, getOrders);

// PUT /api/orders/:id - Update order (status / finish / products) admin only
router.put('/:id', authenticateToken, updateOrder);

export default router;

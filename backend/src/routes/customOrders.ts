import { Router } from 'express';
import { 
  createCustomOrder, 
  getCustomOrders, 
  updateCustomOrderStatus 
} from '../controllers/customOrderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public route for submitting custom requests
router.post('/', createCustomOrder);

// Protected admin routes
router.get('/', authenticateToken as any, getCustomOrders);
router.put('/:id', authenticateToken as any, updateCustomOrderStatus);

export default router;

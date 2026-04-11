import { Router } from 'express';
import { 
  createContactMessage, 
  getContactMessages, 
  updateMessageStatus 
} from '../controllers/contactController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public route for submitting contact messages
router.post('/', createContactMessage);

// Protected admin routes
router.get('/', authenticateToken as any, getContactMessages);
router.put('/:id', authenticateToken as any, updateMessageStatus);

export default router;

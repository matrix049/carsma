import { Router } from 'express';
import { adminLogin } from '../controllers/authController';

const router = Router();

// POST /api/admin/login - Admin authentication
router.post('/login', adminLogin);

export default router;

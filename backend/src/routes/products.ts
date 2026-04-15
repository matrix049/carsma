import { Router } from 'express';
import { getProducts, createProduct, deleteProduct } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/products - Retrieve all products (public)
router.get('/', getProducts);

// POST /api/products - Create a new product (admin only)
router.post('/', authenticateToken, createProduct);

// DELETE /api/products/:id - Delete a product (admin only)
router.delete('/:id', authenticateToken, deleteProduct);

export default router;

import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/products - Retrieve all products (public)
router.get('/', getProducts);

// GET /api/products/:id - Retrieve single product (public)
router.get('/:id', getProductById);

// POST /api/products - Create a new product (admin only)
router.post('/', authenticateToken, createProduct);

// PUT /api/products/:id - Update a product (admin only)
router.put('/:id', authenticateToken, updateProduct);

// DELETE /api/products/:id - Delete a product (admin only)
router.delete('/:id', authenticateToken, deleteProduct);

export default router;

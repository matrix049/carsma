import { Router } from 'express';
import { getProducts } from '../controllers/productController';

const router = Router();

// GET /api/products - Retrieve all products
router.get('/', getProducts);

export default router;

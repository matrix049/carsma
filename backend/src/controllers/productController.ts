import { Request, Response } from 'express';
import Product from '../models/Product';

/**
 * Get all products
 * GET /api/products
 * Returns all products from the database
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    // Query database for all products
    const products = await Product.find();

    // Return products array
    res.status(200).json({
      products
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve products'
    });
  }
}

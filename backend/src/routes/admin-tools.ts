import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Update all product prices to 179 MAD (Public endpoint for one-time fix)
 * GET /api/admin-tools/fix-prices-now
 * No auth required - for emergency price fix
 */
router.get('/fix-prices-now', async (req: Request, res: Response) => {
  try {
    // Get current prices first
    const beforeProducts = await Product.find({});
    const beforePrices = beforeProducts.map(p => ({ name: p.name, price: p.price }));

    // Update all products to 179 MAD
    const result = await Product.updateMany(
      {}, // Update all products
      { $set: { price: 179 } }
    );

    // Get updated products
    const afterProducts = await Product.find({});
    const afterPrices = afterProducts.map(p => ({ name: p.name, price: p.price }));

    res.status(200).json({
      success: true,
      message: `✅ Updated ${result.modifiedCount} products to 179 MAD`,
      modifiedCount: result.modifiedCount,
      before: beforePrices,
      after: afterPrices
    });
  } catch (error: any) {
    console.error('Price update error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update prices',
      details: error.message
    });
  }
});

/**
 * Update all product prices to 179 MAD
 * POST /api/admin-tools/update-prices
 * Admin only - updates all products to 179 MAD
 */
router.post('/update-prices', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Update all products to 179 MAD
    const result = await Product.updateMany(
      {}, // Update all products
      { $set: { price: 179 } }
    );

    // Get updated products
    const products = await Product.find({});

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} products to 179 MAD`,
      modifiedCount: result.modifiedCount,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price
      }))
    });
  } catch (error: any) {
    console.error('Price update error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update prices',
      details: error.message
    });
  }
});

/**
 * Get current product prices
 * GET /api/admin-tools/prices
 * Admin only - lists all product prices
 */
router.get('/prices', authenticateToken, async (req: Request, res: Response) => {
  try {
    const products = await Product.find({});
    
    res.status(200).json({
      success: true,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category
      }))
    });
  } catch (error: any) {
    console.error('Get prices error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get prices',
      details: error.message
    });
  }
});

export default router;
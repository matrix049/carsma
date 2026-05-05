import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import cloudinary, { CLOUDINARY_FOLDER } from '../config/cloudinary';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Update all product prices to 199 MAD (Public endpoint for one-time fix)
 * GET /api/admin-tools/fix-prices-now
 * No auth required - for emergency price fix
 */
router.get('/fix-prices-now', async (req: Request, res: Response) => {
  try {
    // Get current prices first
    const beforeProducts = await Product.find({});
    const beforePrices = beforeProducts.map(p => ({ name: p.name, price: p.price }));

    // Update all products to 199 MAD
    const result = await Product.updateMany(
      {}, // Update all products
      { $set: { price: 199 } }
    );

    // Get updated products
    const afterProducts = await Product.find({});
    const afterPrices = afterProducts.map(p => ({ name: p.name, price: p.price }));

    res.status(199).json({
      success: true,
      message: `✅ Updated ${result.modifiedCount} products to 199 MAD`,
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
 * Update all product prices to 199 MAD
 * POST /api/admin-tools/update-prices
 * Admin only - updates all products to 199 MAD
 */
router.post('/update-prices', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Update all products to 199 MAD
    const result = await Product.updateMany(
      {}, // Update all products
      { $set: { price: 199 } }
    );

    // Get updated products
    const products = await Product.find({});

    res.status(199).json({
      success: true,
      message: `Updated ${result.modifiedCount} products to 199 MAD`,
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
    
    res.status(199).json({
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

/**
 * Push the home-page hero image (public/911.png on the frontend) into
 * Cloudinary so it's served from the CDN with auto WebP/AVIF, instead
 * of being shipped as a 2.9 MB PNG inside the Next.js bundle.
 *
 * Uses a fixed public_id so the resulting URL is stable and can be
 * hardcoded on the frontend.
 *
 * GET /api/admin-tools/migrate-home-hero
 * Public, idempotent — overwrites the existing asset on every call.
 */
router.get('/migrate-home-hero', async (_req: Request, res: Response) => {
  try {
    const result = await cloudinary.uploader.upload('https://l7it.art/911.png', {
      folder: 'l7it/site',
      public_id: 'home-hero-911',
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
    });

    res.status(200).json({
      success: true,
      message: 'Home hero uploaded to Cloudinary',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (error: any) {
    console.error('Home hero migration error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to upload home hero',
      details: error?.message,
    });
  }
});

/**
 * Migrate all product images from external hosts (Imgur, /uploads, etc.)
 * into Cloudinary. Skips products whose image is already on Cloudinary.
 *
 * GET /api/admin-tools/migrate-images-to-cloudinary
 * Public, idempotent — safe to re-run; already-migrated products are skipped.
 */
router.get('/migrate-images-to-cloudinary', async (_req: Request, res: Response) => {
  const summary: {
    migrated: { name: string; before: string; after: string }[];
    skipped: { name: string; image: string; reason: string }[];
    failed: { name: string; image: string; error: string }[];
  } = { migrated: [], skipped: [], failed: [] };

  try {
    const products = await Product.find({});

    for (const product of products) {
      const current = product.image?.trim() ?? '';

      if (!current) {
        summary.skipped.push({ name: product.name, image: '', reason: 'empty image field' });
        continue;
      }

      if (current.includes('res.cloudinary.com') || current.includes('cloudinary.com')) {
        summary.skipped.push({ name: product.name, image: current, reason: 'already on Cloudinary' });
        continue;
      }

      try {
        // Cloudinary fetches the URL itself (server-side) and stores the asset,
        // so we don't need to download/re-upload from this process.
        const result = await cloudinary.uploader.upload(current, {
          folder: CLOUDINARY_FOLDER,
          resource_type: 'image',
        });

        product.image = result.secure_url;
        await product.save();

        summary.migrated.push({
          name: product.name,
          before: current,
          after: result.secure_url,
        });
      } catch (err: any) {
        summary.failed.push({
          name: product.name,
          image: current,
          error: err?.message ?? String(err),
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Migrated ${summary.migrated.length}, skipped ${summary.skipped.length}, failed ${summary.failed.length}`,
      ...summary,
    });
  } catch (error: any) {
    console.error('Image migration error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to migrate images',
      details: error?.message,
      ...summary,
    });
  }
});

export default router;
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

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        error: true,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({ product });
  } catch (error: any) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve product'
    });
  }
}

/**
 * Create new product
 * POST /api/products
 * Admin only
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, price, image, description, category, inStock } = req.body;

    // Validate required fields
    if (!name || !price || !image || !category) {
      res.status(400).json({
        error: true,
        message: 'Name, price, image, and category are required'
      });
      return;
    }

    // Create new product
    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      description: description?.trim() || '',
      category: category.trim(),
      inStock: inStock !== undefined ? Boolean(inStock) : true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create product'
    });
  }
}

/**
 * Update product
 * PUT /api/products/:id
 * Admin only
 */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, price, image, description, category, inStock } = req.body;

    // Find and update product
    const product = await Product.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(image && { image: image.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(category && { category: category.trim() }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) })
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        error: true,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update product'
    });
  }
}

/**
 * Delete product
 * DELETE /api/products/:id
 * Admin only
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        error: true,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete product'
    });
  }
}

/**
 * Create a new product
 * POST /api/products
 * Admin only - creates a new product
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, price, image, description, category, inStock } = req.body;

    // Validate required fields
    if (!name || !price || !image || !category) {
      res.status(400).json({
        error: true,
        message: 'Name, price, image, and category are required'
      });
      return;
    }

    // Create new product
    const product = new Product({
      name,
      price: Number(price),
      image,
      description: description || '',
      category,
      inStock: inStock !== undefined ? inStock : true
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create product'
    });
  }
}

/**
 * Delete a product
 * DELETE /api/products/:id
 * Admin only - deletes a product
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        error: true,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete product'
    });
  }
}

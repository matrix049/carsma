import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import Admin from '../models/Admin';

const router = Router();

// Seed endpoint - should be protected in production
router.post('/seed-database', async (req: Request, res: Response) => {
  try {
    // Check for a secret key to prevent unauthorized seeding
    const { secretKey } = req.body;
    
    if (secretKey !== process.env.SEED_SECRET_KEY) {
      return res.status(403).json({ 
        error: true, 
        message: 'Unauthorized: Invalid secret key' 
      });
    }

    console.log('🌱 Starting database seed via API...');

    // Clear existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});

    // Seed products
    const products = [
      {
        name: 'Audi Wall Art',
        price: 49.99,
        image: '/images/car1.jpg',
        description: 'Premium Audi logo wall decoration, perfect for car enthusiasts',
        category: 'Audi',
        inStock: true
      },
      {
        name: 'BMW Wall Art',
        price: 54.99,
        image: '/images/car2.jpg',
        description: 'Elegant BMW logo wall art, ideal for modern interiors',
        category: 'BMW',
        inStock: true
      },
      {
        name: 'Mercedes Wall Art',
        price: 59.99,
        image: '/images/car3.jpg',
        description: 'Luxury Mercedes-Benz logo wall decoration for sophisticated spaces',
        category: 'Mercedes',
        inStock: true
      },
      {
        name: 'Porsche Wall Art',
        price: 64.99,
        image: '/images/car1.jpg',
        description: 'Iconic Porsche logo wall art for sports car enthusiasts',
        category: 'Porsche',
        inStock: true
      },
      {
        name: 'Ferrari Wall Art',
        price: 69.99,
        image: '/images/car2.jpg',
        description: 'Legendary Ferrari prancing horse wall decoration',
        category: 'Ferrari',
        inStock: true
      },
      {
        name: 'Lamborghini Wall Art',
        price: 74.99,
        image: '/images/car3.jpg',
        description: 'Bold Lamborghini bull logo wall art',
        category: 'Lamborghini',
        inStock: true
      },
      {
        name: 'Tesla Wall Art',
        price: 59.99,
        image: '/images/car1.jpg',
        description: 'Modern Tesla logo wall decoration for electric vehicle fans',
        category: 'Tesla',
        inStock: true
      },
      {
        name: 'Bugatti Wall Art',
        price: 79.99,
        image: '/images/car2.jpg',
        description: 'Exclusive Bugatti logo wall art for luxury car collectors',
        category: 'Bugatti',
        inStock: true
      }
    ];

    const createdProducts = await Product.insertMany(products);

    // Seed admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword
    });

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        productsCreated: createdProducts.length,
        adminCreated: 1,
        adminEmail: admin.email
      }
    });

  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to seed database', 
      details: error.message 
    });
  }
});

export default router;

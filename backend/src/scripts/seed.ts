import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Admin from '../models/Admin';
import DatabaseConnection from '../config/database';

// Load environment variables
dotenv.config();

const seedData = async () => {
  console.log('🌱 Starting database seed...\n');

  try {
    // Connect to database
    const dbConnection = new DatabaseConnection();
    await dbConnection.connect();

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Admin.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Seed products
    console.log('Seeding products...');
    const products = [
      {
        name: 'Audi Wall Art',
        price: 199,
        image: '/images/car1.jpg',
        description: 'Premium Audi logo wall decoration, perfect for car enthusiasts',
        category: 'Audi',
        inStock: true
      },
      {
        name: 'BMW Wall Art',
        price: 199,
        image: '/images/car2.jpg',
        description: 'Elegant BMW logo wall art, ideal for modern interiors',
        category: 'BMW',
        inStock: true
      },
      {
        name: 'Mercedes Wall Art',
        price: 199,
        image: '/images/car3.jpg',
        description: 'Luxury Mercedes-Benz logo wall decoration for sophisticated spaces',
        category: 'Mercedes',
        inStock: true
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✓ Created ${createdProducts.length} products\n`);

    // Seed admin user
    console.log('Seeding admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Always update/recreate admin with current env vars
    await Admin.deleteMany({});
    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword
    });

    console.log(`✓ Created admin user: ${admin.email}\n`);

    // Display summary
    console.log('📊 Seed Summary:');
    console.log('================');
    console.log(`Products: ${createdProducts.length}`);
    console.log(`Admin users: 1`);
    console.log('\n✅ Database seeding completed successfully!');

    // Disconnect
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();

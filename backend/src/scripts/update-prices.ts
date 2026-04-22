import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product';
import DatabaseConnection from '../config/database';

// Load environment variables
dotenv.config();

const updatePrices = async () => {
  console.log('💰 Updating product prices to 179 MAD...\n');

  try {
    // Connect to database
    const dbConnection = new DatabaseConnection();
    await dbConnection.connect();

    // Update all products to 179 MAD
    const result = await Product.updateMany(
      {}, // Update all products
      { $set: { price: 179 } }
    );

    console.log(`✓ Updated ${result.modifiedCount} products to 179 MAD\n`);

    // Display updated products
    const products = await Product.find({});
    console.log('📊 Updated Products:');
    console.log('==================');
    products.forEach(product => {
      console.log(`${product.name}: ${product.price} MAD`);
    });

    console.log('\n✅ Price update completed successfully!');

    // Disconnect
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
};

// Run update function
updatePrices();
/**
 * Migration script to add orderNumber field to existing orders
 * Run this once to add sequential order numbers to existing orders
 */

import mongoose from 'mongoose';
import Order from '../models/Order';
import { config } from 'dotenv';

// Load environment variables
config();

async function addOrderNumbers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all orders without orderNumber, sorted by creation date (oldest first)
    console.log('📋 Finding orders without orderNumber...');
    const ordersWithoutNumber = await Order.find({ orderNumber: { $exists: false } })
      .sort({ createdAt: 1 }); // Oldest first for sequential numbering

    console.log(`📊 Found ${ordersWithoutNumber.length} orders without orderNumber`);

    if (ordersWithoutNumber.length === 0) {
      console.log('✅ All orders already have orderNumber assigned');
      return;
    }

    // Find the highest existing orderNumber
    const lastOrderWithNumber = await Order.findOne({ orderNumber: { $exists: true } })
      .sort({ orderNumber: -1 });
    
    let nextOrderNumber = lastOrderWithNumber ? lastOrderWithNumber.orderNumber + 1 : 0;
    console.log(`🔢 Starting orderNumber assignment from: ${nextOrderNumber}`);

    // Update orders one by one to maintain sequential order
    for (const order of ordersWithoutNumber) {
      await Order.findByIdAndUpdate(order._id, { orderNumber: nextOrderNumber });
      console.log(`✅ Updated order ${order._id} -> orderNumber: ${nextOrderNumber}`);
      nextOrderNumber++;
    }

    console.log('🎉 Successfully added orderNumber to all existing orders');
    
  } catch (error) {
    console.error('❌ Error adding order numbers:', error);
    throw error;
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addOrderNumbers()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export default addOrderNumbers;
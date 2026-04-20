/**
 * Migration script to fix order numbers to start from #1 instead of #0
 * Updates all existing orders to have sequential numbers starting from 1
 */

import mongoose from 'mongoose';
import Order from '../models/Order';
import { config } from 'dotenv';

// Load environment variables
config();

async function fixOrderNumbers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // First, drop the unique index to avoid conflicts during update
    console.log('🗑️ Dropping unique index on orderNumber...');
    try {
      await Order.collection.dropIndex('orderNumber_1');
      console.log('✅ Unique index dropped');
    } catch (error) {
      console.log('ℹ️ Index may not exist, continuing...');
    }

    // Get all orders sorted by creation date (oldest first for proper sequential numbering)
    console.log('📋 Finding all orders...');
    const allOrders = await Order.find({}).sort({ createdAt: 1 });
    console.log(`📊 Found ${allOrders.length} orders total`);

    if (allOrders.length === 0) {
      console.log('✅ No orders found to update');
      return;
    }

    console.log('🔢 Updating order numbers to start from #1...');

    // First, set all orderNumbers to null to avoid conflicts
    await Order.updateMany({}, { $unset: { orderNumber: 1 } });
    console.log('🧹 Cleared all existing orderNumbers');

    // Update orders one by one to maintain sequential order starting from 1
    for (let i = 0; i < allOrders.length; i++) {
      const order = allOrders[i];
      const newOrderNumber = i + 1; // Start from 1, not 0
      
      await Order.findByIdAndUpdate(order._id, { orderNumber: newOrderNumber });
      console.log(`✅ Updated order ${order._id} -> orderNumber: ${newOrderNumber}`);
    }

    // Recreate the unique index
    console.log('🔧 Recreating unique index on orderNumber...');
    await Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
    console.log('✅ Unique index recreated');

    console.log('🎉 Successfully updated all order numbers to start from #1');
    
    // Verify the update
    const updatedOrders = await Order.find({}).sort({ orderNumber: 1 });
    console.log('📋 Verification - Order numbers now:');
    updatedOrders.forEach(order => {
      console.log(`   Order ${order._id}: #${order.orderNumber}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing order numbers:', error);
    throw error;
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  fixOrderNumbers()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export default fixOrderNumbers;
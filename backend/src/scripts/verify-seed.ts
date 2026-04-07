import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Admin from '../models/Admin';
import DatabaseConnection from '../config/database';

// Load environment variables
dotenv.config();

const verifySeed = async () => {
  console.log('🔍 Verifying database seed...\n');

  try {
    // Connect to database
    const dbConnection = new DatabaseConnection();
    await dbConnection.connect();

    // Check products
    console.log('Checking products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    
    if (products.length === 0) {
      console.log('⚠️  No products found. Run "npm run seed" to populate the database.\n');
    } else {
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - $${product.price} (${product.category})`);
      });
      console.log();
    }

    // Check admin users
    console.log('Checking admin users...');
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin user(s):`);
    
    if (admins.length === 0) {
      console.log('⚠️  No admin users found. Run "npm run seed" to create an admin user.\n');
    } else {
      admins.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.email}`);
      });
      console.log();
    }

    // Verification summary
    console.log('📊 Verification Summary:');
    console.log('========================');
    
    const expectedProducts = 3;
    const expectedAdmins = 1;
    
    const productsOk = products.length === expectedProducts;
    const adminsOk = admins.length >= expectedAdmins;
    
    console.log(`Products: ${products.length}/${expectedProducts} ${productsOk ? '✅' : '❌'}`);
    console.log(`Admin users: ${admins.length}/${expectedAdmins} ${adminsOk ? '✅' : '❌'}`);
    
    if (productsOk && adminsOk) {
      console.log('\n✅ Database is properly seeded!');
    } else {
      console.log('\n⚠️  Database seeding incomplete. Run "npm run seed" to fix.');
    }

    // Disconnect
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying database:', error);
    console.log('\n💡 Make sure MongoDB is running and the connection string is correct.');
    process.exit(1);
  }
};

// Run verification
verifySeed();

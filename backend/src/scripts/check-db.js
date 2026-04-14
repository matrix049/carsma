const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Checking MongoDB connection and data...\n');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI?.substring(0, 30) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Check products
    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String,
      price: Number,
      image: String,
      description: String,
      category: String,
      inStock: Boolean
    }));

    const products = await Product.find();
    console.log(`📦 Products found: ${products.length}`);
    products.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - $${p.price}`);
      console.log(`     Image: ${p.image}`);
      console.log(`     Category: ${p.category}`);
      console.log(`     In Stock: ${p.inStock}`);
      console.log('');
    });

    // Check admin
    const Admin = mongoose.model('Admin', new mongoose.Schema({
      email: String,
      password: String
    }));

    const admins = await Admin.find();
    console.log(`👤 Admin users found: ${admins.length}`);
    admins.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.email}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();

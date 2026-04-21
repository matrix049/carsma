require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./dist/models/Product').default;

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`\n📦 Products found: ${products.length}`);
    products.forEach((p, i) => {
      console.log(`\n[${i+1}] ${p.name}`);
      console.log(`    Price: ${p.price} MAD`);
      console.log(`    Category: ${p.category}`);
      console.log(`    Image: ${p.image}`);
      console.log(`    In Stock: ${p.inStock}`);
      console.log(`    Description: ${p.description}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkProducts();

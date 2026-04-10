const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  console.log('Connecting to:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected!');
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String }));
    const count = await Product.countDocuments();
    console.log('Product count:', count);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();

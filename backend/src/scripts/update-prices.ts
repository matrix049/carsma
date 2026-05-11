import dotenv from 'dotenv';
import Product from '../models/Product';
import DatabaseConnection from '../config/database';

// Load environment variables
dotenv.config();

/**
 * Bulk-update product prices.
 *
 *   - Every product is set to `BASE_PRICE` (229 MAD)
 *   - Then any product whose `name` matches the Mercedes G63 / G-Class
 *     AMG pattern is bumped to `G63_PRICE` (259 MAD)
 *
 * Run with:  npx ts-node src/scripts/update-prices.ts
 */
const BASE_PRICE = 229;
const G63_PRICE = 259;

// Case-insensitive — catches "G63", "G 63", "G-63", "G-Class", "G Class".
const G63_REGEX = /(?:^|[^a-z0-9])g[\s-]*63(?:[^0-9]|$)|g[\s-]*class/i;

const updatePrices = async () => {
  console.log(`💰 Bulk price update — base ${BASE_PRICE} MAD, G63 ${G63_PRICE} MAD\n`);

  const dbConnection = new DatabaseConnection();

  try {
    await dbConnection.connect();

    // 1. Reset every product to the base price.
    const baseResult = await Product.updateMany(
      {},
      { $set: { price: BASE_PRICE } }
    );
    console.log(`✓ Set ${baseResult.modifiedCount} products to ${BASE_PRICE} MAD.`);

    // 2. Overlay the G63 / G-Class premium. Use a regex so it survives
    //    naming variants like "Mercedes G63 AMG", "G-Class AMG G63", etc.
    const g63Result = await Product.updateMany(
      { name: { $regex: G63_REGEX } },
      { $set: { price: G63_PRICE } }
    );
    console.log(`✓ Bumped ${g63Result.modifiedCount} G63 / G-Class product(s) to ${G63_PRICE} MAD.\n`);

    // 3. Report — show what every product now costs so the operator can
    //    confirm the G63 rule actually hit the right rows.
    const products = await Product.find({}).sort({ name: 1 });
    console.log('📊 Final prices:');
    console.log('================');
    products.forEach((product) => {
      const tag = product.price === G63_PRICE ? '  ← G63 tier' : '';
      console.log(`  ${product.name.padEnd(40)} ${product.price} MAD${tag}`);
    });

    console.log('\n✅ Done.');
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    try {
      await dbConnection.disconnect();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
};

updatePrices();

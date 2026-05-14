import dotenv from 'dotenv';
import Product from '../models/Product';
import DatabaseConnection from '../config/database';

dotenv.config();

/**
 * One-time migration: set per-product `dimensions` for the catalogue.
 *
 * Before this column existed the storefront used a regex on the product
 * name to decide between 120cm x 35cm (the catalogue standard) and
 * 120cm x 50cm (the G-Class only, because the SUV silhouette is taller).
 * Now that admins set dimensions explicitly per product, we backfill the
 * existing rows so behaviour doesn't regress on deploy:
 *
 *   - Anything matching the G63 / G-Class regex → 120cm x 50cm
 *   - Everything else                            → 120cm x 35cm
 *
 * Re-running is safe: the script will simply overwrite to the correct
 * size based on the current name. After the first run, admins who
 * override dimensions in /admin/products should NOT re-run this script
 * unless they want their edits clobbered.
 */
const STANDARD = '120cm x 35cm';
const TALL = '120cm x 50cm';
const G63_REGEX = /(?:^|[^a-z0-9])g[\s-]*63(?:[^0-9]|$)|g[\s-]*class/i;

async function run() {
  const db = new DatabaseConnection();
  try {
    await db.connect();
    const products = await Product.find();
    let updatedTall = 0;
    let updatedStandard = 0;
    let unchanged = 0;

    for (const p of products) {
      const target = G63_REGEX.test(p.name) ? TALL : STANDARD;
      if (p.dimensions === target) {
        unchanged += 1;
        continue;
      }
      p.dimensions = target;
      await p.save();
      if (target === TALL) updatedTall += 1;
      else updatedStandard += 1;
      console.log(`  ${target.padEnd(14)}  ${p.name}`);
    }

    console.log('\n──────────────────────────────────────────────');
    console.log(`Set to ${TALL}: ${updatedTall}`);
    console.log(`Set to ${STANDARD}: ${updatedStandard}`);
    console.log(`Already correct: ${unchanged}`);
    console.log('──────────────────────────────────────────────');

    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    try {
      await db.disconnect();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
}

run();

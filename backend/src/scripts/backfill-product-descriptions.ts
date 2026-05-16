import dotenv from 'dotenv';
import Product from '../models/Product';
import DatabaseConnection from '../config/database';

dotenv.config();

/**
 * One-time backfill: guarantee every product has a short description.
 *
 * The storefront product page and the cards already fall back to a
 * generic blurb when `description` is empty, but the field itself was
 * optional, so a lot of catalogue rows shipped with no copy at all.
 * The admin form now *requires* a description for any new/edited
 * product; this script closes the gap for the products that already
 * exist.
 *
 * Rule:
 *   - description missing / empty / whitespace  → write a short,
 *     name + brand aware blurb that matches the Alocobond / Rabat
 *     material story used everywhere else on the site.
 *   - description already has real text          → leave it alone.
 *
 * Re-running is safe and idempotent: only still-empty rows are touched,
 * so any copy an admin has written by hand is never clobbered.
 */
function shortDescription(name: string, category: string): string {
  const brand = (category || '').trim();
  // "BMW M3 E93 — BMW silhouette wall art, laser-cut from 3 mm
  //  Alocobond aluminium composite and hand-finished in Rabat.
  //  Pre-drilled and ready to mount."
  const lead = brand ? `${brand} silhouette wall art` : 'automotive wall art';
  return (
    `${name} — ${lead}, laser-cut from 3 mm Alocobond aluminium ` +
    `composite and hand-finished in Rabat. Pre-drilled and ready to mount.`
  );
}

async function run() {
  const db = new DatabaseConnection();
  try {
    await db.connect();
    const products = await Product.find();
    let filled = 0;
    let alreadyHad = 0;

    for (const p of products) {
      if ((p.description || '').trim().length > 0) {
        alreadyHad += 1;
        continue;
      }
      p.description = shortDescription(p.name, p.category);
      await p.save();
      filled += 1;
      console.log(`  + ${p.name}`);
    }

    console.log('\n──────────────────────────────────────────────');
    console.log(`Descriptions written: ${filled}`);
    console.log(`Already had a description: ${alreadyHad}`);
    console.log(`Total products: ${products.length}`);
    console.log('──────────────────────────────────────────────');

    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Backfill error:', error);
    try {
      await db.disconnect();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
}

run();

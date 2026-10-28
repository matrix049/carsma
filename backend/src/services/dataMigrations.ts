/**
 * One-time data changes, run at startup after MongoDB connects. Each runs at
 * most once (its key is stored in the `migrations` collection), so later edits
 * in the admin are never overwritten and deleted items are never recreated.
 */
import Migration from '../models/Migration';
import Product from '../models/Product';

interface DataMigration {
  key: string;
  run: () => Promise<void>;
}

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dwknjjv0b/image/upload';
const CLOUDINARY = `${CLOUDINARY_BASE}/a_exif,c_limit,w_1600,q_auto,f_auto`;

/** The two 3D editions (sizes, prices and stock given by the shop, Oct 2026). */
const EDITIONS = [
  {
    match: /\bg[\s-]*(class|63)\b.*\b3\s*d\b/i,
    product: {
      name: 'G-Class AMG G63 3D',
      category: 'Mercedes',
      price: 399,
      stockQuantity: 6,
      dimensions: '120cm x 75cm',
      image: `${CLOUDINARY}/v1793147375/GCLASS_3D_hiunen.jpg`,
      description:
        'The G63 in 3D — laser-cut in layers that stand off the wall, so the G-Wagon casts real shadows and shows real depth. One size: 120 × 75 cm. Limited pieces.',
    },
  },
  {
    match: /\b911\b.*\b3\s*d\b/i,
    product: {
      name: '911 GT3 RS 3D',
      category: 'Porsche',
      price: 349,
      stockQuantity: 14,
      dimensions: '120cm x 50cm',
      image: `${CLOUDINARY}/v1793147621/911_3D_tyxz7t.jpg`,
      description:
        'The 911 GT3 RS in 3D — laser-cut in layers that stand off the wall, wing and all, for real depth and real shadows. One size: 120 × 50 cm. Limited pieces.',
    },
  },
];

const MIGRATIONS: DataMigration[] = [
  {
    key: '2026-10-3d-editions-in-stock',
    run: async () => {
      for (const { match, product } of EDITIONS) {
        const existing = await Product.findOne({ name: match });
        if (existing) {
          // Already added by hand: only fill in what the shop just confirmed.
          existing.stockQuantity = product.stockQuantity;
          existing.dimensions = product.dimensions;
          existing.inStock = true;
          await existing.save();
          console.log(`✓ Updated 3D edition: ${existing.name}`);
        } else {
          await Product.create({ ...product, inStock: true });
          console.log(`✓ Added 3D edition: ${product.name}`);
        }
      }
    },
  },
  {
    // Real-size card + room shot made from the shop's photos (served by the
    // storefront from frontend/public/editions).
    key: '2026-10-3d-editions-gallery',
    run: async () => {
      const galleries: [RegExp, string[]][] = [
        [EDITIONS[0].match, ['/editions/g-class-3d-size.jpg', '/editions/g-class-3d-room.jpg']],
        [EDITIONS[1].match, ['/editions/911-3d-size.jpg', '/editions/911-3d-room.jpg']],
      ];
      for (const [match, gallery] of galleries) {
        const product = await Product.findOne({ name: match });
        if (product && !product.gallery?.length) {
          product.gallery = gallery;
          await product.save();
          console.log(`✓ Added photos to ${product.name}`);
        }
      }
    },
  },
  {
    // 4th photo (LED gaming setup) for both, and the 911 main photo cropped so
    // the piece sits in the middle. Skips anything the admin already changed.
    key: '2026-10-3d-editions-gaming-and-centred-911',
    run: async () => {
      const additions: [RegExp, string, string[]][] = [
        [EDITIONS[0].match, '/editions/g-class-3d-gaming.jpg', ['/editions/g-class-3d-size.jpg', '/editions/g-class-3d-room.jpg']],
        [EDITIONS[1].match, '/editions/911-3d-gaming.jpg', ['/editions/911-3d-size.jpg', '/editions/911-3d-room.jpg']],
      ];
      for (const [match, gaming, previous] of additions) {
        const product = await Product.findOne({ name: match });
        if (!product) continue;
        if (product.gallery.length === previous.length && product.gallery.every((u, i) => u === previous[i])) {
          product.gallery = [...previous, gaming];
        }
        if (product.image === EDITIONS[1].product.image) {
          product.image = `${CLOUDINARY_BASE}/a_exif/c_crop,w_2548,h_1911,x_476,y_1077/c_limit,w_1600/q_auto,f_auto/v1793147621/911_3D_tyxz7t.jpg`;
        }
        if (product.isModified()) {
          await product.save();
          console.log(`✓ Updated photos of ${product.name}`);
        }
      }
    },
  },
  {
    // The 4th photo again, without LEDs (our pieces have none): the piece on the
    // plain wall of a daylight gaming setup, framed to show the whole desk.
    key: '2026-10-3d-editions-setup-without-leds',
    run: async () => {
      const swaps: [RegExp, string, string][] = [
        [EDITIONS[0].match, '/editions/g-class-3d-gaming.jpg', '/editions/g-class-3d-setup.jpg'],
        [EDITIONS[1].match, '/editions/911-3d-gaming.jpg', '/editions/911-3d-setup.jpg'],
      ];
      for (const [match, before, after] of swaps) {
        const product = await Product.findOne({ name: match });
        if (!product || !product.gallery.includes(before)) continue;
        product.gallery = product.gallery.map((u) => (u === before ? after : u));
        await product.save();
        console.log(`✓ New setup photo for ${product.name}`);
      }
    },
  },
];

export async function runDataMigrations(): Promise<void> {
  for (const migration of MIGRATIONS) {
    if (await Migration.exists({ key: migration.key })) continue;
    try {
      await migration.run();
      await Migration.create({ key: migration.key });
      console.log(`✓ Data migration done: ${migration.key}`);
    } catch (err) {
      // Not recorded, so it is retried on the next start.
      console.error(`⚠ Data migration failed: ${migration.key}`, err);
    }
  }
}

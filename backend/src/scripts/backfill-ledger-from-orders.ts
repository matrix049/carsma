import dotenv from 'dotenv';
import LedgerEntry from '../models/LedgerEntry';
import Order from '../models/Order';
import DatabaseConnection from '../config/database';

dotenv.config();

/**
 * Copy every website Order into the LedgerEntry collection so the admin
 * ledger has a unified view of every sale — manual (WhatsApp / Instagram)
 * and online.
 *
 * Idempotent via `orderRef`: each ledger row carries the originating
 * Order's `_id`. Re-running the script only mirrors orders that aren't
 * already represented.
 *
 * Mapping:
 *   - date          ← Order.createdAt
 *   - commande      ← "<qty>× <name>" list, capped at 80 chars
 *   - customerOwes  ← Order.totalPrice
 *   - status        ← delivered → payee · cancelled → annuler · else → en_attente
 *   - source        ← 'website'
 *   - notes         ← customer name + phone + address (best-effort)
 *   - orderRef      ← Order._id
 *
 * Cost, delivery cost, apport, and city are left at zero/empty so the
 * operator can fill them in /admin/ledger if they care to track per-order
 * fulfillment costs.
 */

const isoDay = (d: Date | string): string => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
};

async function run() {
  const db = new DatabaseConnection();
  try {
    await db.connect();

    const [orders, existingRefs] = await Promise.all([
      Order.find().sort({ createdAt: 1 }),
      LedgerEntry.find({ orderRef: { $ne: null } }, { orderRef: 1 }),
    ]);

    const mirrored = new Set(existingRefs.map((e) => String(e.orderRef)));
    console.log(`Found ${orders.length} website order(s); ${mirrored.size} already mirrored.`);

    let inserted = 0;
    let skipped = 0;

    for (const order of orders) {
      const oid = String(order._id);
      if (mirrored.has(oid)) {
        skipped += 1;
        continue;
      }

      const summary = order.products
        .map((p) => `${p.quantity}× ${p.name}`)
        .join(', ');
      const commande = summary.length > 80 ? `${summary.slice(0, 77)}…` : summary;

      const status: 'payee' | 'annuler' | 'en_attente' =
        order.status === 'delivered'
          ? 'payee'
          : order.status === 'cancelled'
            ? 'annuler'
            : 'en_attente';

      const customer = order.customer;
      const [rawAddress, ...noteParts] = String(customer.address ?? '').split('| Notes:');
      const addressNote = noteParts.length ? `Notes: ${noteParts.join('| Notes:').trim()}` : '';
      const customerLine = `${customer.firstName} ${customer.lastName} · ${customer.phone}`;
      const notes = [addressNote, customerLine, rawAddress.trim()].filter(Boolean).join(' — ');

      await LedgerEntry.create({
        date: order.createdAt,
        cost: 0,
        commande,
        city: '',
        deliveryCost: 0,
        customerOwes: order.totalPrice,
        status,
        apport: 0,
        source: 'website',
        notes,
        orderRef: order._id,
      });

      inserted += 1;
      console.log(
        `  [insert] ${isoDay(order.createdAt)}  #${order.orderNumber}  ${customer.firstName} ${customer.lastName}  ${order.totalPrice} MAD  → ${status}`,
      );
    }

    console.log('\n──────────────────────────────────────────────');
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped (already mirrored): ${skipped}`);
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

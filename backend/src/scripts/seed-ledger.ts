import dotenv from 'dotenv';
import LedgerEntry from '../models/LedgerEntry';
import Order from '../models/Order';
import DatabaseConnection from '../config/database';

dotenv.config();

/**
 * Seed the LedgerEntry collection with rows transcribed from the operator's
 * Excel bookkeeping screenshot (29/04/2026 – 11/05/2026).
 *
 * Per the operator's instruction: any row whose calendar day matches an
 * existing website Order is skipped, on the assumption that the spreadsheet
 * pre-dates the website and any same-day overlap is the same order
 * recorded twice.
 *
 * Idempotent: re-running won't insert duplicates because we also check
 * against existing LedgerEntry rows for the same (date, commande, city)
 * triple before inserting.
 */

type SeedRow = {
  date: string; // ISO YYYY-MM-DD
  cost?: number;
  commande?: string;
  city?: string;
  deliveryCost?: number;
  customerOwes?: number;
  status?: 'payee' | 'annuler' | 'en_attente' | null;
  totalDhs?: number | null;
  apport?: number;
  source?: 'manual' | 'whatsapp' | 'instagram' | 'website' | 'other';
  notes?: string;
};

const ROWS: SeedRow[] = [
  // 29/04/2026
  { date: '2026-04-29', cost: 605, commande: '1',       city: 'temara',   deliveryCost: 0,  customerOwes: 200, status: 'payee',      totalDhs: -805, apport: 1005, source: 'whatsapp' },
  { date: '2026-04-29', cost: 405, commande: '1',       city: 'meknes',                       customerOwes: 179, status: 'annuler',    totalDhs: -826,              source: 'whatsapp' },
  // 01/05/2026
  { date: '2026-05-01',            commande: '1+logo',  city: 'kenitra',  deliveryCost: 0,  customerOwes: 279, status: 'payee',      totalDhs: -447,              source: 'whatsapp' },
  // 02/05/2026
  { date: '2026-05-02',            commande: '1',       city: 'chichaoua', deliveryCost: 45, customerOwes: 170, status: 'annuler',    totalDhs: -755,              source: 'whatsapp' },
  // 03/05/2026
  { date: '2026-05-03', cost: 50,  commande: '1',       city: 'berkan',   deliveryCost: 45, customerOwes: 179, status: 'payee',      totalDhs: -603,              source: 'whatsapp' },
  { date: '2026-05-03',            commande: '1',       city: 'sale',     deliveryCost: 0,  customerOwes: 199, status: 'payee',      totalDhs: -209,              source: 'whatsapp' },
  // 05/05/2026
  { date: '2026-05-05', cost: 130, commande: '2',       city: 'tetouan',                      customerOwes: 400, status: 'payee',      totalDhs: 995,               source: 'whatsapp' },
  { date: '2026-05-05',            commande: '1',       city: 'marakkesh', deliveryCost: 40, customerOwes: 199, status: 'payee',      totalDhs: -51,               source: 'whatsapp' },
  // 06/05/2026
  { date: '2026-05-06',            commande: 'carrera', city: 'casablanca',                  customerOwes: 199, status: 'payee',      totalDhs: 388,               source: 'instagram' },
  { date: '2026-05-06',            commande: 'mustang', city: 'casablanca',                  customerOwes: 199, status: 'payee',      totalDhs: 587,               source: 'instagram' },
  // 07/05/2026
  { date: '2026-05-07', cost: 40,  commande: 'm5',      city: 'casablanca',                  customerOwes: 199, status: 'payee',      totalDhs: 786,               source: 'instagram' },
  { date: '2026-05-07', cost: 290, commande: '',        city: '',                            customerOwes: 0,                                                       source: 'manual', notes: 'Expense entry' },
  { date: '2026-05-07', cost: 380, commande: '',        city: '',                            customerOwes: 0,                                                       source: 'manual', notes: 'Expense entry' },
  // 09/05/2026
  { date: '2026-05-09', cost: 40,  commande: 'logo velo', city: 'sefrou',                    customerOwes: 300, status: 'payee',      totalDhs: 1995,              source: 'instagram' },
  { date: '2026-05-09', cost: 19,  commande: '911',     city: 'tanger',                       customerOwes: 199, status: 'en_attente', totalDhs: 985,               source: 'instagram' },
  { date: '2026-05-09', cost: 70,  commande: 'rs6',     city: 'tanger',                       customerOwes: 199, status: 'en_attente', totalDhs: 985,               source: 'instagram' },
  { date: '2026-05-09',            commande: 'bmw',     city: 'mohmadia',                     customerOwes: 199, status: 'en_attente', totalDhs: 985,               source: 'whatsapp' },
  // 11/05/2026
  { date: '2026-05-11',            commande: '911',     city: 'casablanca',                   customerOwes: 199, status: 'en_attente', totalDhs: 985,               source: 'whatsapp' },
  { date: '2026-05-11',            commande: 'G class', city: 'temara',                       customerOwes: 220, status: 'en_attente', totalDhs: 1195,              source: 'whatsapp' },
  { date: '2026-05-11',            commande: '911',     city: 'temara',                       customerOwes: 199, status: 'en_attente', totalDhs: 985,               source: 'whatsapp' },
  { date: '2026-05-11',            commande: '911',     city: 'meknes',                       customerOwes: 199, status: 'en_attente', totalDhs: 985,               source: 'whatsapp' },
];

const isoDay = (d: Date | string): string => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
};

async function run() {
  const db = new DatabaseConnection();
  try {
    await db.connect();

    // Build the set of calendar days that already have a website order. The
    // operator wants those rows skipped because they'd duplicate orders the
    // website already captured.
    const websiteOrders = await Order.find({}, { createdAt: 1 });
    const websiteOrderDays = new Set(websiteOrders.map((o) => isoDay(o.createdAt)));
    console.log(`Website orders cover ${websiteOrderDays.size} unique day(s).`);

    // Existing ledger fingerprint so the script is safe to re-run.
    const existingEntries = await LedgerEntry.find(
      {},
      { date: 1, commande: 1, city: 1, customerOwes: 1, cost: 1 },
    );
    const fingerprint = (date: string | Date, commande: string, city: string, owes: number, cost: number) =>
      `${isoDay(date)}|${commande}|${city}|${owes}|${cost}`;
    const existingKeys = new Set(
      existingEntries.map((e) =>
        fingerprint(e.date, e.commande ?? '', e.city ?? '', e.customerOwes ?? 0, e.cost ?? 0),
      ),
    );

    let inserted = 0;
    let skippedDuplicate = 0;
    let skippedSameDayAsWebsite = 0;

    for (const row of ROWS) {
      const day = isoDay(row.date);

      if (websiteOrderDays.has(day)) {
        skippedSameDayAsWebsite += 1;
        console.log(`  [skip — website order exists on ${day}] ${row.commande || '(expense)'} → ${row.city || '—'}`);
        continue;
      }

      const key = fingerprint(row.date, row.commande ?? '', row.city ?? '', row.customerOwes ?? 0, row.cost ?? 0);
      if (existingKeys.has(key)) {
        skippedDuplicate += 1;
        console.log(`  [skip — already in ledger]              ${row.commande || '(expense)'} → ${row.city || '—'}`);
        continue;
      }

      await LedgerEntry.create({
        ...row,
        date: new Date(row.date),
        cost: row.cost ?? 0,
        commande: row.commande ?? '',
        city: row.city ?? '',
        deliveryCost: row.deliveryCost ?? 0,
        customerOwes: row.customerOwes ?? 0,
        status: row.status ?? null,
        apport: row.apport ?? 0,
        source: row.source ?? 'manual',
        totalDhs: row.totalDhs ?? null,
        notes: row.notes ?? '',
      });
      existingKeys.add(key);
      inserted += 1;
      console.log(`  [insert]                                  ${day}  ${row.commande || '(expense)'} → ${row.city || '—'}`);
    }

    console.log('\n──────────────────────────────────────────────');
    console.log(`Inserted:                    ${inserted}`);
    console.log(`Skipped (website same-day):  ${skippedSameDayAsWebsite}`);
    console.log(`Skipped (already in ledger): ${skippedDuplicate}`);
    console.log('──────────────────────────────────────────────');

    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed ledger error:', error);
    try {
      await db.disconnect();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
}

run();

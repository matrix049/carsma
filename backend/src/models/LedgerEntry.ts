import mongoose, { Schema, Document } from 'mongoose';

export type LedgerStatus = 'payee' | 'annuler' | 'en_attente' | null;
export type LedgerSource = 'manual' | 'whatsapp' | 'instagram' | 'website' | 'other';

/**
 * LedgerEntry — admin-side bookkeeping row.
 *
 * Mirrors the columns the operator already tracked in Excel:
 *   Date | Couts | Commande | Livraison | Cout livraison | Doit payer |
 *   Etat | Total DHS | Apport | Caisse
 *
 * Only `date` is required so the same row schema handles:
 *   - a full order line (commande + city + customerOwes + status)
 *   - a pure expense row (cost only, no order)
 *   - a capital injection row (apport only)
 *
 * `caisse` (running balance) is intentionally NOT stored — it's computed
 * on the fly when listing so it can never drift from the source data.
 * `totalDhs` IS stored because the operator's formula for that column
 * isn't published; admins can fill it manually as they always have.
 */
export interface ILedgerEntry extends Document {
  date: Date;
  cost: number;
  commande?: string;
  city?: string;
  deliveryCost: number;
  customerOwes: number;
  status: LedgerStatus;
  totalDhs?: number | null;
  apport: number;
  source: LedgerSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    commande: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryCost: {
      type: Number,
      default: 0,
      min: [0, 'Delivery cost cannot be negative'],
    },
    customerOwes: {
      type: Number,
      default: 0,
      min: [0, 'Amount owed cannot be negative'],
    },
    status: {
      type: String,
      enum: ['payee', 'annuler', 'en_attente', null],
      default: null,
    },
    totalDhs: {
      type: Number,
      default: null,
    },
    apport: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['manual', 'whatsapp', 'instagram', 'website', 'other'],
      default: 'manual',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

LedgerEntrySchema.index({ date: 1, createdAt: 1 });

const LedgerEntry = mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);

export default LedgerEntry;

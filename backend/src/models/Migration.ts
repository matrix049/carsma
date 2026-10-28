import mongoose, { Schema, Document } from 'mongoose';

/** Records one-time data changes that already ran (see services/dataMigrations.ts). */
export interface IMigration extends Document {
  key: string;
  ranAt: Date;
}

const MigrationSchema = new Schema<IMigration>({
  key: { type: String, required: true, unique: true },
  ranAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMigration>('Migration', MigrationSchema);

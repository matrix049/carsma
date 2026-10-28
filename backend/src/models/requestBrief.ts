import { Schema } from 'mongoose';

/**
 * The short card the team reads first for a chat-assistant request: one
 * sentence saying exactly what the customer wants, plus the key details.
 */
export interface IRequestBrief {
  want: string;
  piece?: string;
  side?: string;
  style?: string;
  colour?: string;
  size?: string;
  price?: string;
  /** What the customer is still waiting for from the team. */
  pending?: string;
}

const field = { type: String, trim: true, maxlength: 300 };

export const RequestBriefSchema = new Schema<IRequestBrief>(
  {
    want: { ...field, required: true },
    piece: field,
    side: field,
    style: field,
    colour: field,
    size: field,
    price: field,
    pending: field,
  },
  { _id: false }
);

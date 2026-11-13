import mongoose, { Schema, Document } from 'mongoose';

/**
 * Where the WhatsApp confirmation stands (see services/whatsapp):
 * sent → delivered → read while waiting; then the customer's answer —
 * confirmed, declined, paid (a transfer order: they say they paid or sent the
 * screenshot), or replied (a message the team should read).
 * no_whatsapp / bad_number / failed: the team calls instead.
 */
export type WhatsAppState =
  | 'sent' | 'delivered' | 'read'
  | 'confirmed' | 'declined' | 'paid' | 'replied'
  | 'no_whatsapp' | 'bad_number' | 'failed';

export interface IOrderWhatsApp {
  state: WhatsAppState;
  to?: string | null;
  messageId?: string | null;
  /** Which template went out (confirmation, or the bank transfer one). */
  template?: string;
  at?: Date;
  reply?: string;
  repliedAt?: Date;
  error?: string;
  /** Screenshots/files the customer sent back (Meta media ids). */
  media?: Array<{ id: string; mime?: string; at?: Date }>;
}

export interface IOrder extends Document {
  orderNumber: number;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  };
  products: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  /**
   * Finish chosen for the wall art panels — set by admins after talking
   * to the customer. Old orders have no finish set yet.
   */
  finish?: 'brilliant' | 'matte' | null;
  /** Offer applied to the order (e.g. the 3D duo), already taken off totalPrice. */
  discount?: { label: string; amount: number } | null;
  /** True once confirming took this order's pieces out of stock. Older orders never did. */
  stockHeld?: boolean;
  /** The pieces actually taken, so they can be given back exactly. */
  stockTaken?: Array<{ productId: mongoose.Types.ObjectId; quantity: number }>;
  /** WhatsApp confirmation sent to the customer, and their answer. Null until one is sent. */
  whatsapp?: IOrderWhatsApp | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: Number,
      unique: true
    },
    customer: {
      firstName: {
        type: String,
        required: [true, 'Customer first name is required'],
        trim: true
      },
      lastName: {
        type: String,
        required: [true, 'Customer last name is required'],
        trim: true
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true
      },
      address: {
        type: String,
        required: [true, 'Customer address is required'],
        trim: true
      }
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product ID is required']
        },
        name: {
          type: String,
          required: [true, 'Product name is required']
        },
        price: {
          type: Number,
          required: [true, 'Product price is required'],
          min: [0, 'Price cannot be negative']
        },
        quantity: {
          type: Number,
          required: [true, 'Product quantity is required'],
          min: [1, 'Quantity must be at least 1']
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
      default: 'pending'
    },
    finish: {
      type: String,
      enum: ['brilliant', 'matte', null],
      default: null
    },
    discount: {
      type: new Schema({ label: { type: String, trim: true }, amount: { type: Number, min: 0 } }, { _id: false }),
      default: null
    },
    stockHeld: {
      type: Boolean,
      default: false
    },
    stockTaken: {
      type: [new Schema({ productId: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: { type: Number, min: 1 } }, { _id: false })],
      default: []
    },
    whatsapp: {
      type: new Schema(
        {
          state: {
            type: String,
            enum: ['sent', 'delivered', 'read', 'confirmed', 'declined', 'paid', 'replied', 'no_whatsapp', 'bad_number', 'failed'],
          },
          to: { type: String, default: null },
          messageId: { type: String, default: null },
          template: String,
          at: Date,
          reply: String,
          repliedAt: Date,
          error: String,
          media: { type: [new Schema({ id: String, mime: String, at: Date }, { _id: false })], default: [] },
        },
        { _id: false }
      ),
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Auto-increment orderNumber before saving
OrderSchema.pre<IOrder>('save', async function() {
  if (this.isNew) {
    try {
      const lastOrder = await mongoose.model('Order').findOne().sort({ orderNumber: -1 });
      this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1; // Start from 1, not 0
    } catch (error) {
      throw error;
    }
  }
});

// Index for efficient sorting by creation date (newest first)
OrderSchema.index({ createdAt: -1 });

// Index for status filtering
OrderSchema.index({ status: 1 });

// WhatsApp webhook lookups: receipts by message id, replies by the customer's number
OrderSchema.index({ 'whatsapp.messageId': 1 }, { sparse: true });
OrderSchema.index({ 'whatsapp.to': 1, createdAt: -1 }, { sparse: true });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

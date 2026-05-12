import mongoose, { Schema, Document } from 'mongoose';

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

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

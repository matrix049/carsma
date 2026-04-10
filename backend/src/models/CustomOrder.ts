import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomOrder extends Document {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  carDetails: {
    carName: string;
    model: string;
    year: string;
  };
  status: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderSchema = new Schema<ICustomOrder>(
  {
    customer: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
      }
    },
    carDetails: {
      carName: {
        type: String,
        required: [true, 'Car brand/name is required'],
        trim: true
      },
      model: {
        type: String,
        required: [true, 'Car model is required'],
        trim: true
      },
      year: {
        type: String,
        required: [true, 'Car year is required'],
        trim: true
      }
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'contacted', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for newest first
CustomOrderSchema.index({ createdAt: -1 });

const CustomOrder = mongoose.model<ICustomOrder>('CustomOrder', CustomOrderSchema);

export default CustomOrder;

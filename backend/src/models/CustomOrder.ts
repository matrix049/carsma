import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomOrder extends Document {
  customer: {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
  };
  carDetails: {
    carName: string;
    model?: string;
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
      // Only the first name + phone are mandatory now — the customize form on
      // the storefront collects just those two fields. Last name + email are
      // kept on the schema for back-compat with existing records but are no
      // longer required.
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
      },
      lastName: {
        type: String,
        trim: true,
        default: ''
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
      }
    },
    carDetails: {
      carName: {
        type: String,
        required: [true, 'Car brand/name is required'],
        trim: true
      },
      // The form collects a single combined "brand + model" string into
      // carName, so the separate model field is optional.
      model: {
        type: String,
        trim: true,
        default: ''
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

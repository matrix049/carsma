import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  customer: {
    name: string;
    phone: string;
    /** Legacy field — historic records used email. New records leave it blank. */
    email?: string;
  };
  message: string;
  status: 'unread' | 'read' | 'resolved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    customer: {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
      },
      // Phone is the primary contact channel — the storefront form only
      // collects name, phone and message. Email stays on the schema as an
      // optional legacy field so existing records remain readable.
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        minlength: [4, 'Phone number is too short'],
        maxlength: [40, 'Phone number is too long']
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
      }
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'resolved', 'archived'],
      default: 'unread'
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient sorting (newest first)
ContactMessageSchema.index({ createdAt: -1 });

const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessage;

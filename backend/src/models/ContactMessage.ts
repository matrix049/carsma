import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  customer: {
    name: string;
    email: string;
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
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
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

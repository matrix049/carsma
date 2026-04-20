import mongoose, { Document, Schema } from 'mongoose';

// Interface for PageView document
export interface IPageView extends Document {
  timestamp: Date;
  pageType: 'home' | 'shop' | 'product' | 'contact' | 'faq' | 'cart' | 'checkout' | 'customize';
  productId?: mongoose.Types.ObjectId;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

// PageView schema definition
const PageViewSchema = new Schema<IPageView>({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  pageType: {
    type: String,
    required: true,
    enum: ['home', 'shop', 'product', 'contact', 'faq', 'cart', 'checkout', 'customize'],
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    sparse: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
    maxlength: 100
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  ipAddress: {
    type: String,
    maxlength: 45 // IPv6 max length
  }
}, {
  timestamps: true
});

// Compound indexes for efficient analytics queries
PageViewSchema.index({ timestamp: -1, pageType: 1 });
PageViewSchema.index({ productId: 1, timestamp: -1 });
PageViewSchema.index({ sessionId: 1, timestamp: -1 });

// TTL index for data retention (1 year)
PageViewSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Create and export the model
const PageView = mongoose.model<IPageView>('PageView', PageViewSchema);

export default PageView;
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
  inStock: boolean;
  /**
   * Free-form size string shown on the product page (e.g. "120cm x 35cm",
   * "120cm x 50cm"). Defaults to the standard catalogue size; the admin
   * can override per product (e.g. larger format for the G-Class).
   */
  dimensions: string;
  /**
   * Pieces left, when the shop tracks it (e.g. the limited 3D editions).
   * null/absent = not tracked. 0 = sold out.
   */
  stockQuantity?: number | null;
  /** Extra photos shown after `image` on the product page (e.g. real-size card, room shot). */
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      required: [true, 'Product image is required']
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    inStock: {
      type: Boolean,
      default: true
    },
    dimensions: {
      type: String,
      trim: true,
      default: '120cm x 35cm'
    },
    stockQuantity: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: null
    },
    gallery: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient category filtering
ProductSchema.index({ category: 1 });

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

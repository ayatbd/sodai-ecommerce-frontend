import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVariantOption {
  id: string;
  name: string;
  priceModifier?: number;
  inStock?: boolean;
  sku?: string;
}

export interface IVariantGroup {
  id: string;
  name: string;
  type?: 'color' | 'size' | 'finish' | 'material' | 'standard';
  options: IVariantOption[];
}

export interface IProduct extends Document {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stockCount: number;
  inStock: boolean;
  images: string[];
  tags: string[];
  features: string[];
  specifications: Record<string, string>;
  variants?: IVariantGroup[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewProduct: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantOptionSchema = new Schema<IVariantOption>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    sku: { type: String },
  },
  { _id: false }
);

const VariantGroupSchema = new Schema<IVariantGroup>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'standard' },
    options: [VariantOptionSchema],
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    stockCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    images: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length > 0, 'At least one image is required'],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    features: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    variants: [VariantGroupSchema],
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewProduct: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id?.toString();
        ret.isNew = ret.isNewProduct;
        delete ret._id;
        delete ret.__v;
        delete ret.isNewProduct;
        if (ret.specifications instanceof Map) {
          ret.specifications = Object.fromEntries(ret.specifications);
        }
        return ret;
      },
    },
  }
);

// Pre-save to auto-sync inStock flag
ProductSchema.pre('save', function (this: IProduct) {
  this.inStock = this.stockCount > 0;
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

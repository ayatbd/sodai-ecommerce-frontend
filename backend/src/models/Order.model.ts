import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariants?: Record<string, string>;
}

export interface IOrderAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrder extends Document {
  id: string;
  orderNumber: string;
  userId?: string;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    selectedVariants: { type: Map, of: String },
  },
  { _id: false }
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v: IOrderItem[]) => v.length > 0, 'Order must contain at least 1 item'],
    },
    shippingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    billingAddress: {
      type: OrderAddressSchema,
    },
    shippingMethod: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, default: 0 },
      estimatedDays: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
      index: true,
    },
    paymentIntentId: {
      type: String,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
      index: true,
    },
    trackingNumber: {
      type: String,
    },
    carrier: {
      type: String,
      default: 'DHL Express',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  expiryDate?: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
  isValid(subtotal: number): { valid: boolean; message?: string; discount?: number };
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    usageLimit: {
      type: Number,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
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

CouponSchema.methods.isValid = function (subtotal: number) {
  if (!this.isActive) {
    return { valid: false, message: 'Coupon code is no longer active.' };
  }

  if (this.expiryDate && new Date() > this.expiryDate) {
    return { valid: false, message: 'Coupon code has expired.' };
  }

  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached.' };
  }

  if (subtotal < this.minOrderValue) {
    return {
      valid: false,
      message: `Minimum order amount of $${this.minOrderValue} required for this coupon.`,
    };
  }

  let calculatedDiscount = 0;
  if (this.discountType === 'percentage') {
    calculatedDiscount = (subtotal * this.discountValue) / 100;
    if (this.maxDiscountAmount && calculatedDiscount > this.maxDiscountAmount) {
      calculatedDiscount = this.maxDiscountAmount;
    }
  } else {
    calculatedDiscount = Math.min(this.discountValue, subtotal);
  }

  return {
    valid: true,
    discount: Math.round(calculatedDiscount * 100) / 100,
  };
};

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

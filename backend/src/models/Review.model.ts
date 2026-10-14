import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    isApproved: {
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
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

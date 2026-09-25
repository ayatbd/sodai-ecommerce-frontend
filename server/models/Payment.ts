import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  paymentIntentId: string;
  amount: number; // in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
  paymentMethodType?: string;
  receiptUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled'],
      default: 'requires_payment_method',
    },
    clientSecret: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    paymentMethodType: {
      type: String,
      default: 'card',
    },
    receiptUrl: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in development
export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

// In-memory fallback repository when MongoDB connection is optional/unconnected
const memoryPayments = new Map<string, any>();

export const PaymentRepository = {
  async create(data: {
    paymentIntentId: string;
    amount: number;
    currency?: string;
    status?: string;
    clientSecret: string;
    customerEmail?: string;
    metadata?: Record<string, any>;
    paymentMethodType?: string;
  }) {
    const doc = {
      ...data,
      currency: data.currency || 'usd',
      status: data.status || 'requires_payment_method',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryPayments.set(data.paymentIntentId, doc);

    if (mongoose.connection.readyState === 1) {
      try {
        const payment = new PaymentModel(doc);
        return await payment.save();
      } catch (e) {
        console.warn('[MongoDB] Save error, using memory fallback:', (e as Error).message);
      }
    }

    return doc;
  },

  async findByPaymentIntentId(paymentIntentId: string) {
    if (mongoose.connection.readyState === 1) {
      try {
        const record = await PaymentModel.findOne({ paymentIntentId }).lean();
        if (record) return record;
      } catch (e) {
        console.warn('[MongoDB] Query error, falling back to memory:', (e as Error).message);
      }
    }
    return memoryPayments.get(paymentIntentId) || null;
  },

  async updateStatus(paymentIntentId: string, status: string, additional?: Record<string, any>) {
    const existing = memoryPayments.get(paymentIntentId) || {};
    const updated = {
      ...existing,
      status,
      ...additional,
      updatedAt: new Date(),
    };
    memoryPayments.set(paymentIntentId, updated);

    if (mongoose.connection.readyState === 1) {
      try {
        await PaymentModel.findOneAndUpdate(
          { paymentIntentId },
          { $set: { status, ...additional, updatedAt: new Date() } },
          { new: true }
        );
      } catch (e) {
        console.warn('[MongoDB] Update error, memory updated:', (e as Error).message);
      }
    }

    return updated;
  },

  async listRecent(limit = 10) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await PaymentModel.find().sort({ createdAt: -1 }).limit(limit).lean();
      } catch {
        // fallback
      }
    }
    return Array.from(memoryPayments.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
};

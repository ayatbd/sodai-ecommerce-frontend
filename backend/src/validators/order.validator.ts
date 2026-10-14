import { z } from 'zod';
import { addressSchema } from './auth.validator.js';

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  image: z.string().url(),
  selectedVariants: z.record(z.string(), z.string()).optional(),
});

export const shippingMethodInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  estimatedDays: z.string(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least 1 item'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingMethod: shippingMethodInputSchema,
  paymentMethod: z.string().default('card'),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export const updateTrackingSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  carrier: z.string().default('DHL Express'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

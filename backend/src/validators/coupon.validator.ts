import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').trim(),
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(25)
    .trim()
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  minOrderValue: z.number().nonnegative().default(0),
  maxDiscountAmount: z.number().positive().optional(),
  expiryDate: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().positive().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

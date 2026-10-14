import { z } from 'zod';

export const variantOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceModifier: z.number().default(0),
  inStock: z.boolean().default(true),
  sku: z.string().optional(),
});

export const variantGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['color', 'size', 'finish', 'material', 'standard']).default('standard'),
  options: z.array(variantOptionSchema),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(150),
  tagline: z.string().min(2, 'Tagline is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  originalPrice: z.number().positive().optional(),
  category: z.string().min(1, 'Category is required'),
  stockCount: z.number().int().nonnegative('Stock count must be 0 or higher'),
  images: z.array(z.string().url('Image must be a valid URL')).min(1, 'At least 1 image is required'),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).default({}),
  variants: z.array(variantGroupSchema).optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional(),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 12))).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().transform((v) => parseFloat(v)).optional(),
  maxPrice: z.string().transform((v) => parseFloat(v)).optional(),
  inStock: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  isFeatured: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  published: z.enum(['true', 'false', 'all']).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'newest', 'rating']).default('featured'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;

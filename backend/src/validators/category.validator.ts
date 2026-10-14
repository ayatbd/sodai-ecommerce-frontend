import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(100),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens)'),
  description: z.string().min(5, 'Description is required'),
  imageUrl: z.string().url('Image must be a valid URL'),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

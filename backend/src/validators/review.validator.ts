import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(2, 'Title is required').max(100),
  comment: z.string().min(10, 'Review comment must be at least 10 characters long').max(2000),
});

export const moderateReviewSchema = z.object({
  isApproved: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;

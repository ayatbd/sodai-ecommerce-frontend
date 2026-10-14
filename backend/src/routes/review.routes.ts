import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticate, requireAdmin, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createReviewSchema, moderateReviewSchema } from '../validators/review.validator.js';

const router = Router();

// Public reviews for a product
router.get('/product/:productId', ReviewController.getProductReviews);

// Submitting a review
router.post('/', optionalAuth, validateBody(createReviewSchema), ReviewController.createReview);

// Admin moderation
router.get('/admin', authenticate, requireAdmin, ReviewController.getAllReviews);
router.patch('/:id/moderate', authenticate, requireAdmin, validateBody(moderateReviewSchema), ReviewController.moderateReview);
router.delete('/:id', authenticate, requireAdmin, ReviewController.deleteReview);

export const reviewRoutes = router;

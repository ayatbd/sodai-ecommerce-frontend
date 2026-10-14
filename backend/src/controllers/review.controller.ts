import { Request, Response } from 'express';
import { Review } from '../models/Review.model.js';
import { Product } from '../models/Product.model.js';
import { ApiResponseView } from '../views/apiResponse.view.js';
import { CreateReviewInput, ModerateReviewInput } from '../validators/review.validator.js';

export class ReviewController {
  static async getProductReviews(req: Request<{ productId: string }>, res: Response): Promise<void> {
    const reviews = await Review.find({
      productId: req.params.productId,
      isApproved: true,
    }).sort({ createdAt: -1 });

    ApiResponseView.success(res, reviews.map((r) => r.toJSON()));
  }

  static async createReview(req: Request<{}, {}, CreateReviewInput>, res: Response): Promise<void> {
    const { productId, rating, title, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      ApiResponseView.error(res, 'Product not found', 404);
      return;
    }

    const review = new Review({
      productId,
      userId: req.user?.id,
      userName: req.user?.name || 'Verified Collector',
      rating,
      title,
      comment,
      isVerifiedPurchase: true,
      isApproved: true,
    });

    await review.save();

    // Recalculate Product average rating & reviewCount
    const allReviews = await Review.find({ productId, isApproved: true });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    product.rating = Math.round(avg * 10) / 10;
    product.reviewCount = allReviews.length;
    await product.save();

    ApiResponseView.created(res, review.toJSON(), 'Review submitted successfully');
  }

  static async getAllReviews(req: Request, res: Response): Promise<void> {
    const reviews = await Review.find().sort({ createdAt: -1 });
    ApiResponseView.success(res, reviews.map((r) => r.toJSON()));
  }

  static async moderateReview(
    req: Request<{ id: string }, {}, ModerateReviewInput>,
    res: Response
  ): Promise<void> {
    const review = await Review.findById(req.params.id);
    if (!review) {
      ApiResponseView.error(res, 'Review not found', 404);
      return;
    }

    review.isApproved = req.body.isApproved;
    await review.save();

    // Update product rating accordingly
    const allReviews = await Review.find({ productId: review.productId, isApproved: true });
    const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 5.0;

    await Product.findByIdAndUpdate(review.productId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    ApiResponseView.success(res, review.toJSON(), `Review moderation status updated`);
  }

  static async deleteReview(req: Request<{ id: string }>, res: Response): Promise<void> {
    const review = await Review.findById(req.params.id);
    if (!review) {
      ApiResponseView.error(res, 'Review not found', 404);
      return;
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate
    const allReviews = await Review.find({ productId, isApproved: true });
    const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 5.0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    ApiResponseView.success(res, { id: req.params.id }, 'Review deleted');
  }
}

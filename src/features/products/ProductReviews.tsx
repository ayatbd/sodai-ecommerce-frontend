import React, { useState } from 'react';
import { useGetReviewsQuery, useAddReviewMutation } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToast, setAuthModalOpen } from '../../store/slices/uiSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDate } from '../../lib/utils';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a star rating').max(5),
  title: z.string().min(3, 'Review title must be at least 3 characters').max(60),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').max(500),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export function ProductReviews({ productId }: { productId: string }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: reviews = [], isLoading, isError } = useGetReviewsQuery(productId);
  const [addReview, { isLoading: isSubmitting }] = useAddReviewMutation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: '',
      comment: '',
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated || !user) {
      dispatch(setAuthModalOpen(true));
      return;
    }

    try {
      await addReview({
        productId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        verifiedPurchase: true,
      }).unwrap();

      dispatch(
        addToast({
          title: 'Review Published',
          description: 'Thank you for your feedback.',
          type: 'success',
        })
      );
      reset();
      setIsFormOpen(false);
    } catch {
      dispatch(
        addToast({
          title: 'Failed to Post Review',
          description: 'Please try again later.',
          type: 'destructive',
        })
      );
    }
  };

  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
      : 5.0;

  return (
    <div className="space-y-8">
      {/* Header and Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6 dark:border-neutral-800">
        <div>
          <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Verified Reviews ({reviews.length})
          </h4>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {averageRating} out of 5
            </span>
            <span className="text-xs text-neutral-400">Based on {reviews.length} owners</span>
          </div>
        </div>

        <Button
          onClick={() => {
            if (!isAuthenticated) {
              dispatch(setAuthModalOpen(true));
            } else {
              setIsFormOpen(!isFormOpen);
            }
          }}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>{isFormOpen ? 'Cancel Review' : 'Write a Review'}</span>
        </Button>
      </div>

      {/* Review Submission Form with React Hook Form + Zod */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-4"
        >
          <h5 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Share your experience
          </h5>

          {/* Star selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Overall Rating
            </label>
            <div className="flex gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => {
                    setSelectedRating(star);
                    setValue('rating', star);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= selectedRating
                        ? 'fill-current text-amber-500'
                        : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-xs text-red-600">{errors.rating.message}</p>}
          </div>

          <Input
            label="Review Headline"
            placeholder="e.g. Sublime acoustic fidelity and comfort"
            {...register('title')}
            error={errors.title?.message}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Detailed Feedback
            </label>
            <textarea
              rows={4}
              placeholder="What did you think of the material finish, durability, and performance?"
              {...register('comment')}
              className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
            {errors.comment && (
              <p className="text-xs text-red-600">{errors.comment.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Submit Review
            </Button>
          </div>
        </form>
      )}

      {/* Review List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="space-y-2 p-4 border rounded-xl dark:border-neutral-800">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-xs text-red-500">Failed to load customer reviews.</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-neutral-400 text-xs">
          No reviews yet. Be the first to share your thoughts on this design artifact!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-neutral-200/60 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={review.userAvatar}
                    fallback={review.userName}
                    size="sm"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {review.userName}
                    </span>
                    {review.verifiedPurchase && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-neutral-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Stars */}
              <div className="flex text-amber-500 gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= review.rating ? 'fill-current' : 'text-neutral-200 dark:text-neutral-800'
                    }`}
                  />
                ))}
              </div>

              <h6 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {review.title}
              </h6>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

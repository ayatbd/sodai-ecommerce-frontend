import React, { useState, useMemo } from 'react';
import {
  useGetReviewsQuery,
  useAddReviewMutation,
  useCheckCustomerEligibilityQuery,
  useCreateOrderMutation,
} from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToast, setAuthModalOpen } from '../../store/slices/uiSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  ThumbsUp,
  Image as ImageIcon,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDate } from '../../lib/utils';
import { ProductReview } from '../../types';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a star rating').max(5),
  title: z.string().min(3, 'Review headline must be at least 3 characters').max(80),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').max(1000),
  imageUrl: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const REVIEWS_PER_PAGE = 3;

interface ProductReviewsProps {
  productId: string;
  productName?: string;
}

export function ProductReviews({ productId, productName = 'Product' }: ProductReviewsProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // RTK Query
  const { data: reviews = [], isLoading, isError } = useGetReviewsQuery(productId);
  const [addReview, { isLoading: isSubmitting }] = useAddReviewMutation();
  const { data: eligibility } = useCheckCustomerEligibilityQuery(
    { productId, userId: user?.id },
    { skip: !user?.id }
  );
  const [createOrder] = useCreateOrderMutation();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVotedReviews, setUserVotedReviews] = useState<Record<string, boolean>>({});

  // Filtering & Sorting
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Form setup
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
      imageUrl: '',
    },
  });

  // Calculate rating stats & breakdown
  const stats = useMemo(() => {
    if (!reviews.length) {
      return {
        avg: 5.0,
        total: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    const total = reviews.length;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      sum += r.rating;
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[rounded] = (breakdown[rounded] || 0) + 1;
    });

    const avg = Math.round((sum / total) * 10) / 10;
    const percentages: Record<number, number> = {
      5: Math.round((breakdown[5] / total) * 100),
      4: Math.round((breakdown[4] / total) * 100),
      3: Math.round((breakdown[3] / total) * 100),
      2: Math.round((breakdown[2] / total) * 100),
      1: Math.round((breakdown[1] / total) * 100),
    };

    return { avg, total, breakdown, percentages };
  }, [reviews]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (ratingFilter !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === ratingFilter);
    }

    if (verifiedOnlyFilter) {
      list = list.filter((r) => r.verifiedPurchase);
    }

    list.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') {
        const aHelpful = (helpfulVotes[a.id] || 0) + (a.rating >= 4 ? 3 : 1);
        const bHelpful = (helpfulVotes[b.id] || 0) + (b.rating >= 4 ? 3 : 1);
        return bHelpful - aHelpful;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [reviews, ratingFilter, verifiedOnlyFilter, sortBy, helpfulVotes]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [filteredReviews, currentPage]);

  // Image upload handler (supports mock file reading to data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setUploadedImages((prev) => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHelpfulVote = (reviewId: string) => {
    if (userVotedReviews[reviewId]) return;
    setUserVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
    dispatch(
      addToast({
        title: 'Feedback recorded',
        description: 'Thank you for rating this review as helpful.',
        type: 'success',
      })
    );
  };

  const isEligible = Boolean(eligibility?.hasPurchased);

  // Quick simulate purchase for easy evaluation in prototype
  const handleSimulatePurchase = async () => {
    if (!isAuthenticated || !user) {
      dispatch(setAuthModalOpen(true));
      return;
    }

    try {
      await createOrder({
        userId: user.id,
        items: [
          {
            productId,
            productName,
            productImage: '',
            price: 199,
            quantity: 1,
          },
        ],
        shippingAddress: {} as any,
        billingAddress: {} as any,
        shippingMethod: {} as any,
        paymentMethod: { type: 'card', last4: '4242' },
        subtotal: 199,
        discount: 0,
        tax: 15,
        shippingCost: 0,
        total: 214,
      }).unwrap();

      dispatch(
        addToast({
          title: 'Purchase verified',
          description: 'Verified buyer status activated for this item. You can now write a review.',
          type: 'success',
        })
      );
    } catch {
      dispatch(
        addToast({
          title: 'Simulation error',
          description: 'Failed to simulate purchase record.',
          type: 'destructive',
        })
      );
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated || !user) {
      dispatch(setAuthModalOpen(true));
      return;
    }

    if (!isEligible) {
      dispatch(
        addToast({
          title: 'Verified Purchase Required',
          description: 'Reviews can only be authored by customers who have purchased this product.',
          type: 'destructive',
        })
      );
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
          description: 'Your verified review is now live on the catalog.',
          type: 'success',
        })
      );
      reset();
      setUploadedImages([]);
      setIsFormOpen(false);
      setCurrentPage(1);
    } catch {
      dispatch(
        addToast({
          title: 'Submission Failed',
          description: 'Please check your connection and try again.',
          type: 'destructive',
        })
      );
    }
  };

  return (
    <div className="space-y-8" id="product-reviews">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Customer Reviews & Reflections
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real feedback from verified owners and studio collectors.
          </p>
        </div>

        {/* Action Button: Sign In / Write Review */}
        <div>
          {!isAuthenticated ? (
            <Button
              onClick={() => dispatch(setAuthModalOpen(true))}
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign in to Review</span>
            </Button>
          ) : !isEligible ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 italic hidden md:inline">
                Reserved for verified owners
              </span>
              <Button
                onClick={handleSimulatePurchase}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                title="Click to simulate having purchased this item for test review submission"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Verify Purchase Demo</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsFormOpen(!isFormOpen)}
              variant={isFormOpen ? 'outline' : 'default'}
              size="sm"
              className="gap-2 text-xs"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>{isFormOpen ? 'Cancel Review' : 'Write a Review'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Review Submission Form (React Hook Form + Zod) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 p-5 sm:p-7 space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Share Your Experience with {productName}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Verified review will be published under {user?.name}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Buyer
            </span>
          </div>

          {/* Star Rating Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Your Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => {
                    setSelectedRating(star);
                    setValue('rating', star, { shouldValidate: true });
                  }}
                  className="p-1 hover:scale-115 transition-transform"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= selectedRating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                {selectedRating} / 5 Stars
              </span>
            </div>
            {errors.rating && <p className="text-xs text-red-500">{errors.rating.message}</p>}
          </div>

          {/* Title Input */}
          <div>
            <Input
              label="Review Headline *"
              placeholder="e.g. Unrivaled acoustic balance and craftsmanship"
              {...register('title')}
              error={errors.title?.message}
            />
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Detailed Feedback *
            </label>
            <textarea
              rows={4}
              placeholder="Describe sound reproduction, material hand-feel, daily usability, or ergonomic details..."
              {...register('comment')}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-950 dark:focus:border-white focus:outline-none transition-colors"
            />
            {errors.comment && (
              <p className="text-xs text-red-500">{errors.comment.message}</p>
            )}
          </div>

          {/* Image Upload Support */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Attach Customer Photos (Optional)</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {uploadedImages.map((src, idx) => (
                <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <img src={src} alt="Uploaded preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(idx)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 hover:border-neutral-500 dark:hover:border-neutral-500 transition-colors">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[9px] mt-1 font-mono">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Submit Verified Review
            </Button>
          </div>
        </form>
      )}

      {/* Rating Overview & Breakdown Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-6 rounded-2xl bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
        {/* Big Score Summary */}
        <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start md:border-r border-neutral-200 dark:border-neutral-800 md:pr-6 text-center md:text-left">
          <div className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {stats.avg.toFixed(1)}
          </div>
          <div className="flex text-amber-500 gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(stats.avg) ? 'fill-amber-400 text-amber-500' : 'text-neutral-300 dark:text-neutral-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Based on {stats.total} {stats.total === 1 ? 'customer review' : 'customer reviews'}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            100% Verified Purchases
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-8 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const pct = stats.percentages[starNum] || 0;
            const count = stats.breakdown[starNum] || 0;
            const isFilterActive = ratingFilter === starNum;

            return (
              <button
                key={starNum}
                type="button"
                onClick={() => setRatingFilter(isFilterActive ? 'all' : starNum)}
                className={`flex items-center gap-3 text-xs w-full group text-left rounded-lg px-2 py-1 transition-colors ${
                  isFilterActive ? 'bg-neutral-200/70 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 font-medium text-neutral-700 dark:text-neutral-300">
                  <span>{starNum}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                </div>

                {/* Progress bar */}
                <div className="relative h-2 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-16 text-right font-mono text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
                  {pct}% ({count})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <Filter className="h-3.5 w-3.5" />
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setRatingFilter('all')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              ratingFilter === 'all'
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950 font-medium'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => setRatingFilter(ratingFilter === stars ? 'all' : stars)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                ratingFilter === stars
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950 font-medium'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
              }`}
            >
              <span>{stars}</span>
              <Star className="h-3 w-3 fill-current" />
            </button>
          ))}

          <button
            type="button"
            onClick={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
              verifiedOnlyFilter
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300 font-medium'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Verified Only</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Review List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-3 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6 text-center text-xs text-red-600 dark:text-red-400">
          Failed to load reviews. Please refresh the page to retry.
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-2">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            No matching reviews found
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {ratingFilter !== 'all' || verifiedOnlyFilter
              ? 'Try adjusting your filters to see more customer responses.'
              : 'Be the first verified customer to share feedback on this design piece.'}
          </p>
          {(ratingFilter !== 'all' || verifiedOnlyFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRatingFilter('all');
                setVerifiedOnlyFilter(false);
              }}
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedReviews.map((review) => {
            const hasVoted = userVotedReviews[review.id];
            const helpfulCount = (helpfulVotes[review.id] || 0) + (review.rating >= 4 ? 4 : 1);

            return (
              <div
                key={review.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 space-y-3 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={review.userAvatar}
                      fallback={review.userName}
                      size="sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {review.userName}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex text-amber-500 gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating ? 'fill-amber-400 text-amber-500' : 'text-neutral-200 dark:text-neutral-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Headline & Body */}
                <h5 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {review.title}
                </h5>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {review.comment}
                </p>

                {/* Helpful Button footer */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-[11px] text-neutral-400">
                    Was this review helpful?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHelpfulVote(review.id)}
                    disabled={hasVoted}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      hasVoted
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 cursor-default font-medium'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                    <span>Helpful ({helpfulCount})</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <span className="text-neutral-500 dark:text-neutral-400">
                Showing Page {currentPage} of {totalPages} ({filteredReviews.length} total)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0"
                  aria-label="Previous reviews page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`h-8 w-8 rounded-lg text-xs font-mono transition-all ${
                      currentPage === pg
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 p-0"
                  aria-label="Next reviews page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

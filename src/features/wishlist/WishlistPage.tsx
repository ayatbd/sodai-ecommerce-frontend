import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigateView } from '../../hooks/useNavigateView';
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutationMutation,
  useClearWishlistMutationMutation,
} from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';
import {
  removeFromWishlist,
  clearWishlist,
} from '../../store/slices/wishlistSlice';
import {
  viewProductDetail,
  addToast,
  setCartOpen,
} from '../../store/slices/uiSlice';
import { formatCurrency } from '../../lib/utils';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Heart,
  HeartCrack,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Star,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Lock,
  ChevronRight,
  LogIn,
} from 'lucide-react';

export function WishlistPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();

  const auth = useAppSelector((state) => state.auth);
  const isAuthenticated = auth.isAuthenticated;
  const localWishlistItems = useAppSelector((state) => state.wishlist.items);

  // RTK Query hooks
  const {
    data: serverWishlist = [],
    isLoading,
    isError,
    refetch,
  } = useGetWishlistQuery(undefined, {
    // If not authenticated, we can still fetch or rely on local
  });

  const [removeFromWishlistMutation] = useRemoveFromWishlistMutationMutation();
  const [clearWishlistMutation] = useClearWishlistMutationMutation();

  // Combine or prefer server items when authenticated
  const items: Product[] =
    isAuthenticated && serverWishlist && serverWishlist.length > 0
      ? serverWishlist
      : localWishlistItems.length > 0
      ? localWishlistItems
      : serverWishlist;

  const inStockItems = items.filter((item) => item.inStock && item.stockCount > 0);

  // 1. Remove individual item
  const handleRemoveItem = async (productId: string, productName: string) => {
    try {
      if (isAuthenticated) {
        await removeFromWishlistMutation(productId).unwrap();
      }
    } catch {
      // ignore
    }
    dispatch(removeFromWishlist(productId));
    dispatch(
      addToast({
        title: 'Removed from Wishlist',
        description: `${productName} was removed from your saved items.`,
        type: 'default',
      })
    );
  };

  // 2. Add single item to cart
  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        product,
        quantity: 1,
        color: product.colors?.[0]?.name,
      })
    );
    dispatch(
      addToast({
        title: 'Added to Bag',
        description: `${product.name} has been added to your shopping bag.`,
        type: 'success',
      })
    );
  };

  // 3. Move all available products to cart
  const handleMoveAllToCart = () => {
    if (inStockItems.length === 0) {
      dispatch(
        addToast({
          title: 'No Available Items',
          description: 'None of the items in your wishlist are currently in stock.',
          type: 'info',
        })
      );
      return;
    }

    inStockItems.forEach((product) => {
      dispatch(
        addToCart({
          product,
          quantity: 1,
          color: product.colors?.[0]?.name,
        })
      );
    });

    dispatch(
      addToast({
        title: 'All In-Stock Items Added',
        description: `Successfully moved ${inStockItems.length} available ${
          inStockItems.length === 1 ? 'item' : 'items'
        } to your shopping bag.`,
        type: 'success',
      })
    );
    dispatch(setCartOpen(true));
  };

  // 4. Clear all wishlist items
  const handleClearAll = async () => {
    try {
      if (isAuthenticated) {
        await clearWishlistMutation().unwrap();
      }
    } catch {
      // ignore
    }
    dispatch(clearWishlist());
    dispatch(
      addToast({
        title: 'Wishlist Cleared',
        description: 'All saved items have been removed.',
        type: 'info',
      })
    );
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-neutral-50/60 pb-16 dark:bg-neutral-950">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-neutral-200/80 bg-white/70 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('home')}
            className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Home
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-900 dark:text-white">
            Saved Wishlist
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Page Title & Main Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
                Saved Wishlist
              </h1>
              <Badge variant="secondary" className="font-mono text-xs">
                {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Curate your desired studio artifacts, track stock availability, and move to bag when ready.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear Wishlist
              </Button>

              <Button
                size="sm"
                onClick={handleMoveAllToCart}
                disabled={inStockItems.length === 0}
                className="gap-2 text-xs font-semibold"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Move All Available to Bag ({inStockItems.length})</span>
              </Button>
            </div>
          )}
        </div>

        {/* Authentication Notice Banner (if not logged in) */}
        {!isAuthenticated && (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4.5 dark:border-amber-900/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                <Lock className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-950 dark:text-amber-200">
                  Save your collection across devices
                </p>
                <p className="text-amber-800 dark:text-amber-400 mt-0.5">
                  Sign in or create an account to synchronize your wishlist, receive back-in-stock alerts, and preserve items.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('login')}
                className="h-8 text-xs border-amber-300 hover:bg-amber-100/60 dark:border-amber-800"
              >
                <LogIn className="h-3.5 w-3.5 mr-1" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('register')}
                className="h-8 text-xs"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && items.length === 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3"
              >
                <Skeleton className="h-56 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && items.length === 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
              Unable to load wishlist records
            </h3>
            <p className="mt-1 text-xs text-red-700 dark:text-red-400">
              There was a temporary issue synchronizing your saved wishlist.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-16 text-center dark:border-neutral-800">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-4">
              <HeartCrack className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
              Your Wishlist is Empty
            </h2>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Save your favorite architectural artifacts, acoustic gear, and lifestyle pieces to compare specs and purchase later.
            </p>
            <Button
              onClick={() => navigate('shop')}
              className="mt-6 text-xs gap-2 px-5 font-semibold"
            >
              <Sparkles className="h-4 w-4" />
              <span>Explore Collection</span>
            </Button>
          </div>
        )}

        {/* Wishlist Product Cards Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => {
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((product.originalPrice! - product.price) / product.originalPrice!) * 100
                  )
                : 0;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <div>
                    {/* Image Container with Badges & Remove Button */}
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {hasDiscount && (
                          <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            -{discountPercent}%
                          </span>
                        )}
                        {product.inStock ? (
                          <span className="rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs">
                            In Stock
                          </span>
                        ) : (
                          <span className="rounded-lg bg-neutral-900/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-xs">
                            Backorder
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(product.id, product.name)}
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-neutral-500 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50 hover:text-rose-600 dark:bg-neutral-900/90 dark:text-neutral-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="uppercase tracking-wider font-semibold">
                          {product.brand || product.category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {product.rating}
                          </span>
                        </div>
                      </div>

                      <h3
                        onClick={() => dispatch(viewProductDetail(product.slug))}
                        className="cursor-pointer text-xs font-bold text-neutral-950 hover:underline dark:text-white line-clamp-1"
                      >
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {product.tagline || product.description}
                      </p>

                      {/* Price Strip */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-bold text-neutral-950 dark:text-white">
                          {formatCurrency(product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-neutral-400 line-through">
                            {formatCurrency(product.originalPrice!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="border-t border-neutral-150 p-3 dark:border-neutral-800">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock || product.stockCount === 0}
                      className="w-full h-9 text-xs font-semibold gap-1.5"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{product.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

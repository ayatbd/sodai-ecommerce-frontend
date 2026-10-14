import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigateView } from '../../hooks/useNavigateView';
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
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
  setCurrentView,
} from '../../store/slices/uiSlice';
import { loginSuccess } from '../../store/slices/authSlice';
import { formatCurrency } from '../../lib/utils';
import { Product } from '../../types';
import { INITIAL_USER } from '../../services/mockData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Heart,
  HeartCrack,
  ShoppingBag,
  Trash2,
  Star,
  RotateCcw,
  Sparkles,
  Lock,
  ChevronRight,
  LogIn,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function WishlistPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();

  const auth = useAppSelector((state) => state.auth);
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const localWishlistItems = useAppSelector((state) => state.wishlist.items);

  // Testing & State simulation controls
  const [simulateState, setSimulateState] = useState<'auto' | 'loading' | 'error' | 'empty' | 'auth_required'>('auto');

  // RTK Query hook for GET /api/v1/wishlist
  const {
    data: serverWishlist = [],
    isLoading: isQueryLoading,
    isError: isQueryError,
    refetch,
  } = useGetWishlistQuery(
    simulateState === 'error' ? { simulateError: true } : undefined,
    {
      // Refetches when component mounts or auth changes
    }
  );

  const [removeFromWishlistApi] = useRemoveFromWishlistMutation();
  const [clearWishlistApi] = useClearWishlistMutation();

  // Combine server items with local fallback
  const rawItems: Product[] =
    isAuthenticated && serverWishlist && serverWishlist.length > 0
      ? serverWishlist
      : localWishlistItems.length > 0
      ? localWishlistItems
      : serverWishlist;

  // Determine effective state based on simulateState or real state
  const isSimulatedLoading = simulateState === 'loading';
  const isSimulatedError = simulateState === 'error';
  const isSimulatedEmpty = simulateState === 'empty';
  const isSimulatedAuthRequired = simulateState === 'auth_required';

  const isLoading = isSimulatedLoading || (isQueryLoading && rawItems.length === 0);
  const isError = isSimulatedError || isQueryError;
  const showAuthRequiredState = isSimulatedAuthRequired || (!isAuthenticated && rawItems.length === 0);
  const items = isSimulatedEmpty ? [] : rawItems;

  const inStockItems = items.filter((item) => item.inStock && item.stockCount > 0);

  // 1. Remove individual item (DELETE /api/v1/wishlist/:productId)
  const handleRemoveItem = async (productId: string, productName: string) => {
    try {
      await removeFromWishlistApi(productId).unwrap();
    } catch {
      // Handled gracefully in mock store
    }
    dispatch(removeFromWishlist(productId));
    dispatch(
      addToast({
        title: 'Removed from Wishlist',
        description: `${productName} was removed from your saved collection.`,
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
          description: 'None of the items in your saved wishlist are currently in stock.',
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
      await clearWishlistApi().unwrap();
    } catch {
      // ignore
    }
    dispatch(clearWishlist());
    dispatch(
      addToast({
        title: 'Wishlist Cleared',
        description: 'All saved items have been cleared from your collection.',
        type: 'info',
      })
    );
  };

  // Demo one-click sign in for testing
  const handleDemoSignIn = () => {
    dispatch(
      loginSuccess({
        user: INITIAL_USER,
        token: `sodai_tok_${Date.now()}`,
      })
    );
    dispatch(
      addToast({
        title: 'Signed in as Alex Rivera',
        description: 'Welcome back! Your cloud wishlist has been synchronized.',
        type: 'success',
      })
    );
    refetch();
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-neutral-50/60 pb-20 dark:bg-neutral-950">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-neutral-200/80 bg-white/70 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => navigate('home')}
              className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Home
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-900 dark:text-white">
              Wishlist
            </span>
          </div>

          {/* State Simulation Pill (Helpful for test verification) */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white/90 p-1 text-[11px] dark:border-neutral-800 dark:bg-neutral-900">
            <span className="px-2 font-mono text-[10px] uppercase text-neutral-400">View:</span>
            <button
              onClick={() => setSimulateState('auto')}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                simulateState === 'auto'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setSimulateState('auth_required')}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                simulateState === 'auth_required'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              Auth Required
            </button>
            <button
              onClick={() => setSimulateState('loading')}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                simulateState === 'loading'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              Loading
            </button>
            <button
              onClick={() => setSimulateState('error')}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                simulateState === 'error'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              Error
            </button>
            <button
              onClick={() => setSimulateState('empty')}
              className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                simulateState === 'empty'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              Empty
            </button>
          </div>
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
              {!showAuthRequiredState && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Curate your desired SODAI studio artifacts, track stock availability, and move directly to your shopping bag.
            </p>
          </div>

          {!showAuthRequiredState && items.length > 0 && !isLoading && !isError && (
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

        {/* 1. AUTHENTICATION-REQUIRED STATE */}
        {showAuthRequiredState && (
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 to-white p-8 sm:p-12 text-center dark:border-amber-900/40 dark:from-amber-950/20 dark:to-neutral-900 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 shadow-xs">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[11px] font-bold tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                Authentication Required
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                Sign In to Access Your Saved Wishlist
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-md mx-auto leading-relaxed">
                Connect to your SODAI Studio profile to synchronize your saved artifacts across all devices, receive back-in-stock notifications, and transfer items into your shopping bag.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => navigate('login')}
                className="w-full sm:w-auto text-xs gap-2 px-6 font-semibold"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to SODAI</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('register')}
                className="w-full sm:w-auto text-xs gap-2 px-6 font-semibold"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Free Account</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleDemoSignIn}
                className="w-full sm:w-auto text-xs gap-2 px-5 font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200"
              >
                <Sparkles className="h-4 w-4" />
                <span>Demo 1-Click Login</span>
              </Button>
            </div>

            <div className="pt-4 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Items saved as guest will automatically merge upon sign in</span>
            </div>
          </div>
        )}

        {/* 2. LOADING STATE */}
        {!showAuthRequiredState && isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <RotateCcw className="h-3.5 w-3.5 animate-spin" />
              <span>Synchronizing saved products with SODAI cloud...</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3"
                >
                  <Skeleton className="h-56 w-full rounded-xl" />
                  <div className="space-y-1.5 pt-1">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ERROR STATE */}
        {!showAuthRequiredState && !isLoading && isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-8 sm:p-12 text-center dark:border-red-900/40 dark:bg-red-950/20 max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-red-950 dark:text-red-200">
                Unable to Load Wishlist
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">
                There was a network or synchronization problem contacting the wishlist service (GET /api/v1/wishlist).
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSimulateState('auto');
                  refetch();
                }}
                className="text-xs gap-1.5 border-red-300 bg-white hover:bg-red-50 text-red-900 dark:border-red-800 dark:bg-neutral-900 dark:text-red-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('shop')}
                className="text-xs gap-1.5"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Explore Catalog</span>
              </Button>
            </div>
          </div>
        )}

        {/* 4. EMPTY WISHLIST STATE */}
        {!showAuthRequiredState && !isLoading && !isError && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 sm:p-16 text-center dark:border-neutral-800 max-w-2xl mx-auto space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-2">
              <HeartCrack className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Save your favorite minimalist instruments, acoustic gear, and lifestyle artifacts to compare specs, track price drops, and purchase later.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => navigate('shop')}
                className="text-xs gap-2 px-6 font-semibold"
              >
                <Sparkles className="h-4 w-4" />
                <span>Explore SODAI Collection</span>
              </Button>
            </div>
          </div>
        )}

        {/* 5. SAVED PRODUCTS GRID */}
        {!showAuthRequiredState && !isLoading && !isError && items.length > 0 && (
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

                      {/* Remove Button (DELETE /api/v1/wishlist/:productId) */}
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
                        <span className="uppercase tracking-wider font-semibold font-mono">
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
                        onClick={() => {
                          dispatch(viewProductDetail(product.slug));
                          if (typeof window !== 'undefined') {
                            window.history.pushState({}, '', `/products/${product.slug}`);
                          }
                        }}
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

                  {/* Card Bottom CTA: Add to Bag */}
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

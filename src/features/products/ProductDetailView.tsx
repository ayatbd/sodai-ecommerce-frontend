import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useGetProductByIdQuery, useGetProductsQuery } from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import {
  setCurrentView,
  setCartOpen,
  addToast,
  viewProductDetail,
} from '../../store/slices/uiSlice';
import { formatCurrency } from '../../lib/utils';
import { ProductReviews } from './ProductReviews';
import { ProductCard } from './ProductCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Package,
  Layers,
} from 'lucide-react';

export function ProductDetailView() {
  const dispatch = useAppDispatch();
  const productId = useAppSelector((state) => state.ui.selectedProductId) || 'prod-1';
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId);
  const { data: allProducts = [] } = useGetProductsQuery();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Product Not Found
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          The requested design item may have been archived or removed from the catalog.
        </p>
        <Button
          onClick={() => dispatch(setCurrentView('shop'))}
          className="mt-6"
        >
          Return to Shop
        </Button>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);
  const currentColor = selectedColor || product.colors?.[0]?.name;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity,
        color: currentColor,
      })
    );
    dispatch(
      addToast({
        title: 'Added to Bag',
        description: `${quantity}x ${product.name} (${currentColor || 'Standard'}) added.`,
        type: 'success',
      })
    );
    dispatch(setCartOpen(true));
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <button
          onClick={() => dispatch(setCurrentView('shop'))}
          className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Catalog</span>
        </button>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-neutral-700 dark:text-neutral-200 font-medium truncate">
          {product.name}
        </span>
      </div>

      {/* Main Product Hero Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Interactive Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 shadow-xs">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            {product.isNew && (
              <Badge variant="default" className="absolute top-4 left-4 font-mono text-[10px]">
                NEW RELEASE
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-neutral-900 dark:border-white scale-95'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Attributes & CTAs */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-neutral-400">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-neutral-400">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {product.name}
            </h1>

            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {product.tagline}
            </p>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-neutral-950 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-150 pt-4 dark:border-neutral-800">
              {product.description}
            </p>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Selected Finish: <span className="font-bold text-neutral-900 dark:text-white">{currentColor}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-transform ${
                        currentColor === c.name
                          ? 'ring-2 ring-neutral-900 dark:ring-white scale-110'
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {currentColor === c.name && (
                        <Check className={`h-4 w-4 ${c.hex === '#f8fafc' || c.hex === '#e2e8f0' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Bullets */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Architectural Specifications
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  {product.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock status indicator */}
            <div className="pt-2">
              {product.inStock ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock — Dispatches within 24 hours from San Francisco studio
                </p>
              ) : (
                <p className="text-xs text-red-500 font-medium">Currently Sold Out</p>
              )}
            </div>
          </div>

          {/* Add to Bag and Wishlist actions */}
          <div className="space-y-3 pt-6 border-t border-neutral-150 dark:border-neutral-800">
            <div className="flex gap-3">
              {/* Quantity selector */}
              <div className="flex items-center rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800 px-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 text-base font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  -
                </button>
                <span className="px-3 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount || 10, quantity + 1))}
                  className="px-2 py-1 text-base font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 gap-2"
                size="lg"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Bag — {formatCurrency(product.price * quantity)}</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => dispatch(toggleWishlist(product))}
                aria-label="Save to wishlist"
                className="h-12 w-12"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Delivery & trial guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300 shrink-0" />
                <span>Free Express $150+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300 shrink-0" />
                <span>Lifetime Warranty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300 shrink-0" />
                <span>30-Day Trial</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Social Proof Section */}
      <div className="border-t border-neutral-200/80 pt-12 dark:border-neutral-800">
        <ProductReviews productId={product.id} />
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-neutral-200/80 pt-12 dark:border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              You may also appreciate
            </h3>
            <button
              onClick={() => dispatch(setCurrentView('shop'))}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              View all goods →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

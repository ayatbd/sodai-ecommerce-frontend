import React from 'react';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import {
  setActiveQuickViewProduct,
  viewProductDetail,
  addToast,
  setCartOpen,
} from '../../store/slices/uiSlice';
import { formatCurrency } from '../../lib/utils';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        description: `${product.name} was added to your bag.`,
        type: 'success',
      })
    );
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    dispatch(
      addToast({
        title: isWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist',
        description: product.name,
        type: 'default',
      })
    );
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setActiveQuickViewProduct(product));
  };

  const handleCardClick = () => {
    dispatch(viewProductDetail(product.id));
  };

  // 1. List View Mode
  if (viewMode === 'list') {
    return (
      <div
        id={`product-card-${product.id}`}
        onClick={handleCardClick}
        className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 transition-all duration-300 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 cursor-pointer gap-5"
      >
        {/* Thumbnail */}
        <div className="relative aspect-square w-full sm:w-48 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />

          <button
            onClick={handleToggleWishlist}
            aria-label="Save to wishlist"
            className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition-all duration-200 dark:bg-neutral-900/90 ${
              isWishlisted
                ? 'text-red-500 hover:text-red-600'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
            {product.isNew && (
              <Badge variant="default" className="text-[10px] tracking-widest font-mono">
                NEW
              </Badge>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge variant="destructive" className="text-[10px]">
                SALE
              </Badge>
            )}
          </div>
        </div>

        {/* Center Details */}
        <div className="flex flex-1 flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              {product.brand && (
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[10px]">
                  {product.brand}
                </span>
              )}
              {product.brand && <span>•</span>}
              <span className="capitalize">{product.category}</span>
            </div>

            <h3 className="text-base font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
              {product.name}
            </h3>

            <p className="text-xs text-neutral-500 line-clamp-2 mt-1 dark:text-neutral-400">
              {product.description || product.tagline}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 ml-1">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-neutral-400">({product.reviewCount} reviews)</span>

              {product.inStock && product.stockCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 ml-2">
                  <Check className="h-3 w-3" /> In Stock ({product.stockCount})
                </span>
              ) : (
                <span className="text-[11px] text-neutral-400 ml-2">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  style={{ backgroundColor: c.hex }}
                  className="h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-700"
                />
              ))}
              <span className="text-[11px] text-neutral-400 ml-1">
                {product.colors.length} shades
              </span>
            </div>
          )}
        </div>

        {/* Right CTA column */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-neutral-100 dark:border-neutral-800 pt-3 sm:pt-0 sm:pl-6 shrink-0 gap-3">
          <div className="text-left sm:text-right">
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-neutral-400 line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickView}
              className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || product.stockCount === 0}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Default Grid View Mode
  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-300 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <Badge variant="default" className="text-[10px] tracking-widest font-mono">
              NEW RELEASE
            </Badge>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge variant="destructive" className="text-[10px]">
              SALE
            </Badge>
          )}
          {product.isFeatured && !product.isNew && (
            <Badge variant="secondary" className="text-[10px] tracking-wider">
              FEATURED
            </Badge>
          )}
          {product.stockCount <= 8 && product.stockCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              ONLY {product.stockCount} LEFT
            </Badge>
          )}
        </div>

        {/* Wishlist toggle icon */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Save to wishlist"
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition-all duration-200 dark:bg-neutral-900/90 ${
            isWishlisted
              ? 'text-red-500 hover:text-red-600'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button Hover Slide */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={handleQuickView}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/95 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-xs hover:bg-white dark:bg-neutral-900/95 dark:text-white dark:hover:bg-neutral-900"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quick View</span>
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || product.stockCount === 0}
            aria-label="Quick add"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium text-neutral-700 dark:text-neutral-300 text-[11px] truncate max-w-[120px]">
              {product.brand || product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-neutral-400">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-neutral-600 dark:text-neutral-100 dark:group-hover:text-neutral-300 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-1 dark:text-neutral-400">
            {product.tagline}
          </p>
        </div>

        {/* Color swatches preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className="h-2.5 w-2.5 rounded-full border border-neutral-300 dark:border-neutral-700"
              />
            ))}
            <span className="text-[10px] text-neutral-400 ml-1">
              {product.colors.length} shades
            </span>
          </div>
        )}

        {/* Price & Primary CTA */}
        <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-950 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
            Details →
          </span>
        </div>
      </div>
    </div>
  );
}

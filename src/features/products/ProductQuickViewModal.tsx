import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setActiveQuickViewProduct,
  viewProductDetail,
  addToast,
  setCartOpen,
} from '../../store/slices/uiSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { Star, ShoppingBag, Heart, Check, ArrowRight } from 'lucide-react';

export function ProductQuickViewModal() {
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.ui.activeQuickViewProduct);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = product ? wishlistItems.some((p) => p.id === product.id) : false;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

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
    dispatch(setActiveQuickViewProduct(null));
    dispatch(setCartOpen(true));
  };

  const handleOpenFullDetail = () => {
    dispatch(setActiveQuickViewProduct(null));
    dispatch(viewProductDetail(product.id));
  };

  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => !open && dispatch(setActiveQuickViewProduct(null))}
      maxWidth="3xl"
      className="p-0 overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left: Product Imagery Gallery */}
        <div className="bg-neutral-100 dark:bg-neutral-800 p-6 flex flex-col justify-between">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-xs">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
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

        {/* Right: Product Details & Controls */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-neutral-400">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-950 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {product.description}
            </p>

            {/* Colors picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Finish: <span className="font-bold text-neutral-900 dark:text-white">{currentColor}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-transform ${
                        currentColor === c.name
                          ? 'ring-2 ring-neutral-900 dark:ring-white scale-110'
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {currentColor === c.name && (
                        <Check className={`h-3.5 w-3.5 ${c.hex === '#f8fafc' || c.hex === '#e2e8f0' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="pt-2">
              {product.inStock ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({product.stockCount} units available in studio)
                </p>
              ) : (
                <p className="text-xs text-red-500 font-medium">Out of Stock</p>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-neutral-150 dark:border-neutral-800">
            <div className="flex gap-3">
              {/* Quantity selector */}
              <div className="flex items-center rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800 px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  -
                </button>
                <span className="px-2 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount || 10, quantity + 1))}
                  className="px-2 py-1 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 gap-2"
                size="md"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Bag</span>
              </Button>

              {/* Wishlist toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => dispatch(toggleWishlist(product))}
                aria-label="Wishlist"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <button
              onClick={handleOpenFullDetail}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white pt-1"
            >
              <span>View complete specifications &amp; reviews</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

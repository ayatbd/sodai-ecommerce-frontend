import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useAddToCartMutationMutation,
} from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import {
  setCurrentView,
  setCartOpen,
  addToast,
  viewProductDetail,
} from '../../store/slices/uiSlice';
import { formatCurrency } from '../../lib/utils';
import { Breadcrumbs } from './Breadcrumbs';
import { ProductGallery } from './ProductGallery';
import { ProductVariants } from './ProductVariants';
import { ProductSpecifications } from './ProductSpecifications';
import { ProductReviews } from './ProductReviews';
import { ProductCard } from './ProductCard';
import { ProductSEO } from './ProductSEO';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Bell,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { VariantGroup } from '../../types';

export function ProductDetailView() {
  const dispatch = useAppDispatch();
  const selectedProductId = useAppSelector((state) => state.ui.selectedProductId) || 'prod-1';
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  // RTK Query hooks
  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useGetProductByIdQuery(selectedProductId);
  const { data: allProducts = [] } = useGetProductsQuery();
  const [addToCartMutation, { isLoading: isAddingToCart }] = useAddToCartMutationMutation();

  // Local state for interactive choices
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Initialize default variant selections when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const initialMap: Record<string, string> = {};
      product.variants.forEach((group) => {
        // Pick first in-stock option, or first option
        const inStockOption = group.options.find((o) => o.inStock !== false) || group.options[0];
        if (inStockOption) {
          initialMap[group.name] = inStockOption.id;
        }
      });
      setSelectedVariants(initialMap);
      setValidationErrors({});
      setQuantity(1);
      setSelectedImageIndex(0);
    }
  }, [product?.id]);

  // Compute active gallery images (combines product images with variant-specific images)
  const galleryImages = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return ['/placeholder.png'];
    }
    const imgs = [...product.images];
    // If a selected color variant has an image, ensure it's available
    if (product.variants) {
      const colorGroup = product.variants.find((g) => g.type === 'color');
      if (colorGroup) {
        const selectedOptId = selectedVariants[colorGroup.name];
        const selectedOpt = colorGroup.options.find((o) => o.id === selectedOptId);
        if (selectedOpt?.image && !imgs.includes(selectedOpt.image)) {
          imgs.unshift(selectedOpt.image);
        }
      }
    }
    return imgs;
  }, [product, selectedVariants]);

  // Compute dynamic current price with variant price offsets
  const { currentPrice, originalPrice, discountPercent, effectiveStock } = useMemo(() => {
    if (!product) {
      return { currentPrice: 0, originalPrice: undefined, discountPercent: 0, effectiveStock: 0 };
    }

    let price = product.price;
    let minVariantStock = product.stockCount || 10;

    if (product.variants) {
      product.variants.forEach((group) => {
        const optId = selectedVariants[group.name];
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          if (opt.priceOverride !== undefined) {
            price = opt.priceOverride;
          } else if (opt.priceOffset) {
            price += opt.priceOffset;
          }
          if (opt.stockCount !== undefined) {
            minVariantStock = Math.min(minVariantStock, opt.stockCount);
          }
        }
      });
    }

    const orig = product.originalPrice ? product.originalPrice + (price - product.price) : undefined;
    const discount = orig && orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
    const inStock = product.inStock && minVariantStock > 0;

    return {
      currentPrice: price,
      originalPrice: orig,
      discountPercent: discount,
      effectiveStock: inStock ? minVariantStock : 0,
    };
  }, [product, selectedVariants]);

  // Check wishlist status
  const isWishlisted = useMemo(() => {
    return product ? wishlistItems.some((item) => item.id === product.id) : false;
  }, [wishlistItems, product]);

  // Variant selector change handler
  const handleSelectVariant = (groupName: string, optionId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [groupName]: optionId }));
    // Clear validation error for this group
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[groupName];
      return copy;
    });

    // If it's a color variant with a specific image, switch gallery index
    if (product?.variants) {
      const group = product.variants.find((g) => g.name === groupName);
      if (group?.type === 'color') {
        const opt = group.options.find((o) => o.id === optionId);
        if (opt?.image) {
          const imgIndex = galleryImages.indexOf(opt.image);
          if (imgIndex !== -1) {
            setSelectedImageIndex(imgIndex);
          }
        }
      }
    }
  };

  // Validate variant selections
  const validateSelections = (): boolean => {
    if (!product?.variants) return true;
    const errors: Record<string, string> = {};

    product.variants.forEach((group) => {
      if (group.required && !selectedVariants[group.name]) {
        errors[group.name] = `Please select a ${group.name.toLowerCase()} option`;
      }
      // Check if selected option is out of stock
      const selectedId = selectedVariants[group.name];
      const opt = group.options.find((o) => o.id === selectedId);
      if (opt && opt.inStock === false) {
        errors[group.name] = `${opt.name} is currently out of stock. Please select another.`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add to Cart handler
  const handleAddToCart = async () => {
    if (!product) return;
    if (!validateSelections()) {
      dispatch(
        addToast({
          title: 'Selection Required',
          description: 'Please select all required product variants before adding to cart.',
          type: 'destructive',
        })
      );
      return;
    }

    const selectedColorOpt = product.variants
      ?.find((g) => g.type === 'color')
      ?.options.find((o) => o.id === selectedVariants['Color Finish']);
    const selectedSizeOpt = product.variants
      ?.find((g) => g.type === 'size')
      ?.options.find((o) => o.id === selectedVariants['Form & Sizing']);
    const selectedMaterialOpt = product.variants
      ?.find((g) => g.type === 'material')
      ?.options.find((o) => o.id === selectedVariants['Material Grade']);

    const payload = {
      product,
      quantity,
      color: selectedColorOpt?.name,
      size: selectedSizeOpt?.name,
      material: selectedMaterialOpt?.name,
      selectedVariants,
      unitPrice: currentPrice,
    };

    try {
      // 1. RTK Query Mutation
      await addToCartMutation(payload).unwrap();

      // 2. Redux Client State
      dispatch(addToCart(payload));

      // 3. Success Toast
      dispatch(
        addToast({
          title: 'Added to Cart',
          description: `${quantity}× ${product.name} added to your shopping bag.`,
          type: 'success',
        })
      );

      // 4. Open Cart Drawer
      dispatch(setCartOpen(true));
    } catch {
      // Fallback local dispatch
      dispatch(addToCart(payload));
      dispatch(
        addToast({
          title: 'Added to Cart',
          description: `${quantity}× ${product.name} added to your bag.`,
          type: 'success',
        })
      );
      dispatch(setCartOpen(true));
    }
  };

  // Buy Now handler
  const handleBuyNow = async () => {
    if (!product) return;
    if (!validateSelections()) {
      dispatch(
        addToast({
          title: 'Selection Required',
          description: 'Please complete required variant selections before proceeding.',
          type: 'destructive',
        })
      );
      return;
    }

    const selectedColorOpt = product.variants
      ?.find((g) => g.type === 'color')
      ?.options.find((o) => o.id === selectedVariants['Color Finish']);

    dispatch(
      addToCart({
        product,
        quantity,
        color: selectedColorOpt?.name,
        selectedVariants,
        unitPrice: currentPrice,
      })
    );

    dispatch(setCurrentView('checkout'));
    window.history.pushState({}, '', '/checkout');
  };

  // Wishlist toggle handler
  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
    dispatch(
      addToast({
        title: isWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist',
        description: isWishlisted
          ? `${product.name} removed from your saved items.`
          : `${product.name} saved to your personal collection.`,
        type: 'default',
      })
    );
  };

  // Scroll to reviews section
  const handleScrollToReviews = () => {
    const el = document.getElementById('product-reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Back-in-stock notification form
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySuccess(true);
    dispatch(
      addToast({
        title: 'Notification Alert Set',
        description: `We will email ${notifyEmail} as soon as this item is back in stock.`,
        type: 'success',
      })
    );
  };

  // Related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = allProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    if (sameCategory.length >= 4) return sameCategory.slice(0, 4);
    const otherProducts = allProducts.filter((p) => p.id !== product.id);
    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [product, allProducts]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="aspect-4/3 sm:aspect-square w-full rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found state
  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Design Piece Not Found
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto">
            The design item you are looking for may have been archived, discontinued, or moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="text-xs"
          >
            Retry Connection
          </Button>
          <Button
            onClick={() => {
              dispatch(setCurrentView('shop'));
              window.history.pushState({}, '', '/shop');
            }}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Studio Catalog</span>
          </Button>
        </div>
      </div>
    );
  }

  const isSoldOut = effectiveStock === 0 || !product.inStock;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      {/* 0. Dynamic SEO & Meta Tags & Schema.org */}
      <ProductSEO product={product} selectedPrice={currentPrice} />

      {/* 1. Breadcrumb Navigation */}
      <Breadcrumbs
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
        }}
      />

      {/* Main Showcase Grid: Left Gallery (Sections 2) & Right Details (Sections 3-19) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: 2. Product Image Gallery */}
        <div className="lg:col-span-7 sticky top-24">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            selectedIndex={selectedImageIndex}
            onSelectIndex={setSelectedImageIndex}
            isNew={product.isNew}
            discountPercent={discountPercent}
            inStock={!isSoldOut}
          />
        </div>

        {/* Right Column: Product Meta, Pricing, Variants & Purchase Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* 4. Brand */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
              {product.brand || 'AURA Studio'}
            </span>

            {/* In-Stock Indicator Tag */}
            {!isSoldOut ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock & Ready to Dispatch</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <span className="h-2 w-2 rounded-full bg-neutral-400" />
                <span>Currently Backordered</span>
              </span>
            )}
          </div>

          {/* 3. Product Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {product.name}
          </h1>

          {/* 5. Rating and Review Count */}
          <button
            type="button"
            onClick={handleScrollToReviews}
            className="group flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label={`Rated ${product.rating} out of 5 stars based on ${product.reviewCount} reviews. Click to read reviews.`}
          >
            <div className="flex text-amber-500 gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-neutral-300 dark:text-neutral-700'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-neutral-400">·</span>
            <span className="underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4 group-hover:decoration-neutral-900 dark:group-hover:decoration-white transition-colors">
              {product.reviewCount} Verified Reviews
            </span>
          </button>

          {/* 6, 7, 8. Pricing Row: Current Price, Original Price, Discount Badge */}
          <div className="flex items-baseline gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white font-mono">
              {formatCurrency(currentPrice)}
            </span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-lg text-neutral-400 line-through font-mono">
                {formatCurrency(originalPrice)}
              </span>
            )}
            {discountPercent > 0 && (
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold border-amber-300 dark:border-amber-800">
                Save {discountPercent}%
              </Badge>
            )}
          </div>

          {/* 9. Product Description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {product.description}
          </p>

          {/* 11. Variant Selectors (Size, Color, Material, Custom) */}
          {product.variants && product.variants.length > 0 && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <ProductVariants
                variantGroups={product.variants}
                selectedVariants={selectedVariants}
                onSelectVariant={handleSelectVariant}
                validationErrors={validationErrors}
              />
            </div>
          )}

          {/* 12, 13. Quantity Selector & Stock Status */}
          {!isSoldOut && (
            <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <span>Select Quantity</span>
                {effectiveStock < 5 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1 font-semibold">
                    <Sparkles className="h-3 w-3" />
                    Only {effectiveStock} units remaining
                  </span>
                ) : (
                  <span className="text-neutral-400 font-mono">
                    {effectiveStock} units in stock
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-mono font-bold text-neutral-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                    disabled={quantity >= effectiveStock}
                    className="p-2.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total: <strong className="font-mono text-neutral-900 dark:text-white">{formatCurrency(currentPrice * quantity)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* 14, 15, 16. Action Buttons: Add to Cart, Buy Now, Wishlist */}
          <div className="space-y-3 pt-2">
            {!isSoldOut ? (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* 14. Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  isLoading={isAddingToCart}
                  size="lg"
                  className="flex-1 gap-2 font-semibold text-sm shadow-sm"
                  id="add-to-cart-button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </Button>

                {/* 15. Buy Now Button */}
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-2 font-semibold text-sm border-neutral-900 text-neutral-900 dark:border-white dark:text-white hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-all"
                  id="buy-now-button"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {/* 16. Wishlist Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`inline-flex items-center justify-center p-3.5 rounded-xl border transition-all ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40 dark:border-red-800 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  title={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            ) : (
              /* Out of stock email capture */
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/70 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <span>Notify Me When In Stock</span>
                </div>
                {notifySuccess ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ You will receive an alert as soon as stock arrives at our studio.
                  </p>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white"
                    />
                    <Button type="submit" size="sm" className="text-xs shrink-0">
                      Notify Me
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* 17, 18, 19. Value Badges: Shipping info, Return policy, Secure payment message */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            {/* 17. Shipping information */}
            <div className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
              <Truck className="h-4 w-4 text-neutral-900 dark:text-white mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold text-neutral-900 dark:text-white">
                  Carbon-Neutral Delivery:
                </strong>{' '}
                {product.shippingInfo || 'Free standard shipping on orders over $150. Dispatches next business day.'}
              </div>
            </div>

            {/* 18. Return policy */}
            <div className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
              <RotateCcw className="h-4 w-4 text-neutral-900 dark:text-white mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold text-neutral-900 dark:text-white">
                  30-Day In-Home Trial:
                </strong>{' '}
                {product.returnPolicy || 'Complimentary return postage with full refund in original packaging.'}
              </div>
            </div>

            {/* 19. Secure payment message */}
            <div className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
              <ShieldCheck className="h-4 w-4 text-neutral-900 dark:text-white mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold text-neutral-900 dark:text-white">
                  256-Bit SSL Encrypted Checkout:
                </strong>{' '}
                Guaranteed safe transactions via Apple Pay, Google Pay, Visa, Mastercard, and Amex.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. Product Specifications Section */}
      <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800">
        <ProductSpecifications product={product} />
      </div>

      {/* 20. Product Reviews Section */}
      <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800">
        <ProductReviews productId={product.id} productName={product.name} />
      </div>

      {/* 21. Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Related Studio Artifacts
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Complementary design pieces curated for cohesive aesthetics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch(setCurrentView('shop'));
                window.history.pushState({}, '', '/shop');
              }}
              className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

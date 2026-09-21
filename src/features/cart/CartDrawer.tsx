import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setCartOpen,
  setCurrentView,
  addToast,
} from '../../store/slices/uiSlice';
import {
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
} from '../../store/slices/cartSlice';
import { setCheckoutStep } from '../../store/slices/checkoutSlice';
import { useValidateCouponMutation } from '../../services/api';
import { calculateCart } from '../../utils/cartCalculations';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import {
  ShoppingBag,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  PackageOpen,
  X,
} from 'lucide-react';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isCartOpen);
  const items = useAppSelector((state) => state.cart.items);
  const appliedCoupon = useAppSelector((state) => state.cart.appliedCoupon);
  const shippingMethod = useAppSelector((state) => state.cart.shippingMethod);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();

  const calculations = calculateCart(items, appliedCoupon, shippingMethod);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    try {
      const result = await validateCoupon({
        code: couponCodeInput.trim(),
        subtotal: calculations.subtotal,
      }).unwrap();

      dispatch(applyCoupon(result));
      dispatch(
        addToast({
          title: 'Coupon Applied',
          description: result.description,
          type: 'success',
        })
      );
      setCouponCodeInput('');
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err !== null && 'data' in err
          ? String((err as { data: string }).data)
          : 'Invalid or expired promo code';
      dispatch(
        addToast({
          title: 'Coupon Error',
          description: errorMsg,
          type: 'destructive',
        })
      );
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    dispatch(
      addToast({
        title: 'Coupon Removed',
        type: 'default',
      })
    );
  };

  const handleProceedToCheckout = () => {
    dispatch(setCartOpen(false));
    dispatch(setCheckoutStep('shipping'));
    dispatch(setCurrentView('checkout'));
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => dispatch(setCartOpen(open))}
      side="right"
      title="Shopping Bag"
      description={`${calculations.itemCount} ${calculations.itemCount === 1 ? 'item' : 'items'} in your selection`}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Cart Items Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-4">
                <PackageOpen className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Your bag is empty
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
                Explore our curated collections and add minimalist design artifacts to your bag.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-6"
                onClick={() => {
                  dispatch(setCartOpen(false));
                  dispatch(setCurrentView('shop'));
                }}
              >
                Discover Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedColor || index}`}
                  className="flex gap-4 rounded-xl border border-neutral-200/70 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Item info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() =>
                            dispatch(
                              removeFromCart({
                                productId: item.product.id,
                                color: item.selectedColor,
                              })
                            )
                          }
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {item.selectedColor && (
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Finish: <span className="text-neutral-600 dark:text-neutral-300 font-medium">{item.selectedColor}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.product.id,
                                color: item.selectedColor,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                          className="px-2 py-0.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-neutral-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.product.id,
                                color: item.selectedColor,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          className="px-2 py-0.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-bold text-neutral-950 dark:text-white">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Coupon Box */}
              <div className="pt-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-semibold">{appliedCoupon.code}</span>
                      <span className="text-[11px] opacity-80">({appliedCoupon.description})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="Promo code (e.g. AURA15)"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white uppercase"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      isLoading={isValidatingCoupon}
                      className="shrink-0 text-xs"
                    >
                      Apply
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout Action */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50/70 p-6 dark:border-neutral-800 dark:bg-neutral-900/80 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Subtotal</span>
                <span>{formatCurrency(calculations.subtotal)}</span>
              </div>

              {calculations.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-{formatCurrency(calculations.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Estimated Shipping</span>
                <span>
                  {calculations.shipping === 0 ? (
                    <span className="text-emerald-600 font-semibold">Free</span>
                  ) : (
                    formatCurrency(calculations.shipping)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Estimated Tax (7.25%)</span>
                <span>{formatCurrency(calculations.tax)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-950 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(calculations.total)}</span>
              </div>
            </div>

            <Button
              onClick={handleProceedToCheckout}
              className="w-full gap-2 py-2.5 text-sm"
              size="lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
              <span>256-bit encrypted checkout via Stripe</span>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setWishlistOpen, setCartOpen, addToast, setCurrentView } from '../../store/slices/uiSlice';
import { removeFromWishlist, clearWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import { Heart, ShoppingBag, Trash2, HeartCrack } from 'lucide-react';

export function WishlistDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isWishlistOpen);
  const items = useAppSelector((state) => state.wishlist.items);

  const handleMoveToCart = (product: typeof items[0]) => {
    dispatch(
      addToCart({
        product,
        quantity: 1,
        color: product.colors?.[0]?.name,
      })
    );
    dispatch(removeFromWishlist(product.id));
    dispatch(
      addToast({
        title: 'Moved to Bag',
        description: `${product.name} moved from wishlist to bag.`,
        type: 'success',
      })
    );
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => dispatch(setWishlistOpen(open))}
      side="right"
      title="Saved Wishlist"
      description={`${items.length} ${items.length === 1 ? 'item' : 'items'} saved for later`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-4">
                <HeartCrack className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Your wishlist is empty
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
                Save your favorite minimalist pieces and compare materials before deciding.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={() => {
                  dispatch(setWishlistOpen(false));
                  dispatch(setCurrentView('shop'));
                }}
              >
                Browse Artifacts
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => dispatch(clearWishlist())}
                  className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>

              {items.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 rounded-xl border border-neutral-200/70 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => dispatch(removeFromWishlist(product.id))}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        {product.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold text-neutral-950 dark:text-white">
                        {formatCurrency(product.price)}
                      </span>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMoveToCart(product)}
                        className="h-7 text-xs gap-1.5 px-2.5"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        <span>Move to Bag</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

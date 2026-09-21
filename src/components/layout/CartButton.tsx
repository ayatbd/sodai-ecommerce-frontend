import React, { useEffect, useState, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCartOpen } from '../../store/slices/uiSlice';

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className = '' }: CartButtonProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Animated badge indicator when items are added
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setCartOpen(true));
  };

  return (
    <button
      id="cart-button"
      onClick={handleCartClick}
      aria-label={`Shopping Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      className={`relative inline-flex items-center justify-center rounded-xl p-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-100 ${className}`}
    >
      <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-105" />

      {/* Item count badge */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: isAnimating ? [1, 1.35, 1] : 1,
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[11px] font-bold text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900 ${
              isAnimating ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Pulsing indicator when newly added */}
      {isAnimating && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-ping rounded-full bg-emerald-400/75" />
      )}
    </button>
  );
}

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Coupon, Product, ShippingMethod } from '../../types';
import { SHIPPING_METHODS } from '../../services/mockData';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  shippingMethod: ShippingMethod;
}

const STORAGE_KEY = 'aura_cart_state_v1';

const getInitialCartState = (): CartState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        appliedCoupon: parsed.appliedCoupon || null,
        shippingMethod: parsed.shippingMethod || SHIPPING_METHODS[0],
      };
    }
  } catch {
    // fallback
  }

  return {
    items: [],
    appliedCoupon: null,
    shippingMethod: SHIPPING_METHODS[0],
  };
};

const persistCart = (state: CartState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

const initialState: CartState = getInitialCartState();

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity?: number;
        color?: string;
        size?: string;
        material?: string;
        selectedVariants?: Record<string, string>;
        unitPrice?: number;
      }>
    ) => {
      const { product, quantity = 1, color, size, material, selectedVariants, unitPrice } = action.payload;
      const variantKey = selectedVariants ? JSON.stringify(selectedVariants) : (color || '');

      const existingIndex = state.items.findIndex((item) => {
        if (item.product.id !== product.id) return false;
        if (selectedVariants && item.selectedVariants) {
          return JSON.stringify(item.selectedVariants) === variantKey;
        }
        return (!color || item.selectedColor === color) && (!size || item.selectedSize === size);
      });

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
        if (unitPrice) state.items[existingIndex].unitPrice = unitPrice;
      } else {
        state.items.push({
          product,
          quantity,
          selectedColor: color || (product.colors?.[0]?.name ?? undefined),
          selectedSize: size,
          selectedMaterial: material,
          selectedVariants: selectedVariants || (color ? { Color: color } : undefined),
          unitPrice: unitPrice || product.price,
        });
      }
      persistCart(state);
    },

    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; color?: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.product.id === action.payload.productId &&
            (!action.payload.color || item.selectedColor === action.payload.color)
          )
      );
      persistCart(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number; color?: string }>
    ) => {
      const { productId, quantity, color } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(
          (item) =>
            !(
              item.product.id === productId &&
              (!color || item.selectedColor === color)
            )
        );
      } else {
        const item = state.items.find(
          (i) =>
            i.product.id === productId &&
            (!color || i.selectedColor === color)
        );
        if (item) {
          item.quantity = Math.min(item.product.stockCount || 99, quantity);
        }
      }
      persistCart(state);
    },

    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.appliedCoupon = action.payload;
      persistCart(state);
    },

    removeCoupon: (state) => {
      state.appliedCoupon = null;
      persistCart(state);
    },

    setShippingMethod: (state, action: PayloadAction<ShippingMethod>) => {
      state.shippingMethod = action.payload;
      persistCart(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      persistCart(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  setShippingMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

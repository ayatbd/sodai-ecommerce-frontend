import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface WishlistState {
  items: Product[];
}

const STORAGE_KEY = 'aura_wishlist_state_v1';

const getInitialWishlistState = (): WishlistState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { items: Array.isArray(parsed.items) ? parsed.items : [] };
    }
  } catch {
    // ignore
  }
  return { items: [] };
};

const persistWishlist = (state: WishlistState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

const initialState: WishlistState = getInitialWishlistState();

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index > -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
      persistWishlist(state);
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      persistWishlist(state);
    },
    clearWishlist: (state) => {
      state.items = [];
      persistWishlist(state);
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

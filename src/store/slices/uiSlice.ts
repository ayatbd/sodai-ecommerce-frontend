import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, ToastMessage } from '../../types';

export type AppView = 'home' | 'shop' | 'product-detail' | 'checkout' | 'orders' | 'addresses' | 'admin';

interface UIState {
  theme: 'light' | 'dark';
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  isMobileMenuOpen: boolean;
  searchQuery: string;
  selectedCategory: string;
  activeQuickViewProduct: Product | null;
  currentView: AppView;
  selectedProductId: string | null;
  toasts: ToastMessage[];
}

const getInitialTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem('aura_theme_v1');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  return 'light';
};

const getInitialView = (): AppView => {
  try {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      if (
        path.startsWith('/shop') ||
        path.startsWith('/search') ||
        path.startsWith('/categories') ||
        search.length > 0
      ) {
        return 'shop';
      }
    }
  } catch {
    // ignore
  }
  return 'home';
};

const initialState: UIState = {
  theme: getInitialTheme(),
  isCartOpen: false,
  isWishlistOpen: false,
  isSearchOpen: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  isMobileMenuOpen: false,
  searchQuery: '',
  selectedCategory: 'all',
  activeQuickViewProduct: null,
  currentView: getInitialView(),
  selectedProductId: null,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('aura_theme_v1', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch {
        // ignore
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      try {
        localStorage.setItem('aura_theme_v1', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch {
        // ignore
      }
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
      if (action.payload) {
        state.isWishlistOpen = false;
      }
    },
    setWishlistOpen: (state, action: PayloadAction<boolean>) => {
      state.isWishlistOpen = action.payload;
      if (action.payload) {
        state.isCartOpen = false;
      }
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setAuthModalTab: (state, action: PayloadAction<'login' | 'register'>) => {
      state.authModalTab = action.payload;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      if (state.currentView !== 'shop') {
        state.currentView = 'shop';
      }
    },
    setActiveQuickViewProduct: (state, action: PayloadAction<Product | null>) => {
      state.activeQuickViewProduct = action.payload;
    },
    setCurrentView: (state, action: PayloadAction<AppView>) => {
      state.currentView = action.payload;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    viewProductDetail: (state, action: PayloadAction<string>) => {
      state.selectedProductId = action.payload;
      state.currentView = 'product-detail';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const toast: ToastMessage = {
        ...action.payload,
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setCartOpen,
  setWishlistOpen,
  setAuthModalOpen,
  setAuthModalTab,
  setMobileMenuOpen,
  setSearchOpen,
  setSearchQuery,
  setSelectedCategory,
  setActiveQuickViewProduct,
  setCurrentView,
  viewProductDetail,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

export interface DiscoveryState {
  searchQuery: string;
  category: string;
  brand: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStockOnly: boolean;
  saleOnly: boolean;
  sortBy: SortOption;
  page: number;
  limit: number;
  isFilterDrawerOpen: boolean;
  viewMode: 'grid' | 'list';
}

const initialState: DiscoveryState = {
  searchQuery: '',
  category: 'all',
  brand: 'all',
  minPrice: undefined,
  maxPrice: undefined,
  rating: undefined,
  inStockOnly: false,
  saleOnly: false,
  sortBy: 'featured',
  page: 1,
  limit: 9,
  isFilterDrawerOpen: false,
  viewMode: 'grid',
};

export const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.page = 1;
    },
    setBrand: (state, action: PayloadAction<string>) => {
      state.brand = action.payload;
      state.page = 1;
    },
    setPriceRange: (
      state,
      action: PayloadAction<{ min?: number; max?: number }>
    ) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
      state.page = 1;
    },
    setMinPrice: (state, action: PayloadAction<number | undefined>) => {
      state.minPrice = action.payload;
      state.page = 1;
    },
    setMaxPrice: (state, action: PayloadAction<number | undefined>) => {
      state.maxPrice = action.payload;
      state.page = 1;
    },
    setRating: (state, action: PayloadAction<number | undefined>) => {
      state.rating = action.payload;
      state.page = 1;
    },
    setInStockOnly: (state, action: PayloadAction<boolean>) => {
      state.inStockOnly = action.payload;
      state.page = 1;
    },
    setSaleOnly: (state, action: PayloadAction<boolean>) => {
      state.saleOnly = action.payload;
      state.page = 1;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = Math.max(1, action.payload);
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    setFilterDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterDrawerOpen = action.payload;
    },
    openMobileFilterDrawer: (state) => {
      state.isFilterDrawerOpen = true;
    },
    closeMobileFilterDrawer: (state) => {
      state.isFilterDrawerOpen = false;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.category = 'all';
      state.brand = 'all';
      state.minPrice = undefined;
      state.maxPrice = undefined;
      state.rating = undefined;
      state.inStockOnly = false;
      state.saleOnly = false;
      state.sortBy = 'featured';
      state.page = 1;
    },
    setFiltersFromUrl: (
      state,
      action: PayloadAction<Partial<Omit<DiscoveryState, 'isFilterDrawerOpen' | 'viewMode'>>>
    ) => {
      if (action.payload.searchQuery !== undefined) state.searchQuery = action.payload.searchQuery;
      if (action.payload.category !== undefined) state.category = action.payload.category;
      if (action.payload.brand !== undefined) state.brand = action.payload.brand;
      if (action.payload.minPrice !== undefined) state.minPrice = action.payload.minPrice;
      if (action.payload.maxPrice !== undefined) state.maxPrice = action.payload.maxPrice;
      if (action.payload.rating !== undefined) state.rating = action.payload.rating;
      if (action.payload.inStockOnly !== undefined) state.inStockOnly = action.payload.inStockOnly;
      if (action.payload.saleOnly !== undefined) state.saleOnly = action.payload.saleOnly;
      if (action.payload.sortBy !== undefined) state.sortBy = action.payload.sortBy;
      if (action.payload.page !== undefined) state.page = action.payload.page;
      if (action.payload.limit !== undefined) state.limit = action.payload.limit;
    },
  },
});

export const {
  setSearchQuery,
  setSearch,
  setCategory,
  setBrand,
  setPriceRange,
  setMinPrice,
  setMaxPrice,
  setRating,
  setInStockOnly,
  setSaleOnly,
  setSortBy,
  setPage,
  setLimit,
  setFilterDrawerOpen,
  openMobileFilterDrawer,
  closeMobileFilterDrawer,
  setViewMode,
  resetFilters,
  setFiltersFromUrl,
} = discoverySlice.actions;

export default discoverySlice.reducer;

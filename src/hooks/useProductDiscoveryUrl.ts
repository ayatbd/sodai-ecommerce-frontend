import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  DiscoveryState,
  SortOption,
  setFiltersFromUrl,
  resetFilters,
} from '../store/slices/discoverySlice';
import { setCurrentView } from '../store/slices/uiSlice';

export interface ParsedUrlDiscovery {
  pathname: string;
  routeType: 'home' | 'shop' | 'search' | 'category';
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
}

export function parseDiscoveryUrl(): ParsedUrlDiscovery {
  const pathname = window.location.pathname || '/';
  const params = new URLSearchParams(window.location.search);

  let routeType: 'home' | 'shop' | 'search' | 'category' = 'shop';
  let categoryFromPath = '';

  if (pathname.startsWith('/categories/')) {
    routeType = 'category';
    categoryFromPath = decodeURIComponent(pathname.replace('/categories/', '').split('/')[0] || '');
  } else if (pathname === '/search' || pathname.startsWith('/search')) {
    routeType = 'search';
  } else if (pathname === '/shop' || pathname.startsWith('/shop')) {
    routeType = 'shop';
  } else if (pathname === '/' || pathname === '') {
    // If query params exist, treat as discovery
    if (params.toString()) {
      routeType = params.has('q') ? 'search' : 'shop';
    } else {
      routeType = 'home';
    }
  }

  // q param
  const q = params.get('q') || '';

  // category param (or path)
  const categoryParam = params.get('category') || categoryFromPath || 'all';

  // brand param
  const brand = params.get('brand') || 'all';

  // minPrice & maxPrice
  const minPriceRaw = params.get('minPrice');
  const maxPriceRaw = params.get('maxPrice');
  const minPrice = minPriceRaw !== null && !isNaN(Number(minPriceRaw)) ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw !== null && !isNaN(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined;

  // rating
  const ratingRaw = params.get('rating');
  const rating = ratingRaw !== null && !isNaN(Number(ratingRaw)) ? Number(ratingRaw) : undefined;

  // inStock
  const inStockRaw = params.get('inStock');
  const inStockOnly = inStockRaw === 'true' || inStockRaw === '1';

  // saleOnly
  const saleRaw = params.get('saleOnly') || params.get('onSale') || params.get('sale');
  const saleOnly = saleRaw === 'true' || saleRaw === '1';

  // sort
  const sortRaw = params.get('sort') || params.get('sortBy');
  let sortBy: SortOption = 'featured';
  if (sortRaw === 'price_asc' || sortRaw === 'price-asc') sortBy = 'price_asc';
  else if (sortRaw === 'price_desc' || sortRaw === 'price-desc') sortBy = 'price_desc';
  else if (sortRaw === 'rating') sortBy = 'rating';
  else if (sortRaw === 'newest') sortBy = 'newest';

  // page & limit
  const pageRaw = params.get('page');
  const page = pageRaw && !isNaN(Number(pageRaw)) ? Math.max(1, parseInt(pageRaw, 10)) : 1;

  const limitRaw = params.get('limit');
  const limit = limitRaw && !isNaN(Number(limitRaw)) ? Math.max(1, parseInt(limitRaw, 10)) : 9;

  return {
    pathname,
    routeType,
    searchQuery: q,
    category: categoryParam,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStockOnly,
    saleOnly,
    sortBy,
    page,
    limit,
  };
}

export function buildDiscoveryUrl(
  state: DiscoveryState,
  routeTypeOverride?: 'home' | 'shop' | 'search' | 'category'
): string {
  let targetPath = '/shop';
  const params = new URLSearchParams();

  if (routeTypeOverride === 'home') {
    return '/';
  }

  if (routeTypeOverride === 'search' || (state.searchQuery && routeTypeOverride !== 'shop' && routeTypeOverride !== 'category')) {
    targetPath = '/search';
  } else if (
    routeTypeOverride === 'category' ||
    (state.category && state.category !== 'all' && !state.searchQuery && routeTypeOverride !== 'shop')
  ) {
    targetPath = `/categories/${encodeURIComponent(state.category)}`;
  } else {
    targetPath = '/shop';
  }

  // 1. Query
  if (state.searchQuery) {
    params.set('q', state.searchQuery);
  }

  // 2. Category (only include as query param if not in pathname or if explicitly /shop)
  if (targetPath !== `/categories/${encodeURIComponent(state.category)}` && state.category && state.category !== 'all') {
    params.set('category', state.category);
  }

  // 3. Brand
  if (state.brand && state.brand !== 'all') {
    params.set('brand', state.brand);
  }

  // 4. Prices
  if (state.minPrice !== undefined) {
    params.set('minPrice', state.minPrice.toString());
  }
  if (state.maxPrice !== undefined) {
    params.set('maxPrice', state.maxPrice.toString());
  }

  // 5. Rating
  if (state.rating !== undefined && state.rating > 0) {
    params.set('rating', state.rating.toString());
  }

  // 6. inStock
  if (state.inStockOnly) {
    params.set('inStock', 'true');
  }

  // 7. saleOnly
  if (state.saleOnly) {
    params.set('saleOnly', 'true');
  }

  // 8. sort
  if (state.sortBy && state.sortBy !== 'featured') {
    params.set('sort', state.sortBy);
  }

  // 9. page
  if (state.page > 1) {
    params.set('page', state.page.toString());
  }

  const queryString = params.toString();
  return queryString ? `${targetPath}?${queryString}` : targetPath;
}

export function useProductDiscoveryUrl() {
  const dispatch = useAppDispatch();
  const discovery = useAppSelector((state) => state.discovery);
  const isInitialMount = useRef(true);
  const isPopStateRef = useRef(false);

  // Sync from URL to Redux
  const syncFromUrlToRedux = useCallback(() => {
    const parsed = parseDiscoveryUrl();

    // If on homepage with no discovery params, don't force filters
    if (parsed.routeType === 'home') {
      return;
    }

    dispatch(
      setFiltersFromUrl({
        searchQuery: parsed.searchQuery,
        category: parsed.category,
        brand: parsed.brand,
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice,
        rating: parsed.rating,
        inStockOnly: parsed.inStockOnly,
        saleOnly: parsed.saleOnly,
        sortBy: parsed.sortBy,
        page: parsed.page,
        limit: parsed.limit,
      })
    );

    // Ensure main view displays the shop/discovery view
    dispatch(setCurrentView('shop'));
  }, [dispatch]);

  // Initial mount: check URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      syncFromUrlToRedux();
    }
  }, [syncFromUrlToRedux]);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      syncFromUrlToRedux();
      setTimeout(() => {
        isPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncFromUrlToRedux]);

  // Sync Redux changes to URL
  const updateUrlFromState = useCallback(
    (pushHistory = false, routeTypeOverride?: 'home' | 'shop' | 'search' | 'category') => {
      if (isPopStateRef.current) return;

      const newUrl = buildDiscoveryUrl(discovery, routeTypeOverride);
      const currentFullUrl = window.location.pathname + window.location.search;

      if (newUrl !== currentFullUrl) {
        if (pushHistory) {
          window.history.pushState({ path: newUrl }, '', newUrl);
        } else {
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }
      }
    },
    [discovery]
  );

  // Navigate helper functions
  const navigateTo = useCallback(
    (path: string) => {
      window.history.pushState({}, '', path);
      syncFromUrlToRedux();
    },
    [syncFromUrlToRedux]
  );

  const navigateToShop = useCallback(
    (params?: Partial<DiscoveryState>) => {
      dispatch(setCurrentView('shop'));
      if (params) {
        dispatch(setFiltersFromUrl(params));
      }
      setTimeout(() => {
        updateUrlFromState(true, 'shop');
      }, 10);
    },
    [dispatch, updateUrlFromState]
  );

  const navigateToSearch = useCallback(
    (query: string) => {
      dispatch(setCurrentView('shop'));
      dispatch(
        setFiltersFromUrl({
          searchQuery: query,
          page: 1,
        })
      );
      setTimeout(() => {
        updateUrlFromState(true, 'search');
      }, 10);
    },
    [dispatch, updateUrlFromState]
  );

  const navigateToCategory = useCallback(
    (categorySlug: string) => {
      dispatch(setCurrentView('shop'));
      dispatch(
        setFiltersFromUrl({
          category: categorySlug,
          searchQuery: '',
          page: 1,
        })
      );
      setTimeout(() => {
        updateUrlFromState(true, 'category');
      }, 10);
    },
    [dispatch, updateUrlFromState]
  );

  const clearAllAndGoToShop = useCallback(() => {
    dispatch(resetFilters());
    dispatch(setCurrentView('shop'));
    window.history.pushState({}, '', '/shop');
  }, [dispatch]);

  return {
    syncFromUrlToRedux,
    updateUrlFromState,
    navigateTo,
    navigateToShop,
    navigateToSearch,
    navigateToCategory,
    clearAllAndGoToShop,
  };
}

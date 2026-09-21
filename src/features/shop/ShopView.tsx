import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setPage,
  setLimit,
  resetFilters,
} from '../../store/slices/discoverySlice';
import { useGetProductsQuery, useGetCategoriesQuery } from '../../services/api';
import { useProductDiscoveryUrl } from '../../hooks/useProductDiscoveryUrl';

import { Breadcrumbs } from '../products/Breadcrumbs';
import { ProductFilterSidebar } from '../products/ProductFilterSidebar';
import { ProductFilterDrawer } from '../products/ProductFilterDrawer';
import { ProductListingHeader } from '../products/ProductListingHeader';
import { ProductGrid } from '../products/ProductGrid';
import { Pagination } from '../products/Pagination';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ShopView() {
  const dispatch = useAppDispatch();

  // 1. Two-way URL synchronization hook (syncs /shop, /search, /categories/:slug with Redux)
  useProductDiscoveryUrl();

  // 2. Discovery Redux State
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStockOnly,
    saleOnly,
    searchQuery,
    sortBy,
    page,
    limit,
    viewMode,
  } = useAppSelector((state) => state.discovery);

  // 3. RTK Query Hooks
  const { data: rawProducts = [], isLoading, isError, refetch } = useGetProductsQuery({
    category: category !== 'all' ? category : undefined,
    brand: brand !== 'all' ? brand : undefined,
    minPrice: minPrice,
    maxPrice: maxPrice,
    rating: rating,
    inStockOnly: inStockOnly,
    saleOnly: saleOnly,
    search: searchQuery || undefined,
    sortBy: sortBy,
  });

  const { data: categories = [] } = useGetCategoriesQuery();

  // 4. Client-side double-filtering & sorting verification
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    // Category filter
    if (category && category !== 'all') {
      list = list.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Brand filter
    if (brand && brand !== 'all') {
      list = list.filter(
        (p) => p.brand?.toLowerCase() === brand.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Price filters
    if (minPrice !== undefined) {
      list = list.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      list = list.filter((p) => p.price <= maxPrice);
    }

    // Rating filter
    if (rating !== undefined) {
      list = list.filter((p) => p.rating >= rating);
    }

    // In Stock filter
    if (inStockOnly) {
      list = list.filter((p) => p.inStock && p.stockCount > 0);
    }

    // Sale Only filter
    if (saleOnly) {
      list = list.filter(
        (p) => p.originalPrice !== undefined && p.originalPrice > p.price
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [rawProducts, category, brand, searchQuery, minPrice, maxPrice, rating, inStockOnly, saleOnly, sortBy]);

  // 5. Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);
  const startIndex = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endIndex = Math.min(currentPage * limit, totalItems);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredProducts.slice(start, start + limit);
  }, [filteredProducts, currentPage, limit]);

  // Active Category information
  const activeCategoryObj = categories.find(
    (c) => c.slug.toLowerCase() === category.toLowerCase()
  );

  // Dynamic Page Title & Subtitle
  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (activeCategoryObj) {
      return `${activeCategoryObj.name} Collection`;
    }
    if (brand && brand !== 'all') {
      return `${brand} Collection`;
    }
    if (sortBy === 'newest') {
      return 'New Arrivals';
    }
    if (sortBy === 'rating') {
      return 'Best Sellers';
    }
    return 'All Products & Instruments';
  };

  const getPageSubtitle = () => {
    if (searchQuery) {
      return `Found ${totalItems} ${totalItems === 1 ? 'result' : 'results'} matching your search criteria.`;
    }
    if (activeCategoryObj) {
      return activeCategoryObj.description;
    }
    return 'Precision-engineered instruments, acoustic monitors, lighting, and workspace artifacts.';
  };

  const hasActiveFilters = Boolean(
    (category && category !== 'all') ||
      (brand && brand !== 'all') ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      rating !== undefined ||
      inStockOnly ||
      saleOnly ||
      searchQuery
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. Breadcrumbs Navigation */}
        <Breadcrumbs />

        {/* 2. Collection Banner & Title */}
        <div className="mt-4 mb-8 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                <span>Curated Studio Catalog</span>
              </div>
              <h1
                id="discovery-page-title"
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white"
              >
                {getPageTitle()}
              </h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
                {getPageSubtitle()}
              </p>
            </div>

            {hasActiveFilters && (
              <Button
                id="clear-all-filters-header-btn"
                variant="outline"
                size="sm"
                onClick={() => dispatch(resetFilters())}
                className="self-start md:self-auto text-xs shrink-0"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        </div>

        {/* 3. Main Discovery Workspace: Sidebar (Desktop) + Products Area */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="w-64 xl:w-72 shrink-0 hidden lg:block sticky top-24">
            <ProductFilterSidebar />
          </aside>

          {/* Product Listing Section */}
          <div id="product-listing-content" className="flex-1 w-full min-w-0">
            {/* Controls Header: Search, Sort, View mode toggle, Mobile filter trigger & Active filter pills */}
            <ProductListingHeader
              totalCount={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />

            {/* Product Grid / List */}
            <div className="mt-6">
              <ProductGrid
                products={paginatedProducts}
                isLoading={isLoading}
                isError={isError}
                viewMode={viewMode}
                onRetry={refetch}
                onClearFilters={() => dispatch(resetFilters())}
              />
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={limit}
                scrollTargetId="product-listing-content"
                onPageChange={(p) => dispatch(setPage(p))}
                onLimitChange={(l) => dispatch(setLimit(l))}
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. Mobile Filter Drawer (Sheet) */}
      <ProductFilterDrawer totalMatchingProducts={totalItems} />
    </div>
  );
}

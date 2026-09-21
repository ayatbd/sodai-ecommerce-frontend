import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  Flame,
  Star,
  Tag,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSearchQuery,
  setSortBy,
  setViewMode,
  setFilterDrawerOpen,
  setCategory,
  setBrand,
  setMinPrice,
  setMaxPrice,
  setRating,
  setInStockOnly,
  setSaleOnly,
  resetFilters,
  SortOption,
} from '../../store/slices/discoverySlice';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ProductListingHeaderProps {
  totalCount: number;
  startIndex: number;
  endIndex: number;
  onFilterChange?: () => void;
}

export function ProductListingHeader({
  totalCount,
  startIndex,
  endIndex,
  onFilterChange,
}: ProductListingHeaderProps) {
  const dispatch = useAppDispatch();
  const discovery = useAppSelector((state) => state.discovery);

  const [localSearch, setLocalSearch] = useState(discovery.searchQuery);

  useEffect(() => {
    setLocalSearch(discovery.searchQuery);
  }, [discovery.searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearch));
    onFilterChange?.();
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    dispatch(setSearchQuery(''));
    onFilterChange?.();
  };

  // Active filter count
  let activeFilterCount = 0;
  if (discovery.category && discovery.category !== 'all') activeFilterCount++;
  if (discovery.brand && discovery.brand !== 'all') activeFilterCount++;
  if (discovery.minPrice !== undefined || discovery.maxPrice !== undefined) activeFilterCount++;
  if (discovery.rating !== undefined) activeFilterCount++;
  if (discovery.inStockOnly) activeFilterCount++;
  if (discovery.saleOnly) activeFilterCount++;

  return (
    <div className="space-y-3 mb-6">
      {/* Primary Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
          role="search"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            id="product-discovery-search-input"
            type="text"
            placeholder="Search products by title, tag, brand..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white/90 py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-white dark:focus:border-white transition-shadow shadow-xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
              aria-label="Clear search input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Right: Controls & Sorting */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap justify-between md:justify-end">
          {/* Mobile Filter Trigger Button */}
          <Button
            id="mobile-filter-drawer-toggle"
            variant="outline"
            size="sm"
            onClick={() => dispatch(setFilterDrawerOpen(true))}
            className="lg:hidden h-9 px-3 gap-2 text-xs font-medium border-neutral-200 dark:border-neutral-800"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-900">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="discovery-sort-select"
              className="sr-only"
            >
              Sort by
            </label>
            <div className="relative">
              <select
                id="discovery-sort-select"
                value={discovery.sortBy}
                onChange={(e) => {
                  dispatch(setSortBy(e.target.value as SortOption));
                  onFilterChange?.();
                }}
                className="h-9 appearance-none rounded-xl border border-neutral-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-neutral-800 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-700 shadow-xs cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            </div>
          </div>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center rounded-xl border border-neutral-200 bg-neutral-100/50 p-0.5 dark:border-neutral-800 dark:bg-neutral-900">
            <button
              id="view-mode-grid-btn"
              onClick={() => dispatch(setViewMode('grid'))}
              className={`rounded-lg p-1.5 transition-colors ${
                discovery.viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              aria-label="Grid layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              id="view-mode-list-btn"
              onClick={() => dispatch(setViewMode('list'))}
              className={`rounded-lg p-1.5 transition-colors ${
                discovery.viewMode === 'list'
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              aria-label="List layout"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Bar: Count & Active Filters Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-850">
        {/* Count */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          {totalCount > 0 ? (
            <>
              Showing <span className="font-semibold text-neutral-900 dark:text-neutral-200">{startIndex + 1}</span>–
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">{Math.min(endIndex, totalCount)}</span> of{' '}
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">{totalCount}</span> products
            </>
          ) : (
            'No matching products'
          )}
        </p>

        {/* Active Filter Pills */}
        {(activeFilterCount > 0 || discovery.searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {discovery.searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                &ldquo;{discovery.searchQuery}&rdquo;
                <button
                  onClick={handleClearSearch}
                  className="hover:text-neutral-950 dark:hover:text-white"
                  aria-label="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {discovery.category && discovery.category !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                Category: <span className="font-semibold capitalize">{discovery.category}</span>
                <button
                  onClick={() => {
                    dispatch(setCategory('all'));
                    onFilterChange?.();
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white"
                  aria-label="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {discovery.brand && discovery.brand !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                Brand: <span className="font-semibold">{discovery.brand}</span>
                <button
                  onClick={() => {
                    dispatch(setBrand('all'));
                    onFilterChange?.();
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white"
                  aria-label="Remove brand filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(discovery.minPrice !== undefined || discovery.maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-mono">
                ${discovery.minPrice ?? 0} – ${discovery.maxPrice ?? 'Any'}
                <button
                  onClick={() => {
                    dispatch(setMinPrice(undefined));
                    dispatch(setMaxPrice(undefined));
                    onFilterChange?.();
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white"
                  aria-label="Remove price filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {discovery.rating !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {discovery.rating}+ stars
                <button
                  onClick={() => {
                    dispatch(setRating(undefined));
                    onFilterChange?.();
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white"
                  aria-label="Remove rating filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {discovery.inStockOnly && (
              <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                In Stock
                <button
                  onClick={() => {
                    dispatch(setInStockOnly(false));
                    onFilterChange?.();
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white"
                  aria-label="Remove in stock filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {discovery.saleOnly && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                <Flame className="h-3 w-3 text-rose-500" />
                Sale
                <button
                  onClick={() => {
                    dispatch(setSaleOnly(false));
                    onFilterChange?.();
                  }}
                  className="hover:text-rose-950 dark:hover:text-white"
                  aria-label="Remove sale filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              onClick={() => {
                dispatch(resetFilters());
                onFilterChange?.();
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

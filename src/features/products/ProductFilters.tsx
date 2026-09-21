import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedCategory, setSearchQuery } from '../../store/slices/uiSlice';
import { ProductFilters as FilterType } from '../../types';
import { useGetCategoriesQuery } from '../../services/api';
import { SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ProductFiltersProps {
  filters: FilterType;
  onFilterChange: (newFilters: FilterType) => void;
  totalResults: number;
}

export function ProductFiltersBar({
  filters,
  onFilterChange,
  totalResults,
}: ProductFiltersProps) {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector((state) => state.ui.selectedCategory);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const { data: categories = [] } = useGetCategoriesQuery();

  const handleCategorySelect = (slug: string) => {
    dispatch(setSelectedCategory(slug));
    onFilterChange({ ...filters, category: slug });
  };

  const handleSortChange = (sortBy: FilterType['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handlePriceChange = (maxPrice?: number) => {
    onFilterChange({ ...filters, maxPrice });
  };

  const handleInStockToggle = () => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly });
  };

  const handleReset = () => {
    dispatch(setSelectedCategory('all'));
    dispatch(setSearchQuery(''));
    onFilterChange({
      category: 'all',
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStockOnly: false,
      sortBy: 'featured',
    });
  };

  const hasActiveFilters =
    (selectedCategory && selectedCategory !== 'all') ||
    Boolean(searchQuery) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.inStockOnly) ||
    Boolean(filters.minRating);

  return (
    <div className="space-y-4">
      {/* Category Pills & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Count Controls */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-neutral-400 hidden sm:inline">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{totalResults}</span> products
          </span>

          <select
            value={filters.sortBy || 'featured'}
            onChange={(e) => handleSortChange(e.target.value as FilterType['sortBy'])}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Additions</option>
          </select>
        </div>
      </div>

      {/* Secondary filter refinement strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-400 font-medium flex items-center gap-1 mr-1">
          <SlidersHorizontal className="h-3 w-3" />
          Filter:
        </span>

        {/* Price limits */}
        <button
          onClick={() => handlePriceChange(filters.maxPrice === 100 ? undefined : 100)}
          className={`rounded-md px-2.5 py-1 border transition-colors ${
            filters.maxPrice === 100
              ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
              : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
          }`}
        >
          Under $100
        </button>
        <button
          onClick={() => handlePriceChange(filters.maxPrice === 250 ? undefined : 250)}
          className={`rounded-md px-2.5 py-1 border transition-colors ${
            filters.maxPrice === 250
              ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
              : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
          }`}
        >
          Under $250
        </button>

        {/* In-Stock Toggle */}
        <button
          onClick={handleInStockToggle}
          className={`rounded-md px-2.5 py-1 border transition-colors ${
            filters.inStockOnly
              ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
              : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
          }`}
        >
          In Stock Only
        </button>

        {/* Active reset button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ml-auto"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
}

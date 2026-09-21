import React from 'react';
import {
  RotateCcw,
  Star,
  Tag,
  Check,
  Flame,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setCategory,
  setBrand,
  setMinPrice,
  setMaxPrice,
  setRating,
  setInStockOnly,
  setSaleOnly,
  resetFilters,
} from '../../store/slices/discoverySlice';
import { useGetCategoriesQuery, useGetBrandsQuery, useGetProductsQuery } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const PRICE_PRESETS = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under $50', min: undefined, max: 50 },
  { label: '$50 – $150', min: 50, max: 150 },
  { label: '$150 – $300', min: 150, max: 300 },
  { label: '$300+', min: 300, max: undefined },
];

const RATING_OPTIONS = [
  { label: '4.5 & up', value: 4.5 },
  { label: '4.0 & up', value: 4.0 },
  { label: '3.0 & up', value: 3.0 },
];

interface ProductFilterSidebarProps {
  className?: string;
  onFilterChange?: () => void;
}

export function ProductFilterSidebar({ className = '', onFilterChange }: ProductFilterSidebarProps) {
  const dispatch = useAppDispatch();
  const discovery = useAppSelector((state) => state.discovery);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: allProducts = [] } = useGetProductsQuery();

  // Active filters count
  const hasActiveFilters = Boolean(
    (discovery.category && discovery.category !== 'all') ||
      (discovery.brand && discovery.brand !== 'all') ||
      discovery.minPrice !== undefined ||
      discovery.maxPrice !== undefined ||
      discovery.rating !== undefined ||
      discovery.inStockOnly ||
      discovery.saleOnly ||
      discovery.searchQuery
  );

  const handleReset = () => {
    dispatch(resetFilters());
    onFilterChange?.();
  };

  const handleCategorySelect = (slug: string) => {
    dispatch(setCategory(slug));
    onFilterChange?.();
  };

  const handleBrandSelect = (brandName: string) => {
    // Toggle brand: if currently selected, revert to 'all'
    if (discovery.brand.toLowerCase() === brandName.toLowerCase()) {
      dispatch(setBrand('all'));
    } else {
      dispatch(setBrand(brandName));
    }
    onFilterChange?.();
  };

  const handlePricePreset = (min?: number, max?: number) => {
    dispatch(setMinPrice(min));
    dispatch(setMaxPrice(max));
    onFilterChange?.();
  };

  const handleRatingSelect = (val?: number) => {
    if (discovery.rating === val) {
      dispatch(setRating(undefined));
    } else {
      dispatch(setRating(val));
    }
    onFilterChange?.();
  };

  const handleInStockToggle = () => {
    dispatch(setInStockOnly(!discovery.inStockOnly));
    onFilterChange?.();
  };

  const handleSaleToggle = () => {
    dispatch(setSaleOnly(!discovery.saleOnly));
    onFilterChange?.();
  };

  // Compute category product counts
  const getCategoryCount = (slug: string) => {
    if (slug === 'all') return allProducts.length;
    return allProducts.filter(
      (p) =>
        p.category.toLowerCase() === slug.toLowerCase() ||
        (slug === 'men' && (p.category === 'apparel' || p.tags.includes('men')))
    ).length;
  };

  // Compute brand product counts
  const getBrandCount = (brandName: string) => {
    return allProducts.filter((p) => p.brand?.toLowerCase() === brandName.toLowerCase()).length;
  };

  return (
    <aside
      id="product-filter-sidebar"
      aria-label="Product discovery filters"
      className={`space-y-6 text-sm ${className}`}
    >
      {/* 1. Header & Reset Action */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100 tracking-tight text-base">
            Filters
          </h2>
        </div>

        {hasActiveFilters && (
          <Button
            id="clear-filters-sidebar-btn"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </Button>
        )}
      </div>

      {/* 2. Availability & Promotions Quick Toggles */}
      <div className="space-y-2.5 pb-5 border-b border-neutral-200/80 dark:border-neutral-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
          Availability & Offers
        </span>

        {/* In Stock Only */}
        <label
          htmlFor="filter-in-stock"
          className="flex items-center justify-between cursor-pointer select-none rounded-xl p-2.5 transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800/60"
        >
          <div className="flex items-center gap-2.5">
            <input
              id="filter-in-stock"
              type="checkbox"
              checked={discovery.inStockOnly}
              onChange={handleInStockToggle}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              In Stock Only
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {allProducts.filter((p) => p.inStock && p.stockCount > 0).length}
          </span>
        </label>

        {/* Sale Only */}
        <label
          htmlFor="filter-sale-only"
          className={`flex items-center justify-between cursor-pointer select-none rounded-xl p-2.5 transition-colors border ${
            discovery.saleOnly
              ? 'border-rose-300 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/20'
              : 'border-neutral-200/60 dark:border-neutral-800/60 hover:bg-neutral-100/70 dark:hover:bg-neutral-850'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <input
              id="filter-sale-only"
              type="checkbox"
              checked={discovery.saleOnly}
              onChange={handleSaleToggle}
              className="h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>Special Offers / On Sale</span>
            </span>
          </div>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Sale
          </Badge>
        </label>
      </div>

      {/* 3. Category Filter */}
      <div className="pb-5 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Categories
          </span>
          {discovery.category !== 'all' && (
            <button
              onClick={() => handleCategorySelect('all')}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline"
            >
              Show all
            </button>
          )}
        </div>

        <div className="space-y-1">
          {/* All option */}
          <button
            id="filter-category-all"
            onClick={() => handleCategorySelect('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
              discovery.category === 'all'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-xs'
                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 opacity-70" />
              <span>All Collections</span>
            </span>
            <span
              className={`text-xs font-mono ${
                discovery.category === 'all'
                  ? 'text-neutral-300 dark:text-neutral-600'
                  : 'text-neutral-400'
              }`}
            >
              {allProducts.length}
            </span>
          </button>

          {/* Individual Categories */}
          {categories
            .filter((c) => c.slug !== 'all')
            .map((cat) => {
              const isSelected = discovery.category.toLowerCase() === cat.slug.toLowerCase();
              const count = getCategoryCount(cat.slug);

              return (
                <button
                  key={cat.id}
                  id={`filter-category-${cat.slug}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-850'
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span
                    className={`text-xs font-mono shrink-0 ${
                      isSelected
                        ? 'text-neutral-300 dark:text-neutral-600'
                        : 'text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* 4. Brand Filter */}
      <div className="pb-5 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Brand
          </span>
          {discovery.brand !== 'all' && (
            <button
              onClick={() => handleBrandSelect(discovery.brand)}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1">
          {brands.map((brandName) => {
            const isSelected = discovery.brand.toLowerCase() === brandName.toLowerCase();
            const count = getBrandCount(brandName);

            return (
              <label
                key={brandName}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-950 font-medium dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    onClick={() => handleBrandSelect(brandName)}
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                        : 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span
                    onClick={() => handleBrandSelect(brandName)}
                    className="truncate text-xs sm:text-sm select-none"
                  >
                    {brandName}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400 shrink-0 ml-2">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Price Range Filter */}
      <div className="pb-5 border-b border-neutral-200/80 dark:border-neutral-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-3">
          Price Range
        </span>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRICE_PRESETS.map((preset, idx) => {
            const isSelected =
              discovery.minPrice === preset.min && discovery.maxPrice === preset.max;

            return (
              <button
                key={idx}
                onClick={() => handlePricePreset(preset.min, preset.max)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-medium dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono">
              $
            </span>
            <input
              id="filter-min-price-input"
              type="number"
              min="0"
              placeholder="Min"
              value={discovery.minPrice !== undefined ? discovery.minPrice : ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Number(e.target.value);
                dispatch(setMinPrice(val));
                onFilterChange?.();
              }}
              className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-6 pr-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">–</span>

          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono">
              $
            </span>
            <input
              id="filter-max-price-input"
              type="number"
              min="0"
              placeholder="Max"
              value={discovery.maxPrice !== undefined ? discovery.maxPrice : ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Number(e.target.value);
                dispatch(setMaxPrice(val));
                onFilterChange?.();
              }}
              className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-6 pr-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>
      </div>

      {/* 6. Customer Rating Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Rating
          </span>
          {discovery.rating !== undefined && (
            <button
              onClick={() => handleRatingSelect(undefined)}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline"
            >
              Any rating
            </button>
          )}
        </div>

        <div className="space-y-1">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = discovery.rating === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => handleRatingSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.floor(opt.value)
                            ? 'fill-amber-400 text-amber-400'
                            : i < opt.value
                            ? 'fill-amber-400/50 text-amber-400'
                            : 'text-neutral-300 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs">{opt.label}</span>
                </div>

                {isSelected && <Check className="h-3.5 w-3.5 text-neutral-900 dark:text-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

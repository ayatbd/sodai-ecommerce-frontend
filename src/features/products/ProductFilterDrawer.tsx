import React from 'react';
import { SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProductFilterSidebar } from './ProductFilterSidebar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setFilterDrawerOpen,
  resetFilters,
} from '../../store/slices/discoverySlice';

interface ProductFilterDrawerProps {
  totalMatchingProducts: number;
  onApply?: () => void;
}

export function ProductFilterDrawer({
  totalMatchingProducts,
  onApply,
}: ProductFilterDrawerProps) {
  const dispatch = useAppDispatch();
  const { isFilterDrawerOpen, category, brand, minPrice, maxPrice, rating, inStockOnly, saleOnly, searchQuery } =
    useAppSelector((state) => state.discovery);

  // Count active filters
  let activeCount = 0;
  if (category && category !== 'all') activeCount++;
  if (brand && brand !== 'all') activeCount++;
  if (minPrice !== undefined || maxPrice !== undefined) activeCount++;
  if (rating !== undefined) activeCount++;
  if (inStockOnly) activeCount++;
  if (saleOnly) activeCount++;
  if (searchQuery) activeCount++;

  const handleClose = () => {
    dispatch(setFilterDrawerOpen(false));
  };

  const handleClearAll = () => {
    dispatch(resetFilters());
  };

  const handleApply = () => {
    dispatch(setFilterDrawerOpen(false));
    onApply?.();
  };

  return (
    <Sheet
      open={isFilterDrawerOpen}
      onOpenChange={(open) => dispatch(setFilterDrawerOpen(open))}
      side="left"
      className="w-full max-w-sm sm:max-w-md"
    >
      <div className="flex flex-col h-full">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Filter Catalog
            </h2>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {activeCount} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-2 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close filter drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ProductFilterSidebar />
        </div>

        {/* Sticky Apply Action Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-md sticky bottom-0 z-20 flex gap-3">
          {activeCount > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="flex-1 text-xs"
            >
              Clear All
            </Button>
          )}

          <Button
            id="apply-filter-drawer-btn"
            variant="default"
            onClick={handleApply}
            className="flex-1 text-xs font-semibold gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            <span>
              Show {totalMatchingProducts} {totalMatchingProducts === 1 ? 'Product' : 'Products'}
            </span>
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

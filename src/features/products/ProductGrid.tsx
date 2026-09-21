import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { AlertCircle, PackageSearch, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  viewMode?: 'grid' | 'list';
  onRetry?: () => void;
  onClearFilters?: () => void;
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  viewMode = 'grid',
  onRetry,
  onClearFilters,
}: ProductGridProps) {
  // 1. Loading State (Skeletons)
  if (isLoading) {
    if (viewMode === 'list') {
      return (
        <div role="status" aria-label="Loading products" className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 gap-4"
            >
              <Skeleton className="aspect-square w-full sm:w-48 rounded-xl" />
              <div className="flex-1 space-y-3 py-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        role="status"
        aria-label="Loading products"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Skeleton className="aspect-square w-full rounded-xl mb-4" />
            <Skeleton className="h-3 w-1/3 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-4" />
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/40 p-12 text-center dark:border-red-900/50 dark:bg-red-950/10 my-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Failed to load product catalog
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
          We encountered an issue retrieving the collection. Please try refreshing or checking your network connection.
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-6 gap-2 border-red-200 hover:bg-red-100/50 dark:border-red-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (products.length === 0) {
    return (
      <div
        role="region"
        aria-label="No products found"
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 p-16 text-center dark:border-neutral-800 my-4 bg-white/70 dark:bg-neutral-900/40"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-4">
          <PackageSearch className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          No matching products found
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
          We couldn’t find any items matching your current filters or search query. Try broadening your criteria.
        </p>
        {onClearFilters && (
          <Button onClick={onClearFilters} variant="default" size="sm" className="mt-6">
            Reset all filters
          </Button>
        )}
      </div>
    );
  }

  // 4. Content Display (List or Grid)
  if (viewMode === 'list') {
    return (
      <div role="region" aria-label="Product list" className="space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Product grid"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode="grid" />
      ))}
    </div>
  );
}

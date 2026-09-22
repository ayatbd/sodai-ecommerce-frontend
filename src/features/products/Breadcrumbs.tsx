import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setCategory,
  setSearchQuery,
  resetFilters,
} from '../../store/slices/discoverySlice';
import { setCurrentView } from '../../store/slices/uiSlice';
import { useGetCategoriesQuery } from '../../services/api';

interface BreadcrumbsProps {
  onNavigate?: (path: string) => void;
  product?: {
    id: string;
    name: string;
    slug?: string;
    category: string;
  };
}

export function Breadcrumbs({ onNavigate, product }: BreadcrumbsProps) {
  const dispatch = useAppDispatch();
  const { category, searchQuery } = useAppSelector((state) => state.discovery);
  const { data: categories = [] } = useGetCategoriesQuery();

  const activeCategory = product?.category || category;
  const activeCategoryObj = categories.find(
    (c) => c.slug.toLowerCase() === activeCategory.toLowerCase()
  );

  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(resetFilters());
    dispatch(setCurrentView('shop'));
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleGoShop = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setCategory('all'));
    dispatch(setSearchQuery(''));
    dispatch(setCurrentView('shop'));
    if (onNavigate) {
      onNavigate('/shop');
    } else {
      window.history.pushState({}, '', '/shop');
    }
  };

  const handleGoCategory = (catSlug: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setCategory(catSlug));
    dispatch(setCurrentView('shop'));
    if (onNavigate) {
      onNavigate(`/categories/${catSlug}`);
    } else {
      window.history.pushState({}, '', `/categories/${catSlug}`);
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-3 overflow-x-auto whitespace-nowrap"
    >
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {/* 1. Home */}
        <li className="flex items-center">
          <a
            href="/"
            onClick={handleGoHome}
            className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </a>
        </li>

        <li aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>

        {/* 2. Shop */}
        <li className="flex items-center">
          <a
            href="/shop"
            onClick={handleGoShop}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Shop
          </a>
        </li>

        {/* 3. Category */}
        {activeCategory && activeCategory !== 'all' && (
          <>
            <li aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="flex items-center">
              <a
                href={`/categories/${activeCategory}`}
                onClick={handleGoCategory(activeCategory)}
                className={`hover:text-neutral-900 dark:hover:text-white transition-colors capitalize ${
                  !product ? 'text-neutral-900 dark:text-white font-semibold' : ''
                }`}
              >
                {activeCategoryObj?.name || activeCategory}
              </a>
            </li>
          </>
        )}

        {/* 4. Product Title */}
        {product && (
          <>
            <li aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="flex items-center">
              <span className="text-neutral-900 dark:text-white font-semibold truncate max-w-[240px] sm:max-w-[360px]">
                {product.name}
              </span>
            </li>
          </>
        )}

        {/* 5. Search Query (if searching and not on product detail) */}
        {!product && searchQuery && (
          <>
            <li aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="flex items-center">
              <span className="text-neutral-900 dark:text-white font-semibold truncate max-w-[200px]">
                Search: &ldquo;{searchQuery}&rdquo;
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

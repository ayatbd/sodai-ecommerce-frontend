import React, { useState } from 'react';
import { ChevronDown, Sparkles, Flame, Info, Layers } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setCurrentView,
  setSelectedCategory,
  setSearchQuery,
} from '../../store/slices/uiSlice';
import { useGetCategoriesQuery } from '../../services/api';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';

export function DesktopNavigation() {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector((state) => state.ui.currentView);
  const selectedCategory = useAppSelector((state) => state.ui.selectedCategory);
  const { data: categories = [] } = useGetCategoriesQuery();

  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setSelectedCategory('all'));
    dispatch(setSearchQuery(''));
    dispatch(setCurrentView('home'));
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setSelectedCategory('all'));
    dispatch(setCurrentView('shop'));
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/shop')) {
      window.history.pushState({}, '', '/shop');
    }
  };

  const handleSelectCategory = (catSlug: string) => {
    dispatch(setSelectedCategory(catSlug));
    dispatch(setCurrentView('shop'));
    setIsCategoriesDropdownOpen(false);
    if (typeof window !== 'undefined') {
      if (catSlug === 'all') {
        window.history.pushState({}, '', '/shop');
      } else {
        window.history.pushState({}, '', `/categories/${catSlug}`);
      }
    }
  };

  const handleNewArrivalsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setSelectedCategory('all'));
    dispatch(setCurrentView('shop'));
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/shop?sort=newest');
    }
  };

  const handleBestSellersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setSelectedCategory('all'));
    dispatch(setCurrentView('shop'));
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/shop?sort=rating');
    }
  };

  return (
    <>
      <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
        {/* Home */}
        <button
          onClick={handleHomeClick}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-neutral-950 dark:hover:text-white ${
            currentView === 'shop' && selectedCategory === 'all'
              ? 'text-neutral-950 dark:text-white font-semibold'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Home
        </button>

        {/* Shop */}
        <button
          onClick={handleShopClick}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-neutral-950 dark:hover:text-white ${
            currentView === 'shop'
              ? 'text-neutral-950 dark:text-white font-semibold'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Shop
        </button>

        {/* Categories Mega Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
          onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
        >
          <button
            onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
            aria-expanded={isCategoriesDropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <span>Categories</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isCategoriesDropdownOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Panel */}
          {isCategoriesDropdownOpen && (
            <div className="absolute left-0 top-full z-50 pt-2">
              <div className="w-80 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800/80 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Curated Disciplines
                  </span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      selectedCategory === 'all'
                        ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Layers className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="font-medium text-xs">All Collections</p>
                      <p className="text-[11px] text-neutral-500">Explore complete catalog</p>
                    </div>
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.slug)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        selectedCategory === cat.slug
                          ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-600 shrink-0" />
                      <div>
                        <p className="font-medium text-xs text-neutral-900 dark:text-white">{cat.name}</p>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">{cat.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Arrivals */}
        <button
          onClick={handleNewArrivalsClick}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>New Arrivals</span>
        </button>

        {/* Best Sellers */}
        <button
          onClick={handleBestSellersClick}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
        >
          <Flame className="h-3.5 w-3.5 text-rose-500" />
          <span>Best Sellers</span>
        </button>

        {/* About Dialog Trigger */}
        <button
          onClick={() => setIsAboutDialogOpen(true)}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
        >
          <Info className="h-3.5 w-3.5 text-neutral-400" />
          <span>About</span>
        </button>
      </nav>

      {/* About Dialog */}
      <Dialog
        open={isAboutDialogOpen}
        onOpenChange={setIsAboutDialogOpen}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">About AURA Studio</DialogTitle>
          <DialogDescription className="text-sm">
            Architectural precision, tactile resonance, and enduring material integrity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>
            Founded in 2024, <strong>AURA</strong> is an independent design house creating thoughtful instruments for creative workspaces and mindful modern living.
          </p>
          <p>
            Every product is manufactured with aerospace-grade anodized aluminum, Italian vegetable-tanned leather, and uncompromised mechanical tolerances. We design objects meant to age with grace and quiet confidence.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5 bg-neutral-50 dark:bg-neutral-900/60">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block">Carbon Neutral</span>
              <span className="text-xs text-neutral-500">100% recycled packaging and offset transport.</span>
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5 bg-neutral-50 dark:bg-neutral-900/60">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block">10-Year Guarantee</span>
              <span className="text-xs text-neutral-500">Free repairs and modular replacement parts.</span>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

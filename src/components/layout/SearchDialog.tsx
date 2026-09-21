import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSearchOpen,
  setSearchQuery,
  setCurrentView,
  viewProductDetail,
} from '../../store/slices/uiSlice';
import { setSearch } from '../../store/slices/discoverySlice';
import { useGetProductsQuery } from '../../services/api';
import { Dialog } from '../ui/Dialog';
import { formatCurrency } from '../../lib/utils';

const POPULAR_SEARCHES = [
  'Mechanical Keyboard',
  'Studio Monitor',
  'Desk Mat',
  'Anodized Lamp',
  'Leather Sleeve',
  'Titanium Pen',
  'Noise Canceling',
];

const RECENT_SEARCHES_KEY = 'aura_recent_searches_v1';

export function SearchDialog() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const [inputValue, setInputValue] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // RTK Query: fetch products for live matching and suggestions
  const { data: products = [] } = useGetProductsQuery();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Save to recent searches
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== termToRemove);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearAllRecent = () => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Auto focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setInputValue('');
    }
  }, [isOpen]);

  // Global shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(setSearchOpen(!isOpen));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isOpen]);

  // Filter products based on current input
  const matchedProducts = inputValue.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          p.tagline.toLowerCase().includes(inputValue.toLowerCase()) ||
          p.category.toLowerCase().includes(inputValue.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(inputValue.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleExecuteSearch = (term: string) => {
    const target = term.trim();
    if (!target) return;
    saveRecentSearch(target);
    dispatch(setSearchQuery(target));
    dispatch(setSearch(target));
    dispatch(setCurrentView('shop'));
    dispatch(setSearchOpen(false));
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(target)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch(inputValue);
    }
  };

  const handleSelectProduct = (productId: string, productName: string) => {
    saveRecentSearch(productName);
    dispatch(viewProductDetail(productId));
    dispatch(setSearchOpen(false));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => dispatch(setSearchOpen(open))}
      maxWidth="2xl"
      className="p-0 overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-2xl"
    >
      {/* Search Input Bar */}
      <div className="relative flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4 py-3.5">
        <Search className="h-5 w-5 text-neutral-400 shrink-0 mr-3" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, materials, categories..."
          aria-label="Search catalog"
          className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-50"
        />
        {inputValue && (
          <button
            onClick={() => setInputValue('')}
            aria-label="Clear search input"
            className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 mr-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
          <CornerDownLeft className="h-3 w-3" />
          <span>Enter</span>
        </div>
      </div>

      {/* Results / Suggestions Container */}
      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
        {/* Live Product Results if typing */}
        {inputValue.trim() && (
          <div>
            <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <span>Matching Products ({matchedProducts.length})</span>
              <button
                onClick={() => handleExecuteSearch(inputValue)}
                className="inline-flex items-center gap-1 text-neutral-900 hover:underline dark:text-neutral-100 font-medium normal-case tracking-normal"
              >
                <span>View all results for &ldquo;{inputValue}&rdquo;</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {matchedProducts.length > 0 ? (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/50">
                {matchedProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id, p.name)}
                    className="w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/80 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-10 w-10 rounded-lg object-cover bg-neutral-200 dark:bg-neutral-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-950 dark:group-hover:text-white">
                          {p.name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate capitalize">
                          {p.category} • {p.tagline}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white shrink-0 ml-3">
                      {formatCurrency(p.price)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No products found matching &ldquo;{inputValue}&rdquo;
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Try searching for keywords like &ldquo;keyboard&rdquo;, &ldquo;monitor&rdquo;, or &ldquo;audio&rdquo;.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {!inputValue && recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <span className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                <span>Recent Searches</span>
              </span>
              <button
                onClick={clearAllRecent}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 capitalize"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleExecuteSearch(term)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <History className="h-3 w-3 text-neutral-400" />
                  <span>{term}</span>
                  <span
                    onClick={(e) => removeRecentSearch(e, term)}
                    className="ml-1 rounded p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                    aria-label={`Remove search ${term}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {!inputValue && (
          <div>
            <div className="flex items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Popular Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleExecuteSearch(term)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:border-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Search className="h-3 w-3 text-neutral-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer shortcut tips */}
      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/70 px-4 py-2 text-[11px] text-neutral-500">
        <div className="flex items-center gap-3">
          <span>Search the entire studio catalog</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Press</span>
          <kbd className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-mono text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            Esc
          </kbd>
          <span>to close</span>
        </div>
      </div>
    </Dialog>
  );
}

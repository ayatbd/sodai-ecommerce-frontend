import React, { useState, useEffect } from 'react';
import {
  Search,
  Heart,
  Menu,
  Sparkles,
  Tag,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSearchOpen,
  setWishlistOpen,
  setMobileMenuOpen,
  toggleTheme,
  setCurrentView,
  setSelectedCategory,
  setSearchQuery,
  setAuthModalOpen,
} from '../../store/slices/uiSlice';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';
import { SearchDialog } from './SearchDialog';
import { UserMenu } from './UserMenu';
import { CartButton } from './CartButton';
import { useNavigateView } from '../../hooks/useNavigateView';

const ANNOUNCEMENT_STORAGE_KEY = 'aura_announcement_dismissed_v1';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();
  const theme = useAppSelector((state) => state.ui.theme);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Announcement bar dismissal state stored in localStorage
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(() => {
    try {
      return localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismissAnnouncement = () => {
    setIsAnnouncementVisible(false);
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setSelectedCategory('all'));
    dispatch(setSearchQuery(''));
    dispatch(setCurrentView('home'));
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleWishlistClick = () => {
    navigate('wishlist');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-colors">
        {/* 1. Optional / Dismissible Announcement Bar */}
        {isAnnouncementVisible && (
          <div
            id="announcement-bar"
            className="relative bg-neutral-950 px-4 py-2 text-center text-[11px] font-medium text-neutral-300 dark:bg-neutral-900 border-b border-neutral-800/80 transition-all duration-200"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 sm:gap-4 pr-6 sm:pr-0 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="h-3 w-3 shrink-0" />
                <span>Complimentary express shipping on orders over $150</span>
              </span>
              <span className="hidden sm:inline text-neutral-600">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-amber-400 shrink-0" />
                <span>
                  Use code <strong className="text-white font-mono tracking-wider">AURA15</strong> for 15% off
                </span>
              </span>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismissAnnouncement}
              aria-label="Dismiss announcement banner"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 2. Main Header Bar */}
        <div className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/95 shadow-xs">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile Menu Trigger + Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile hamburger menu */}
              <button
                id="mobile-menu-button"
                onClick={() => dispatch(setMobileMenuOpen(true))}
                aria-label="Open mobile menu"
                className="lg:hidden rounded-xl p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Store Logo & Brand Name */}
              <a
                href="#home"
                onClick={handleLogoClick}
                aria-label="AURA Home"
                className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-lg p-1"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-mono text-sm font-bold tracking-tight shadow-md dark:bg-neutral-100 dark:text-neutral-950 transition-transform group-hover:scale-105">
                  AU
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-widest text-neutral-950 dark:text-white font-mono">
                    AURA
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans -mt-1 font-medium hidden sm:block">
                    Design & Lifestyle
                  </span>
                </div>
              </a>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center">
              <DesktopNavigation />
            </div>

            {/* Right: Actions (Search, Wishlist, User Account, Cart, Theme) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Search Button with Keyboard Hint */}
              <button
                id="header-search-button"
                onClick={() => dispatch(setSearchOpen(true))}
                aria-label="Search catalog (Cmd+K)"
                className="group flex items-center gap-2 rounded-xl p-2 sm:px-3 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <Search className="h-5 w-5 transition-transform group-hover:scale-105" />
                <span className="hidden md:inline-flex text-xs text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                  Search...
                </span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 dark:border-neutral-750 dark:bg-neutral-850 dark:text-neutral-400">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle Button */}
              <button
                id="theme-toggle-button"
                onClick={() => dispatch(toggleTheme())}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="rounded-xl p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 hidden sm:inline-flex"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="h-5 w-5 text-neutral-700 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Wishlist Button */}
              <button
                id="wishlist-button"
                onClick={handleWishlistClick}
                aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'}`}
                className="relative rounded-xl p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <Heart className="h-5 w-5 transition-transform group-hover:scale-105" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <UserMenu />

              {/* Cart Button */}
              <CartButton />
            </div>
          </div>
        </div>
      </header>

      {/* Global Modals Controlled via Header */}
      <SearchDialog />
      <MobileNavigation />
    </>
  );
}

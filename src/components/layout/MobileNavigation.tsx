import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ShoppingBag,
  Heart,
  User,
  Package,
  MapPin,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
  Flame,
  Layers,
  Info,
  Moon,
  Sun,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setMobileMenuOpen,
  setCurrentView,
  setSelectedCategory,
  setSearchQuery,
  setWishlistOpen,
  setCartOpen,
  setAuthModalOpen,
  setAuthModalTab,
  toggleTheme,
  addToast,
} from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useGetCategoriesQuery, useGetCurrentUserQuery } from '../../services/api';
import { Sheet } from '../ui/Sheet';
import { Avatar } from '../ui/Avatar';

export function MobileNavigation() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const currentView = useAppSelector((state) => state.ui.currentView);
  const selectedCategory = useAppSelector((state) => state.ui.selectedCategory);
  const theme = useAppSelector((state) => state.ui.theme);
  const auth = useAppSelector((state) => state.auth);

  // Redux cart and wishlist counts
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;

  // RTK Query hooks
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !auth.isAuthenticated,
  });

  const activeUser = currentUser || auth.user;
  const isAuthenticated = auth.isAuthenticated && !!activeUser;
  const isAdmin = activeUser?.role === 'admin';

  // Nested categories accordion state
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

  const closeMenu = () => {
    dispatch(setMobileMenuOpen(false));
  };

  const navigateTo = (view: 'shop' | 'orders' | 'addresses' | 'admin', category: string = 'all') => {
    dispatch(setSelectedCategory(category));
    dispatch(setSearchQuery(''));
    dispatch(setCurrentView(view));
    closeMenu();
  };

  const handleOpenCart = () => {
    closeMenu();
    setTimeout(() => {
      dispatch(setCartOpen(true));
    }, 150);
  };

  const handleOpenWishlist = () => {
    closeMenu();
    setTimeout(() => {
      dispatch(setWishlistOpen(true));
    }, 150);
  };

  const handleOpenAuth = (tab: 'login' | 'register') => {
    closeMenu();
    dispatch(setCurrentView(tab));
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${tab}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    closeMenu();
    dispatch(
      addToast({
        title: 'Signed Out',
        description: 'You have been logged out.',
        type: 'info',
      })
    );
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => dispatch(setMobileMenuOpen(open))}
      side="left"
      className="p-0 max-w-xs sm:max-w-sm flex flex-col h-full bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800"
    >
      {/* Mobile Drawer Header */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 px-5 py-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-mono text-xs font-bold dark:bg-white dark:text-neutral-900 shadow-xs">
            AU
          </div>
          <div>
            <span className="font-bold tracking-widest text-sm text-neutral-900 dark:text-white">AURA</span>
            <span className="block text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Modern Design</span>
          </div>
        </div>

        <button
          onClick={closeMenu}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Drawer Scrollable Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Quick Cart & Wishlist Summary Pills */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleOpenCart}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              <span>Cart</span>
            </span>
            <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
              {cartCount}
            </span>
          </button>

          <button
            onClick={handleOpenWishlist}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              <span>Wishlist</span>
            </span>
            <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {wishlistCount}
            </span>
          </button>
        </div>

        {/* Primary Navigation Sections */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Navigation
          </p>

          <button
            onClick={() => navigateTo('shop', 'all')}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              currentView === 'shop' && selectedCategory === 'all'
                ? 'bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-white'
                : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900'
            }`}
          >
            <span>Home & All Collections</span>
          </button>

          {/* Collapsible Categories Menu */}
          <div>
            <button
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-neutral-400" />
                <span>Categories</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                  isCategoriesExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCategoriesExpanded && (
              <div className="ml-4 mt-1 pl-3 border-l border-neutral-200 dark:border-neutral-800 space-y-1">
                <button
                  onClick={() => navigateTo('shop', 'all')}
                  className={`block w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    selectedCategory === 'all'
                      ? 'font-semibold text-neutral-950 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  View All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigateTo('shop', cat.slug)}
                    className={`block w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      selectedCategory === cat.slug
                        ? 'font-semibold text-neutral-950 dark:text-white'
                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              navigateTo('shop');
              setTimeout(() => {
                document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>New Arrivals</span>
          </button>

          <button
            onClick={() => {
              navigateTo('shop');
              setTimeout(() => {
                document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
          >
            <Flame className="h-4 w-4 text-rose-500" />
            <span>Best Sellers</span>
          </button>
        </div>

        {/* User Account / Session Section */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Account & Orders
          </p>

          {isAuthenticated && activeUser ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                <Avatar
                  src={activeUser.avatar}
                  fallback={activeUser.name.slice(0, 2).toUpperCase()}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                    {activeUser.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {activeUser.email}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => navigateTo('admin')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              <button
                onClick={() => navigateTo('orders')}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
              >
                <Package className="h-4 w-4 text-neutral-400" />
                <span>Orders & Invoices</span>
              </button>

              <button
                onClick={() => navigateTo('addresses')}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
              >
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>Saved Addresses</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => handleOpenAuth('login')}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
              >
                <LogIn className="h-4 w-4 text-neutral-500" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors"
              >
                <UserPlus className="h-4 w-4 text-neutral-500" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer: Theme Toggle & Info */}
      <div className="border-t border-neutral-200/80 dark:border-neutral-800 p-4 bg-neutral-50/60 dark:bg-neutral-900/60 shrink-0">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <span>Theme Appearance</span>
          </span>
          <span className="capitalize font-mono text-[11px] text-neutral-400">{theme}</span>
        </button>
      </div>
    </Sheet>
  );
}

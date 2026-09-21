import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setCartOpen,
  setWishlistOpen,
  setAuthModalOpen,
  setAuthModalTab,
  toggleTheme,
  setCurrentView,
  setSelectedCategory,
  setSearchQuery,
} from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  LogOut,
  ShieldCheck,
  Package,
  MapPin,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../components/ui/DropdownMenu';
import { useGetCategoriesQuery } from '../../services/api';

export function Header() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const currentView = useAppSelector((state) => state.ui.currentView);
  const selectedCategory = useAppSelector((state) => state.ui.selectedCategory);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const cartItems = useAppSelector((state) => state.cart.items);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;

  const { data: categories = [] } = useGetCategoriesQuery();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleCategoryClick = (slug: string) => {
    dispatch(setSelectedCategory(slug));
    dispatch(setCurrentView('shop'));
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md transition-colors dark:border-neutral-800/80 dark:bg-neutral-950/90">
      {/* Top micro-announcement banner */}
      <div className="bg-neutral-900 px-4 py-1.5 text-center text-xs font-medium text-neutral-200 dark:bg-neutral-900 dark:text-neutral-300">
        <span>Complimentary carbon-neutral worldwide shipping on orders over $150</span>
        <span className="mx-2 opacity-40">|</span>
        <span className="font-mono text-neutral-400">Use code <span className="text-white font-semibold underline decoration-neutral-500">AURA15</span> for 15% off</span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Mobile menu trigger */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              dispatch(setSelectedCategory('all'));
              dispatch(setCurrentView('shop'));
            }}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold tracking-tighter text-sm">
              AU
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
                AURA
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                STUDIO
              </span>
            </div>
          </button>

          {/* Desktop Categories Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currentView === 'shop' && selectedCategory === cat.slug
                    ? 'bg-neutral-100 text-neutral-950 font-semibold dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Search */}
          <div className="relative hidden md:block w-56 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                dispatch(setSearchQuery(e.target.value));
                if (currentView !== 'shop') dispatch(setCurrentView('shop'));
              }}
              className="w-full rounded-full border border-neutral-200 bg-neutral-100/80 pl-9 pr-4 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-neutral-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => dispatch(setWishlistOpen(true))}
            aria-label="Open wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => dispatch(setCartOpen(true))}
            aria-label="Open cart"
            className="relative flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            {cartItemCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-neutral-900 dark:bg-neutral-900 dark:text-white">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Dropdown */}
          {isAuthenticated && user ? (
            <DropdownMenu
              trigger={
                <button
                  className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  aria-label="User account menu"
                >
                  <Avatar
                    src={user.avatar}
                    fallback={user.name}
                    size="sm"
                    className="cursor-pointer"
                  />
                </button>
              }
            >
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {user.name}
                  </span>
                  <span className="text-xs text-neutral-500 font-normal">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => dispatch(setCurrentView('orders'))}>
                <Package className="h-4 w-4 text-neutral-500" />
                <span>My Orders</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch(setCurrentView('addresses'))}>
                <MapPin className="h-4 w-4 text-neutral-500" />
                <span>Address Book</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch(setCurrentView('admin'))}>
                <ShieldCheck className="h-4 w-4 text-neutral-500" />
                <span>Admin Console</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => dispatch(logout())}>
                <LogOut className="h-4 w-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dispatch(setAuthModalTab('login'));
                dispatch(setAuthModalOpen(true));
              }}
              className="gap-1.5"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 space-y-3">
          {/* Mobile search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => {
                dispatch(setSearchQuery(e.target.value));
                dispatch(setCurrentView('shop'));
              }}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-100 pl-9 pr-4 py-2 text-sm text-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1">
              Categories
            </p>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                  selectedCategory === cat.slug
                    ? 'bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs text-neutral-400 font-mono">{cat.productCount}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-150 pt-2 dark:border-neutral-800 space-y-1">
            <button
              onClick={() => {
                dispatch(setCurrentView('orders'));
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
            >
              <Package className="h-4 w-4 text-neutral-500" />
              <span>Order History</span>
            </button>
            <button
              onClick={() => {
                dispatch(setCurrentView('addresses'));
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-neutral-500" />
              <span>Saved Addresses</span>
            </button>
            <button
              onClick={() => {
                dispatch(setCurrentView('admin'));
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-neutral-500" />
              <span>Admin Management</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

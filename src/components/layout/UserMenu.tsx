import React from 'react';
import { User, LogIn, UserPlus, Package, Heart, LogOut, ShieldCheck, MapPin } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setAuthModalOpen,
  setAuthModalTab,
  setCurrentView,
  setWishlistOpen,
  addToast,
} from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useGetCurrentUserQuery } from '../../services/api';
import { useLogoutMutation } from '../../services/authApi';
import { useNavigateView } from '../../hooks/useNavigateView';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import { Avatar } from '../ui/Avatar';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();
  const auth = useAppSelector((state) => state.auth);

  // RTK Query logout mutation
  const [logoutMutation] = useLogoutMutation();

  // RTK Query hook for live user profile data
  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !auth.isAuthenticated,
  });

  // Fallback to auth slice state if RTK Query hasn't resolved
  const activeUser = currentUser || auth.user;
  const isAuthenticated = auth.isAuthenticated && !!activeUser;
  const isAdmin = activeUser?.role === 'admin';

  const handleOpenAuth = (tab: 'login' | 'register') => {
    navigate(tab);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // ignore
    }
    dispatch(logout());
    dispatch(
      addToast({
        title: 'Logged Out',
        description: 'You have been safely signed out.',
        type: 'info',
      })
    );
  };

  const navigateTo = (view: 'orders' | 'addresses' | 'admin') => {
    navigate(view);
  };

  const trigger = (
    <button
      id="user-menu-button"
      aria-label={isAuthenticated ? `Account menu for ${activeUser?.name || 'User'}` : 'User Account menu'}
      className={`group relative flex items-center justify-center rounded-xl p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-100 ${className}`}
    >
      {isAuthenticated && activeUser ? (
        <div className="flex items-center gap-2">
          <Avatar
            src={activeUser.avatar}
            fallback={activeUser.name.slice(0, 2).toUpperCase()}
            size="sm"
            className="ring-1 ring-neutral-200 dark:ring-neutral-700"
          />
        </div>
      ) : (
        <User className="h-5 w-5 transition-transform group-hover:scale-105" />
      )}
    </button>
  );

  return (
    <DropdownMenu trigger={trigger} align="right" className="w-60">
      {isAuthenticated && activeUser ? (
        <>
          {/* User Profile Header */}
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {activeUser.name}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {activeUser.email}
            </p>
            {isAdmin && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                <ShieldCheck className="h-3 w-3" />
                Store Administrator
              </span>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Admin Dashboard link (if admin) */}
          {isAdmin && (
            <>
              <DropdownMenuItem
                onClick={() => navigateTo('admin')}
                className="font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Account Links */}
          <DropdownMenuLabel>Account</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => navigateTo('orders')}>
            <Package className="h-4 w-4 text-neutral-500" />
            <span>Orders & Invoices</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigateTo('addresses')}>
            <MapPin className="h-4 w-4 text-neutral-500" />
            <span>Saved Addresses</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => dispatch(setWishlistOpen(true))}>
            <Heart className="h-4 w-4 text-neutral-500" />
            <span>My Wishlist</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
            Sign in to access your orders, saved addresses, and express checkout.
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleOpenAuth('login')}>
            <LogIn className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <span>Sign In</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleOpenAuth('register')}>
            <UserPlus className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <span>Create Account</span>
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenu>
  );
}

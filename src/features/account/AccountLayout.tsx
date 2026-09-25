import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentView, AppView, addToast } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useNavigateView } from '../../hooks/useNavigateView';
import { useGetCurrentUserQuery } from '../../services/api';
import { useLogoutMutation } from '../../services/authApi';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  LayoutDashboard,
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Lock,
} from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'profile' | 'orders' | 'order-detail' | 'addresses';
  title?: string;
  subtitle?: string;
}

export function AccountLayout({
  children,
  activeTab,
  title,
  subtitle,
}: AccountLayoutProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();
  const auth = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const { data: userProfile } = useGetCurrentUserQuery(undefined, {
    skip: !auth.isAuthenticated,
  });

  const [logoutMutation] = useLogoutMutation();

  const user = userProfile || auth.user;
  const isAuthenticated = auth.isAuthenticated && !!user;

  // Protect route: Redirect unauthenticated customers to login
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(
        addToast({
          title: 'Authentication Required',
          description: 'Please sign in to access your customer account.',
          type: 'info',
        })
      );
      navigate('login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Account Area Protected
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Redirecting you to the secure login gateway...
        </p>
        <Button onClick={() => navigate('login')} className="mt-6">
          Sign In Now
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // ignore
    }
    dispatch(logout());
    dispatch(
      addToast({
        title: 'Signed Out',
        description: 'You have been safely signed out of your account.',
        type: 'info',
      })
    );
    navigate('home');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      view: 'account' as AppView,
      icon: LayoutDashboard,
    },
    {
      id: 'profile',
      label: 'Profile & Security',
      view: 'account-profile' as AppView,
      icon: UserIcon,
    },
    {
      id: 'orders',
      label: 'Orders & Tracking',
      view: 'account-orders' as AppView,
      icon: Package,
    },
    {
      id: 'addresses',
      label: 'Address Book',
      view: 'account-addresses' as AppView,
      icon: MapPin,
    },
  ];

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'profile':
        return 'Profile';
      case 'orders':
        return 'Orders';
      case 'order-detail':
        return 'Order Details';
      case 'addresses':
        return 'Addresses';
      default:
        return 'Dashboard';
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '2025';

  return (
    <div className="min-h-[calc(100vh-140px)] bg-neutral-50/60 pb-16 dark:bg-neutral-950">
      {/* Breadcrumbs Navigation */}
      <div className="border-b border-neutral-200/80 bg-white/70 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('home')}
            className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Home
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <button
            onClick={() => navigate('account')}
            className={`transition-colors ${
              activeTab === 'dashboard'
                ? 'font-semibold text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Account
          </button>
          {activeTab !== 'dashboard' && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              <span className="font-semibold text-neutral-900 dark:text-white">
                {getBreadcrumbLabel()}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Customer Header Banner */}
        <div className="mb-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar}
                fallback={user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
                size="xl"
                className="h-16 w-16 rounded-2xl ring-2 ring-neutral-200 dark:ring-neutral-700 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
                    {user?.name || 'Customer'}
                  </h1>
                  {user?.isEmailVerified && (
                    <Badge variant="outline" className="gap-1 border-emerald-300 bg-emerald-50 text-[10px] text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Customer
                    </Badge>
                  )}
                  {user?.role === 'admin' && (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[10px] text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {user?.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {memberSince}
                  </span>
                  <span>•</span>
                  <span>Wishlist: {wishlistItems.length} items</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('account-profile')}
                className="gap-1.5 text-xs"
              >
                <UserIcon className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeTab === item.id ||
                    (item.id === 'orders' && activeTab === 'order-detail');

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.view)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-950'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`h-3.5 w-3.5 ${
                          isActive
                            ? 'text-white/80 dark:text-neutral-950/80'
                            : 'text-neutral-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="my-3 border-t border-neutral-150 dark:border-neutral-800" />

              <div className="space-y-1">
                <button
                  onClick={() => dispatch({ type: 'ui/setWishlistOpen', payload: true })}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-neutral-500" />
                    <span>Saved Wishlist</span>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {wishlistItems.length}
                  </Badge>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {title && (
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

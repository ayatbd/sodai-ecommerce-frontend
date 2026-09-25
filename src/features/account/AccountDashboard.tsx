import React from 'react';
import { AccountLayout } from './AccountLayout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigateView } from '../../hooks/useNavigateView';
import { setWishlistOpen } from '../../store/slices/uiSlice';
import {
  useGetOrdersQuery,
  useGetAddressesQuery,
  useGetCurrentUserQuery,
} from '../../services/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Heart,
  User,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export function AccountDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();
  const auth = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const { data: userProfile } = useGetCurrentUserQuery(undefined, {
    skip: !auth.isAuthenticated,
  });
  const { data: orders = [], isLoading: isLoadingOrders } = useGetOrdersQuery();
  const { data: addresses = [], isLoading: isLoadingAddresses } = useGetAddressesQuery();

  const user = userProfile || auth.user;

  // Order status counts
  const processingCount = orders.filter(
    (o) => o.status === 'processing' || o.status === 'pending'
  ).length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const defaultShipping =
    addresses.find((a) => a.isDefaultShipping) || addresses[0];
  const defaultBilling =
    addresses.find((a) => a.isDefaultBilling) || addresses[0];

  const recentOrders = [...orders].slice(0, 3);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <AccountLayout
      activeTab="dashboard"
      title="Customer Dashboard"
      subtitle="Welcome back. Monitor your purchases, dispatches, and saved account details."
    >
      <div className="space-y-8">
        {/* Order Status Summary Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                In Processing
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {isLoadingOrders ? <Skeleton className="h-7 w-10" /> : processingCount}
            </p>
            <span className="text-[10px] text-neutral-400">Awaiting dispatch</span>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                In Transit
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {isLoadingOrders ? <Skeleton className="h-7 w-10" /> : shippedCount}
            </p>
            <span className="text-[10px] text-neutral-400">On carrier vehicle</span>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Delivered
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {isLoadingOrders ? <Skeleton className="h-7 w-10" /> : deliveredCount}
            </p>
            <span className="text-[10px] text-neutral-400">Completed shipments</span>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Total Orders
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {isLoadingOrders ? <Skeleton className="h-7 w-10" /> : orders.length}
            </p>
            <span className="text-[10px] text-neutral-400">Lifetime purchases</span>
          </div>
        </div>

        {/* Account Shortcuts */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-neutral-950 dark:text-white">
            Account Shortcuts
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              onClick={() => navigate('account-profile')}
              className="group cursor-pointer rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 transition-colors group-hover:bg-neutral-900 group-hover:text-white dark:bg-neutral-800 dark:text-white dark:group-hover:bg-neutral-100 dark:group-hover:text-neutral-950">
                <User className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-neutral-950 dark:text-white">
                Personal Profile
              </h4>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                Update name, email, phone number, and password credentials.
              </p>
            </div>

            <div
              onClick={() => navigate('account-orders')}
              className="group cursor-pointer rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 transition-colors group-hover:bg-neutral-900 group-hover:text-white dark:bg-neutral-800 dark:text-white dark:group-hover:bg-neutral-100 dark:group-hover:text-neutral-950">
                <Package className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-neutral-950 dark:text-white">
                Order History
              </h4>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                Live shipment tracking, carrier updates, and invoice downloads.
              </p>
            </div>

            <div
              onClick={() => navigate('account-addresses')}
              className="group cursor-pointer rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 transition-colors group-hover:bg-neutral-900 group-hover:text-white dark:bg-neutral-800 dark:text-white dark:group-hover:bg-neutral-100 dark:group-hover:text-neutral-950">
                <MapPin className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-neutral-950 dark:text-white">
                Saved Addresses
              </h4>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {addresses.length} saved destinations for one-click express checkout.
              </p>
            </div>

            <div
              onClick={() => dispatch(setWishlistOpen(true))}
              className="group cursor-pointer rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-950/50 dark:text-rose-400 dark:group-hover:bg-rose-500">
                <Heart className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-950 dark:text-white">
                  Saved Wishlist
                </h4>
                <Badge variant="secondary" className="text-[10px]">
                  {wishlistItems.length}
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                Review items saved for future purchase or monitor stock alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                Recent Orders
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your latest purchases and shipment progress
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('account-orders')}
              className="gap-1.5 text-xs"
            >
              <span>View All Orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isLoadingOrders ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
              <Package className="mx-auto h-8 w-8 text-neutral-400" />
              <p className="mt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                You haven't placed any orders yet.
              </p>
              <Button
                size="sm"
                onClick={() => navigate('shop')}
                className="mt-4 text-xs"
              >
                Browse Shop
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    {/* Item Thumbnail Strip */}
                    <div className="flex -space-x-3 overflow-hidden">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.productImage}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="h-13 w-13 rounded-xl border-2 border-white object-cover bg-neutral-100 dark:border-neutral-900 dark:bg-neutral-800"
                        />
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-950 dark:text-white">
                          {order.id}
                        </span>
                        <Badge variant={statusVariant(order.status)} className="capitalize text-[10px]">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • Placed on {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white mt-1">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('account-order-detail', undefined, order.id)}
                      className="gap-1.5 text-xs"
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Addresses & Details Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Default Shipping Address */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                  Default Shipping Address
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('account-addresses')}
                className="h-7 text-[11px]"
              >
                Manage
              </Button>
            </div>

            {defaultShipping ? (
              <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <p className="font-semibold text-neutral-950 dark:text-white">
                  {defaultShipping.fullName}
                </p>
                <p>{defaultShipping.street} {defaultShipping.apartment || ''}</p>
                <p>
                  {defaultShipping.city}, {defaultShipping.state} {defaultShipping.postalCode}
                </p>
                <p>{defaultShipping.country}</p>
                <p className="text-neutral-400">{defaultShipping.phone}</p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                No shipping address configured.
              </p>
            )}
          </div>

          {/* Default Billing Address */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                  Default Billing Address
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('account-addresses')}
                className="h-7 text-[11px]"
              >
                Manage
              </Button>
            </div>

            {defaultBilling ? (
              <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <p className="font-semibold text-neutral-950 dark:text-white">
                  {defaultBilling.fullName}
                </p>
                <p>{defaultBilling.street} {defaultBilling.apartment || ''}</p>
                <p>
                  {defaultBilling.city}, {defaultBilling.state} {defaultBilling.postalCode}
                </p>
                <p>{defaultBilling.country}</p>
                <p className="text-neutral-400">{defaultBilling.phone}</p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                No billing address configured.
              </p>
            )}
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}

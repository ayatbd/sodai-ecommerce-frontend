import React, { useState, useMemo } from 'react';
import { AccountLayout } from './AccountLayout';
import { useNavigateView } from '../../hooks/useNavigateView';
import { useGetOrdersQuery } from '../../services/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Order, OrderStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Package,
  Truck,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

const ITEMS_PER_PAGE = 3;

export function OrdersPage() {
  const navigate = useNavigateView();
  const { data: orders = [], isLoading, isError, refetch } = useGetOrdersQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Status badges variant
  const statusBadgeVariant = (status: OrderStatus) => {
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

  const paymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paid
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending Payment
          </span>
        );
    }
  };

  const fulfillmentBadge = (status?: string, mainStatus?: OrderStatus) => {
    const s = status || mainStatus || 'processing';
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Truck className="h-3 w-3" />
            Shipped
          </span>
        );
      case 'return_requested':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/70 px-2 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
            <RotateCcw className="h-3 w-3" />
            Return Requested
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/70 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/70 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
    }
  };

  // Filter orders by search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === 'all' || order.status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
        order.items.some((item) => item.productName.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <AccountLayout
      activeTab="orders"
      title="My Orders &amp; Dispatches"
      subtitle="Track your shipments, view detailed invoice breakdowns, and manage requests."
    >
      <div className="space-y-6">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all shrink-0 ${
                  selectedStatus === status
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by order # or product..."
              className="h-9 text-xs pl-8 pr-3"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <h3 className="mt-2 text-sm font-bold text-red-800 dark:text-red-300">
              Unable to load order history
            </h3>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              There was an issue communicating with the order records service.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-4">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              {searchQuery || selectedStatus !== 'all'
                ? 'No matching orders found'
                : 'No orders placed yet'}
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or resetting the status filters.'
                : 'When you purchase from our curated studio catalog, your orders and real-time tracking will appear here.'}
            </p>
            {searchQuery || selectedStatus !== 'all' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                }}
                className="mt-4 text-xs"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate('shop')}
                className="mt-5 text-xs gap-1.5"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Explore Catalog</span>
              </Button>
            )}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !isError && paginatedOrders.length > 0 && (
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const orderRef = order.orderNumber || order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden"
                >
                  {/* Order Header Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-neutral-50/70 dark:bg-neutral-850/40 border-b border-neutral-150 dark:border-neutral-800">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                          Order Reference
                        </span>
                        <span className="font-mono font-bold text-neutral-950 dark:text-white">
                          {orderRef}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                          Date Placed
                        </span>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                          Order Total
                        </span>
                        <span className="font-bold text-neutral-950 dark:text-white">
                          {formatCurrency(order.total)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {paymentStatusBadge(order.paymentStatus)}
                        {fulfillmentBadge(order.fulfillmentStatus, order.status)}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('account-order-detail', undefined, order.id)}
                      className="gap-1.5 text-xs font-semibold self-end sm:self-auto"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Product Preview Strip */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
                          />
                          <div className="text-xs flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''} • {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Pill / Carrier Info */}
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-850/50 dark:text-neutral-300 self-start sm:self-auto shrink-0">
                        <Truck className="h-4 w-4 text-neutral-500" />
                        <div>
                          <span className="text-[10px] text-neutral-400 block leading-tight">
                            {order.carrier || 'Tracking Code'}
                          </span>
                          <span className="font-mono text-[11px] font-semibold">
                            {order.trackingNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white px-5 py-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing Page {currentPage} of {totalPages} ({filteredOrders.length} total orders)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

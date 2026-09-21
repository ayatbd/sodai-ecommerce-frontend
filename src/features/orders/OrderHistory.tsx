import React, { useState } from 'react';
import { useGetOrdersQuery } from '../../services/api';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentView, viewProductDetail } from '../../store/slices/uiSlice';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Order, OrderStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Package,
  Truck,
  ArrowLeft,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function OrderHistory() {
  const dispatch = useAppDispatch();
  const { data: orders = [], isLoading, isError, refetch } = useGetOrdersQuery();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const statusVariant = (status: OrderStatus) => {
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-red-500">Could not retrieve order records.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-4">
          <Package className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          No Orders Placed Yet
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Once you complete a purchase, your shipment tracking and digital receipts will show here.
        </p>
        <Button onClick={() => dispatch(setCurrentView('shop'))} className="mt-6">
          Explore Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6 dark:border-neutral-800">
        <div>
          <button
            onClick={() => dispatch(setCurrentView('shop'))}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Store</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
            Order History &amp; Shipments
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Tracking updates, digital invoices, and carrier dispatches.
          </p>
        </div>

        <Badge variant="secondary" className="self-start sm:self-auto font-mono">
          {orders.length} TOTAL ORDERS
        </Badge>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 transition-all"
            >
              {/* Order Card Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-neutral-50/60 dark:bg-neutral-850/40 border-b border-neutral-150 dark:border-neutral-800">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                      Order Reference
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                      {order.id}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                      Date Placed
                    </span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                      Total Billed
                    </span>
                    <span className="font-bold text-neutral-950 dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                      Status
                    </span>
                    <Badge variant={statusVariant(order.status)} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white self-end sm:self-auto"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* Order Quick Thumbnail Strip */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 shrink-0">
                      <img
                        src={item.productImage}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800"
                      />
                      <div className="text-xs">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1 max-w-[140px]">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                    <Truck className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                    <span className="font-mono text-[11px]">{order.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Expanded Breakdown */}
              {isExpanded && (
                <div className="p-6 bg-neutral-50/30 border-t border-neutral-150 dark:border-neutral-800 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="rounded-lg border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-1.5">
                      <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[10px] block mb-2">
                        Delivery Destination
                      </span>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200">{order.shippingAddress.fullName}</p>
                      <p className="text-neutral-500">{order.shippingAddress.street} {order.shippingAddress.apartment || ''}</p>
                      <p className="text-neutral-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p className="text-neutral-500">{order.shippingAddress.country}</p>
                    </div>

                    <div className="rounded-lg border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-1.5">
                      <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[10px] block mb-2">
                        Financial Receipt
                      </span>
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-500">
                        <span>Shipping ({order.shippingMethod.name})</span>
                        <span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Tax</span>
                        <span>{formatCurrency(order.tax)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold text-neutral-950 dark:text-white text-sm">
                        <span>Total Paid</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

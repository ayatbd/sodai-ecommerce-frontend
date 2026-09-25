import React, { useState } from 'react';
import { AccountLayout } from './AccountLayout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigateView } from '../../hooks/useNavigateView';
import { viewProductDetail, addToast } from '../../store/slices/uiSlice';
import {
  useGetOrderByIdQuery,
  useGetOrdersQuery,
  useCancelOrderMutation,
  useReturnOrderMutation,
} from '../../services/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { OrderStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Package,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  XCircle,
  RotateCcw,
  Calendar,
  CreditCard,
  MapPin,
  FileText,
  AlertCircle,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export function OrderDetailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();
  const activeOrderId = useAppSelector((state) => state.ui.activeOrderId);

  // Fallback to URL path extraction if not in state
  const orderIdFromUrl =
    typeof window !== 'undefined'
      ? window.location.pathname.replace('/account/orders/', '').split('/')[0]
      : null;
  const currentOrderId = activeOrderId || orderIdFromUrl || 'ORD-84920';

  const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(currentOrderId);
  const [cancelOrderMutation, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [returnOrderMutation, { isLoading: isReturning }] = useReturnOrderMutation();

  // Dialog states
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed mind or bought by mistake');
  const [returnReason, setReturnReason] = useState('Item not as expected / size issue');
  const [returnNotes, setReturnNotes] = useState('');

  if (isLoading) {
    return (
      <AccountLayout activeTab="order-detail" title="Order Details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </AccountLayout>
    );
  }

  if (isError || !order) {
    return (
      <AccountLayout activeTab="order-detail" title="Order Not Found">
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <AlertCircle className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
          <h3 className="text-base font-bold text-neutral-950 dark:text-white">
            Order Record Unavailable
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            We couldn’t retrieve the order details for reference <span className="font-mono">{currentOrderId}</span>.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('account-orders')}
              className="text-xs gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Orders</span>
            </Button>
            <Button size="sm" onClick={() => refetch()} className="text-xs">
              Retry
            </Button>
          </div>
        </div>
      </AccountLayout>
    );
  }

  const orderRef = order.orderNumber || order.id;

  // Determine allowed actions
  const isCancellable = order.status === 'processing' || order.status === 'pending';
  const isReturnable =
    order.status === 'delivered' && order.fulfillmentStatus !== 'return_requested';

  // Shipment timeline stages
  const timelineStages = [
    { key: 'placed', label: 'Order Placed', completed: true },
    {
      key: 'processing',
      label: 'Processing',
      completed: order.status !== 'cancelled',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      completed:
        order.status === 'shipped' ||
        order.status === 'delivered' ||
        order.fulfillmentStatus === 'shipped' ||
        order.fulfillmentStatus === 'delivered',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      completed: order.status === 'delivered' || order.fulfillmentStatus === 'delivered',
    },
  ];

  const handleCancelOrder = async () => {
    try {
      await cancelOrderMutation({
        orderId: order.id,
        reason: cancelReason,
      }).unwrap();
      dispatch(
        addToast({
          title: 'Order Cancelled',
          description: `Order ${orderRef} has been cancelled and refunded.`,
          type: 'info',
        })
      );
      setIsCancelDialogOpen(false);
      refetch();
    } catch {
      dispatch(
        addToast({
          title: 'Cancellation Failed',
          description: 'Could not process order cancellation. Contact support.',
          type: 'destructive',
        })
      );
    }
  };

  const handleReturnOrder = async () => {
    try {
      await returnOrderMutation({
        orderId: order.id,
        reason: returnReason,
        notes: returnNotes,
      }).unwrap();
      dispatch(
        addToast({
          title: 'Return Requested',
          description: `Your return authorization for ${orderRef} has been generated.`,
          type: 'success',
        })
      );
      setIsReturnDialogOpen(false);
      refetch();
    } catch {
      dispatch(
        addToast({
          title: 'Return Request Failed',
          description: 'Could not submit return request. Please try again.',
          type: 'destructive',
        })
      );
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <AccountLayout
      activeTab="order-detail"
      title={`Order ${orderRef}`}
      subtitle={`Placed on ${formatDate(order.createdAt)} • Digital receipt & carrier tracker`}
    >
      <div className="space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('account-orders')}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Orders</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInvoiceOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Invoice</span>
            </Button>

            {isCancellable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
                className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Cancel Order</span>
              </Button>
            )}

            {isReturnable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReturnDialogOpen(true)}
                className="gap-1.5 text-xs text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/30"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Return Order</span>
              </Button>
            )}
          </div>
        </div>

        {/* Order Status & Progress Card */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-150 pb-5 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                Fulfillment Progress
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white capitalize">
                  {order.status === 'cancelled'
                    ? 'Order Cancelled'
                    : order.fulfillmentStatus === 'return_requested'
                    ? 'Return Authorization Initiated'
                    : order.status}
                </h3>
                <Badge
                  variant={
                    order.status === 'delivered'
                      ? 'success'
                      : order.status === 'cancelled'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="capitalize text-[10px]"
                >
                  {order.status}
                </Badge>
              </div>
            </div>

            {order.estimatedDeliveryDate && order.status !== 'cancelled' && (
              <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3.5 py-2 dark:bg-neutral-800/60 text-xs">
                <Calendar className="h-4 w-4 text-neutral-500" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">
                    Estimated Delivery
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatDate(order.estimatedDeliveryDate)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Bar (only if not cancelled) */}
          {order.status !== 'cancelled' ? (
            <div className="pt-2">
              <div className="grid grid-cols-4 gap-2 relative">
                {timelineStages.map((stage, idx) => (
                  <div key={stage.key} className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        stage.completed
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                          : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                      }`}
                    >
                      {stage.completed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-medium ${
                        stage.completed
                          ? 'text-neutral-900 dark:text-white'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
              This order was cancelled on {formatDate(order.updatedAt)}. A full refund of{' '}
              {formatCurrency(order.total)} has been issued to your original payment method.
            </div>
          )}

          {/* Carrier Tracking Banner */}
          {order.trackingNumber && order.status !== 'cancelled' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-150 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850/50 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200/80 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-950 dark:text-white">
                    Carrier: {order.carrier || 'FedEx Carbon-Neutral Ground'}
                  </p>
                  <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                    Tracking ID: {order.trackingNumber}
                  </p>
                </div>
              </div>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(order.trackingNumber)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:underline dark:text-white self-start sm:self-auto"
              >
                <span>Live Carrier Tracker</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Product Items Table */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <h3 className="text-base font-bold text-neutral-950 dark:text-white">
            Order Items ({order.items.length})
          </h3>

          <div className="divide-y divide-neutral-150 dark:divide-neutral-800">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
                  />
                  <div>
                    <button
                      onClick={() => {
                        dispatch(viewProductDetail(item.productId));
                      }}
                      className="text-xs font-bold text-neutral-950 hover:underline dark:text-white text-left line-clamp-1"
                    >
                      {item.productName}
                    </button>
                    {item.selectedColor && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Finish / Color: {item.selectedColor}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Item SKU: AUR-{item.productId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                  <div className="text-right sm:text-center">
                    <span className="text-[10px] text-neutral-400 block sm:hidden">Price</span>
                    <span className="text-neutral-600 dark:text-neutral-300">
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  <div className="text-right sm:text-center">
                    <span className="text-[10px] text-neutral-400 block sm:hidden">Qty</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      × {item.quantity}
                    </span>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-[10px] text-neutral-400 block sm:hidden">Subtotal</span>
                    <span className="font-bold text-neutral-950 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Addresses & Financial Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shipping Address */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-neutral-950 dark:text-white">
                Shipping Address
              </h4>
            </div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {order.shippingAddress.street} {order.shippingAddress.apartment || ''}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {order.shippingAddress.country}
            </p>
            <p className="text-neutral-400 pt-1">{order.shippingAddress.phone}</p>
          </div>

          {/* Billing Address */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-neutral-950 dark:text-white">
                Billing Address
              </h4>
            </div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {order.billingAddress.fullName}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {order.billingAddress.street} {order.billingAddress.apartment || ''}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {order.billingAddress.country}
            </p>
            <p className="text-neutral-400 pt-1">{order.billingAddress.phone}</p>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3 text-xs">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-neutral-950 dark:text-white">
                Payment Summary
              </h4>
            </div>

            <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>
                    Discount {order.couponApplied ? `(${order.couponApplied.code})` : ''}
                  </span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({order.shippingMethod?.name || 'Standard'})</span>
                <span>
                  {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>

              <div className="border-t border-neutral-150 pt-2.5 dark:border-neutral-800 flex justify-between font-bold text-sm text-neutral-950 dark:text-white">
                <span>Total Paid</span>
                <span>{formatCurrency(order.total)}</span>
              </div>

              <div className="pt-2 text-[11px] text-neutral-400">
                <span>Method: </span>
                {order.paymentMethod.type === 'card' && (
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    {order.paymentMethod.brand || 'Card'} ending in {order.paymentMethod.last4 || '••••'}
                  </span>
                )}
                {order.paymentMethod.type === 'apple_pay' && (
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    Apple Pay Express
                  </span>
                )}
                {order.paymentMethod.type === 'google_pay' && (
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    Google Pay
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Modal Dialog */}
        <Dialog
          open={isInvoiceOpen}
          onOpenChange={(open) => setIsInvoiceOpen(open)}
          title={`Official Invoice #${orderRef}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-neutral-900 dark:text-neutral-100 p-2">
            {/* Invoice Printable Header */}
            <div className="flex justify-between items-start border-b border-neutral-200 pb-5 dark:border-neutral-800">
              <div>
                <span className="text-xl font-bold tracking-widest uppercase">AURA STUDIO</span>
                <p className="text-xs text-neutral-500 mt-1">Refined Minimalist Lifestyle Goods</p>
                <p className="text-xs text-neutral-400">tax-id: US-94810294-AURA</p>
              </div>
              <div className="text-right text-xs">
                <span className="font-mono font-bold text-sm block">{orderRef}</span>
                <span className="text-neutral-500 block">Date: {formatDate(order.createdAt)}</span>
                <Badge variant="outline" className="mt-1 border-emerald-400 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-[10px]">
                  PAID IN FULL
                </Badge>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-neutral-400 uppercase text-[10px] block mb-1">
                  Billed To
                </span>
                <p className="font-semibold">{order.billingAddress.fullName}</p>
                <p>{order.billingAddress.street} {order.billingAddress.apartment || ''}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.country}</p>
              </div>

              <div>
                <span className="font-bold text-neutral-400 uppercase text-[10px] block mb-1">
                  Shipped To
                </span>
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street} {order.shippingAddress.apartment || ''}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150 dark:divide-neutral-800">
                  {order.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium">
                        {it.productName} {it.selectedColor ? `(${it.selectedColor})` : ''}
                      </td>
                      <td className="p-3 text-center">{it.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(it.price)}</td>
                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(it.price * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Math */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping:</span>
                  <span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Sales Tax:</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-sm text-neutral-950 dark:text-white">
                  <span>Total Invoiced:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInvoiceOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={handlePrintInvoice}
                className="gap-1.5 text-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print or Save PDF</span>
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog
          open={isCancelDialogOpen}
          onOpenChange={(open) => setIsCancelDialogOpen(open)}
          title="Cancel Order Confirmation"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you wish to cancel order <span className="font-mono font-bold text-neutral-900 dark:text-white">{orderRef}</span>?
              Your payment will be immediately refunded in full.
            </p>

            <div>
              <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="Changed mind or bought by mistake">Changed mind or bought by mistake</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Need to change shipping destination">Need to change shipping destination</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelDialogOpen(false)}
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isCancelling}
                onClick={handleCancelOrder}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Return Order Dialog */}
        <Dialog
          open={isReturnDialogOpen}
          onOpenChange={(open) => setIsReturnDialogOpen(open)}
          title="Request Order Return"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-600 dark:text-neutral-400">
              We offer a 30-day trial guarantee. Please let us know the reason for returning your item(s):
            </p>

            <div>
              <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                Reason for return:
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="Item not as expected / size issue">Item not as expected / size issue</option>
                <option value="Defective or damaged during transit">Defective or damaged during transit</option>
                <option value="Received incorrect color/item">Received incorrect color/item</option>
                <option value="No longer needed">No longer needed</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                Additional Notes (Optional):
              </label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                rows={3}
                placeholder="Share any details to assist our quality team..."
                className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReturnDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isReturning}
                onClick={handleReturnOrder}
              >
                {isReturning ? 'Submitting...' : 'Submit Return Authorization'}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AccountLayout>
  );
}

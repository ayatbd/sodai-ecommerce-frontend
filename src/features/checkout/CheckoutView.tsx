import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setCheckoutStep,
  setShippingAddress,
  setPaymentMethod,
  setLastOrder,
  resetCheckout,
  CheckoutStep,
} from '../../store/slices/checkoutSlice';
import { clearCart, setShippingMethod } from '../../store/slices/cartSlice';
import { setCurrentView, addToast } from '../../store/slices/uiSlice';
import {
  useGetAddressesQuery,
  useGetShippingMethodsQuery,
  useCreateOrderMutation,
  useProcessPaymentMutation,
} from '../../services/api';
import { calculateCart } from '../../utils/cartCalculations';
import { Address, Order, ShippingMethod } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Check,
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  PackageCheck,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State or province is required'),
  postalCode: z.string().min(4, 'Postal or ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(8, 'Phone number is required for delivery notifications'),
});

const stripeCardSchema = z.object({
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  cardNumber: z.string().regex(/^[\d\s]{16,19}$/, 'Enter a valid 16-digit card number'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Format MM/YY'),
  cvc: z.string().regex(/^\d{3,4}$/, '3 or 4 digits'),
  zipCode: z.string().min(4, 'Billing ZIP code required'),
});

type ShippingFormValues = z.infer<typeof shippingAddressSchema>;
type StripeCardValues = z.infer<typeof stripeCardSchema>;

export function CheckoutView() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const appliedCoupon = useAppSelector((state) => state.cart.appliedCoupon);
  const selectedShippingMethod = useAppSelector((state) => state.cart.shippingMethod);

  const step = useAppSelector((state) => state.checkout.step);
  const shippingAddress = useAppSelector((state) => state.checkout.shippingAddress);
  const paymentMethod = useAppSelector((state) => state.checkout.paymentMethod);
  const lastOrder = useAppSelector((state) => state.checkout.lastOrder);

  const { data: savedAddresses = [] } = useGetAddressesQuery();
  const { data: shippingMethods = [] } = useGetShippingMethodsQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [processPayment, { isLoading: isProcessingPayment }] = useProcessPaymentMutation();

  const calculations = calculateCart(cartItems, appliedCoupon, selectedShippingMethod);

  // Address Form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { errors: addressErrors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: shippingAddress
      ? {
          fullName: shippingAddress.fullName,
          street: shippingAddress.street,
          apartment: shippingAddress.apartment || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        }
      : {
          fullName: 'Alex Rivera',
          street: '742 Evergreen Terrace',
          apartment: 'Loft 4B',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'United States',
          phone: '+1 (415) 882-9011',
        },
  });

  // Stripe Card Elements Form
  const {
    register: registerCard,
    handleSubmit: handleCardSubmit,
    setValue: setCardValue,
    watch: watchCard,
    formState: { errors: cardErrors },
  } = useForm<StripeCardValues>({
    resolver: zodResolver(stripeCardSchema),
    defaultValues: {
      cardholderName: 'Alex Rivera',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '123',
      zipCode: '94107',
    },
  });

  const cardNumberValue = watchCard('cardNumber') || '';

  // Auto-format card number as 4-4-4-4
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardValue('cardNumber', formatted, { shouldValidate: true });
  };

  const onSelectSavedAddress = (addr: Address) => {
    dispatch(setShippingAddress(addr));
    resetAddressForm({
      fullName: addr.fullName,
      street: addr.street,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
    });
  };

  const onShippingSubmit = (data: ShippingFormValues) => {
    const addressObj: Address = {
      id: shippingAddress?.id || `addr-${Date.now()}`,
      userId: 'usr-default-1',
      ...data,
      isDefaultShipping: true,
      isDefaultBilling: true,
    };
    dispatch(setShippingAddress(addressObj));
    dispatch(setCheckoutStep('payment'));
  };

  const onPayWithStripe = async (cardData: StripeCardValues) => {
    if (!shippingAddress) {
      dispatch(
        addToast({
          title: 'Missing Address',
          description: 'Please specify your shipping destination first.',
          type: 'destructive',
        })
      );
      dispatch(setCheckoutStep('shipping'));
      return;
    }

    try {
      // 1. Process Stripe payment intent simulation
      await processPayment({
        amount: calculations.total,
        paymentMethodId: `pm_card_${cardData.cardNumber.slice(-4)}`,
      }).unwrap();

      // 2. Create authoritative order in RTK Query store
      const order = await createOrder({
        userId: 'usr-default-1',
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0],
          price: item.product.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
        })),
        shippingAddress,
        billingAddress: shippingAddress,
        shippingMethod: selectedShippingMethod,
        paymentMethod: {
          type: 'card',
          brand: 'Visa',
          last4: cardData.cardNumber.replace(/\s/g, '').slice(-4) || '4242',
        },
        subtotal: calculations.subtotal,
        discount: calculations.discount,
        tax: calculations.tax,
        shippingCost: calculations.shipping,
        total: calculations.total,
        couponApplied: appliedCoupon || undefined,
      }).unwrap();

      // 3. Clear cart and set confirmation state
      dispatch(clearCart());
      dispatch(setLastOrder(order));
      dispatch(
        addToast({
          title: 'Payment Successful',
          description: `Order ${order.id} confirmed. Check confirmation receipt.`,
          type: 'success',
        })
      );
    } catch {
      dispatch(
        addToast({
          title: 'Payment Processing Failed',
          description: 'Could not complete authorization. Please try again.',
          type: 'destructive',
        })
      );
    }
  };

  // EMPTY STATE (If user navigates to checkout without items and hasn't just completed an order)
  if (cartItems.length === 0 && step !== 'confirmation') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-950 dark:text-white">
          Your bag is empty
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          There are currently no items queued for checkout. Browse our design catalog to begin.
        </p>
        <Button
          onClick={() => dispatch(setCurrentView('shop'))}
          className="mt-6"
        >
          Return to Studio Shop
        </Button>
      </div>
    );
  }

  // STEP 4: CONFIRMATION RECEIPT
  if (step === 'confirmation' && lastOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
          {/* Header Banner */}
          <div className="bg-neutral-900 px-6 py-8 text-white dark:bg-neutral-950 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
              <PackageCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Order Confirmed</h2>
            <p className="text-xs text-neutral-400 font-mono">
              Receipt Reference: <span className="text-white font-bold">{lastOrder.id}</span>
            </p>
            <p className="text-xs text-neutral-300">
              A carbon-neutral confirmation receipt has been dispatched to your email.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Tracking Status */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Carrier Tracking ID: {lastOrder.trackingNumber}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Service: {lastOrder.shippingMethod.name} ({lastOrder.shippingMethod.estimatedDays})
                  </p>
                </div>
              </div>
              <Badge variant="success">Fulfillment: Processing</Badge>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Purchased Artifacts
              </h4>
              <div className="divide-y divide-neutral-150 dark:divide-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Financial Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 space-y-1.5 text-xs">
                <h5 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Delivery Destination
                </h5>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{lastOrder.shippingAddress.fullName}</p>
                <p className="text-neutral-500">{lastOrder.shippingAddress.street} {lastOrder.shippingAddress.apartment || ''}</p>
                <p className="text-neutral-500">
                  {lastOrder.shippingAddress.city}, {lastOrder.shippingAddress.state} {lastOrder.shippingAddress.postalCode}
                </p>
                <p className="text-neutral-500">{lastOrder.shippingAddress.phone}</p>
              </div>

              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 space-y-2 text-xs">
                <h5 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Payment Summary (Stripe)
                </h5>
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(lastOrder.subtotal)}</span>
                </div>
                {lastOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(lastOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  <span>{lastOrder.shippingCost === 0 ? 'Free' : formatCurrency(lastOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Sales Tax</span>
                  <span>{formatCurrency(lastOrder.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-sm text-neutral-950 dark:text-white">
                  <span>Total Billed</span>
                  <span>{formatCurrency(lastOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-150 dark:border-neutral-800">
              <Button
                variant="outline"
                onClick={() => {
                  dispatch(resetCheckout());
                  dispatch(setCurrentView('orders'));
                }}
              >
                View in Order History
              </Button>
              <Button
                onClick={() => {
                  dispatch(resetCheckout());
                  dispatch(setCurrentView('shop'));
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE CHECKOUT FLOW
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button & Step Navigation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => dispatch(setCurrentView('shop'))}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <button
            onClick={() => dispatch(setCheckoutStep('shipping'))}
            className={`flex items-center gap-1.5 font-medium ${
              step === 'shipping'
                ? 'text-neutral-950 font-bold dark:text-white'
                : 'text-neutral-400'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              step === 'shipping' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-200 text-neutral-600'
            }`}>
              1
            </span>
            <span>Shipping</span>
          </button>

          <span className="h-[1px] w-6 bg-neutral-200 dark:bg-neutral-800" />

          <button
            onClick={() => shippingAddress && dispatch(setCheckoutStep('payment'))}
            className={`flex items-center gap-1.5 font-medium ${
              step === 'payment'
                ? 'text-neutral-950 font-bold dark:text-white'
                : 'text-neutral-400'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              step === 'payment' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-200 text-neutral-600'
            }`}>
              2
            </span>
            <span>Payment (Stripe)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout Forms */}
        <div className="lg:col-span-7 space-y-6">
          {step === 'shipping' && (
            <div className="space-y-6">
              {/* Saved addresses selector */}
              {savedAddresses.length > 0 && (
                <div className="rounded-xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Saved Address Book
                    </h4>
                    <span className="text-[11px] text-neutral-400">Click to autofill</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr) => (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => onSelectSavedAddress(addr)}
                        className={`text-left p-3 rounded-lg border text-xs transition-all ${
                          shippingAddress?.street === addr.street
                            ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 dark:border-white dark:bg-neutral-800'
                            : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <p className="font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                          <span>{addr.fullName}</span>
                          {shippingAddress?.street === addr.street && (
                            <Check className="h-3 w-3 text-neutral-900 dark:text-white" />
                          )}
                        </p>
                        <p className="text-neutral-500 text-[11px] truncate">{addr.street}</p>
                        <p className="text-neutral-400 text-[10px]">{addr.city}, {addr.state} {addr.postalCode}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Destination Form */}
              <form
                onSubmit={handleAddressSubmit(onShippingSubmit)}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4"
              >
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  <span>Shipping Address</span>
                </h3>

                <Input
                  label="Recipient Full Name"
                  {...registerAddress('fullName')}
                  error={addressErrors.fullName?.message}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Street Address"
                      placeholder="e.g. 742 Evergreen Terrace"
                      {...registerAddress('street')}
                      error={addressErrors.street?.message}
                    />
                  </div>
                  <div>
                    <Input
                      label="Apt / Suite"
                      placeholder="e.g. Apt 4B"
                      {...registerAddress('apartment')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <Input
                      label="City"
                      {...registerAddress('city')}
                      error={addressErrors.city?.message}
                    />
                  </div>
                  <div>
                    <Input
                      label="State / Province"
                      {...registerAddress('state')}
                      error={addressErrors.state?.message}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      label="Postal / ZIP Code"
                      {...registerAddress('postalCode')}
                      error={addressErrors.postalCode?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Country"
                    {...registerAddress('country')}
                    error={addressErrors.country?.message}
                  />
                  <Input
                    label="Phone for Delivery Updates"
                    placeholder="+1 (555) 019-2834"
                    {...registerAddress('phone')}
                    error={addressErrors.phone?.message}
                  />
                </div>

                {/* Delivery Method Selector */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Select Shipping Speed
                  </label>
                  <div className="space-y-2">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                          selectedShippingMethod.id === method.id
                            ? 'border-neutral-900 bg-neutral-50/80 ring-1 ring-neutral-900 dark:border-white dark:bg-neutral-800'
                            : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={selectedShippingMethod.id === method.id}
                            onChange={() => dispatch(setShippingMethod(method))}
                            className="text-neutral-900"
                          />
                          <div>
                            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                              {method.name}
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {method.description} • {method.estimatedDays}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4 gap-2" size="lg">
                  <span>Continue to Payment</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Express 1-click Pay Simulation */}
              <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Express Checkout
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onPayWithStripe({
                        cardholderName: 'Alex Rivera',
                        cardNumber: '4242 4242 4242 4242',
                        expiry: '12/28',
                        cvc: '123',
                        zipCode: '94107',
                      })
                    }
                    className="flex h-11 items-center justify-center rounded-lg bg-black text-white hover:bg-neutral-800 font-semibold text-sm transition-all"
                  >
                     Pay
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onPayWithStripe({
                        cardholderName: 'Alex Rivera',
                        cardNumber: '4242 4242 4242 4242',
                        expiry: '12/28',
                        cvc: '123',
                        zipCode: '94107',
                      })
                    }
                    className="flex h-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 font-semibold text-sm transition-all dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                  >
                    G Pay
                  </button>
                </div>
              </div>

              {/* Stripe Elements Styled Card Form */}
              <form
                onSubmit={handleCardSubmit(onPayWithStripe)}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      Credit or Debit Card
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    <span>Stripe Secured</span>
                  </div>
                </div>

                <Input
                  label="Name on Card"
                  placeholder="Alex Rivera"
                  {...registerCard('cardholderName')}
                  error={cardErrors.cardholderName?.message}
                />

                {/* Stripe Elements styled input box */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">
                    Card Information
                  </label>
                  <div className="rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 space-y-3">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardNumberValue}
                        onChange={handleCardNumberChange}
                        className="w-full text-sm font-mono tracking-wider text-neutral-900 dark:text-white bg-transparent outline-none placeholder:text-neutral-400"
                      />
                      <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                        {cardNumberValue.startsWith('4') ? (
                          <span className="text-blue-600 font-bold">VISA</span>
                        ) : cardNumberValue.startsWith('5') ? (
                          <span className="text-orange-500 font-bold">MC</span>
                        ) : cardNumberValue.startsWith('3') ? (
                          <span className="text-emerald-500 font-bold">AMEX</span>
                        ) : (
                          <span>CARD</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-150 dark:border-neutral-800">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={5}
                        {...registerCard('expiry')}
                        className="w-full text-xs font-mono text-neutral-900 dark:text-white bg-transparent outline-none placeholder:text-neutral-400"
                      />
                      <input
                        type="password"
                        placeholder="CVC"
                        maxLength={4}
                        {...registerCard('cvc')}
                        className="w-full text-xs font-mono text-neutral-900 dark:text-white bg-transparent outline-none placeholder:text-neutral-400 text-right"
                      />
                    </div>
                  </div>
                  {(cardErrors.cardNumber || cardErrors.expiry || cardErrors.cvc) && (
                    <p className="text-xs text-red-600">
                      {cardErrors.cardNumber?.message ||
                        cardErrors.expiry?.message ||
                        cardErrors.cvc?.message}
                    </p>
                  )}
                </div>

                <Input
                  label="Billing Postal / ZIP Code"
                  placeholder="94107"
                  {...registerCard('zipCode')}
                  error={cardErrors.zipCode?.message}
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => dispatch(setCheckoutStep('shipping'))}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Edit Shipping Address</span>
                  </button>

                  <Button
                    type="submit"
                    isLoading={isCreatingOrder || isProcessingPayment}
                    size="lg"
                    className="gap-2 px-8"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay {formatCurrency(calculations.total)}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Order Summary ({calculations.itemCount} items)
            </h3>

            {/* Item list preview */}
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-150 dark:divide-neutral-800 pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.product.images[0]}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-md object-cover bg-neutral-100 dark:bg-neutral-800"
                    />
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div className="border-t border-neutral-150 pt-3 dark:border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Subtotal</span>
                <span>{formatCurrency(calculations.subtotal)}</span>
              </div>

              {calculations.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(calculations.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Shipping ({selectedShippingMethod.name})</span>
                <span>
                  {calculations.shipping === 0 ? (
                    <span className="text-emerald-600 font-semibold">Free</span>
                  ) : (
                    formatCurrency(calculations.shipping)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Estimated Tax</span>
                <span>{formatCurrency(calculations.tax)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700 text-base font-bold text-neutral-950 dark:text-white">
                <span>Total Due</span>
                <span>{formatCurrency(calculations.total)}</span>
              </div>
            </div>

            {/* Guarantee badge */}
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/60 flex items-center gap-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-neutral-600 dark:text-neutral-300 shrink-0" />
              <span>30-day studio trial with complimentary carbon-neutral returns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

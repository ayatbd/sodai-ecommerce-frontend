import React, { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripePromise } from '../../lib/stripe';
import {
  useGetPaymentIntentQuery,
  useCancelPaymentIntentMutation,
  useConfirmTestPaymentMutation,
} from '../../services/paymentApi';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import {
  Lock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface StripePaymentFormProps {
  paymentIntentId: string;
  clientSecret: string;
  amount: number; // in dollars
  isSimulated?: boolean;
  customerEmail?: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

// Inner form when actual Stripe Elements is active
function LiveStripeForm({
  paymentIntentId,
  amount,
  onSuccess,
  onCancel,
}: {
  paymentIntentId: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [cancelPaymentIntent, { isLoading: isCanceling }] = useCancelPaymentIntentMutation();
  const { data: intentData, refetch: refetchIntent } = useGetPaymentIntentQuery(paymentIntentId, {
    pollingInterval: 4000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?payment_intent=${paymentIntentId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred with your card.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsProcessing(false);
      onSuccess(paymentIntent.id);
    } else {
      setIsProcessing(false);
      onSuccess(paymentIntentId);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelPaymentIntent(paymentIntentId).unwrap();
      onCancel();
    } catch (err) {
      console.error('Failed to cancel payment intent:', err);
      onCancel();
    }
  };

  const currentStatus = intentData?.paymentIntent?.status || 'requires_payment_method';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Live Payment Intent Status Header */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-neutral-500" />
          <span className="font-mono text-neutral-600 dark:text-neutral-300">
            ID: {paymentIntentId.slice(0, 16)}...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {currentStatus.replace(/_/g, ' ')}
          </span>
          <button
            type="button"
            onClick={() => refetchIntent()}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            title="Refresh intent status"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          disabled={!stripe || isProcessing || isCanceling}
          className="flex-1 gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Authorizing with Stripe...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Authorize & Pay {formatCurrency(amount)}</span>
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing || isCanceling}
          className="text-neutral-600 dark:text-neutral-300 hover:text-red-600 hover:border-red-200"
          size="lg"
        >
          {isCanceling ? (
            <span>Canceling...</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4" />
              Cancel Payment
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

// Interactive Test-Mode Payment Element (for testing test-mode PaymentIntents seamlessly)
function SimulatedStripeForm({
  paymentIntentId,
  amount,
  onSuccess,
  onCancel,
}: {
  paymentIntentId: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}) {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [postalCode, setPostalCode] = useState('94107');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cancelPaymentIntent, { isLoading: isCanceling }] = useCancelPaymentIntentMutation();
  const [confirmTestPayment] = useConfirmTestPaymentMutation();
  const { data: intentData, refetch } = useGetPaymentIntentQuery(paymentIntentId);

  const currentStatus = intentData?.paymentIntent?.status || 'requires_payment_method';

  const handleTestCardFill = (type: 'success' | 'declined' | '3ds') => {
    setError(null);
    if (type === 'success') {
      setCardNumber('4242 4242 4242 4242');
      setCvc('123');
    } else if (type === 'declined') {
      setCardNumber('4000 0000 0000 0002');
      setCvc('123');
    } else {
      setCardNumber('4000 0000 0000 3155');
      setCvc('123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Simulate standard Stripe card validation
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length !== 16) {
      setError('Please enter a valid 16-digit card number.');
      setIsProcessing(false);
      return;
    }

    if (cleanNum === '4000000000000002') {
      setTimeout(() => {
        setError('Your card was declined. Your card has insufficient funds (Stripe test decline).');
        setIsProcessing(false);
      }, 1000);
      return;
    }

    try {
      await confirmTestPayment({
        paymentIntentId,
        paymentMethodId: `pm_card_${cleanNum.slice(-4)}`,
      }).unwrap();

      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(paymentIntentId);
      }, 1200);
    } catch (err) {
      setIsProcessing(false);
      setError((err as Error).message || 'Failed to complete payment authorization');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelPaymentIntent(paymentIntentId).unwrap();
      onCancel();
    } catch {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Live Payment Intent Status */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-neutral-500" />
          <span className="font-mono text-neutral-600 dark:text-neutral-300">
            {paymentIntentId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {currentStatus.replace(/_/g, ' ')}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            title="Refresh intent"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Stripe Payment Element Styled Container */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Credit or Debit Card
            </h4>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium">Stripe Test Mode</span>
          </div>
        </div>

        {/* Quick test card helpers */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-[11px] font-medium text-neutral-500">Test Cards:</span>
          <button
            type="button"
            onClick={() => handleTestCardFill('success')}
            className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono hover:bg-emerald-100 transition-colors"
          >
            ✓ Success (4242)
          </button>
          <button
            type="button"
            onClick={() => handleTestCardFill('declined')}
            className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono hover:bg-amber-100 transition-colors"
          >
            ✕ Decline (4000)
          </button>
          <button
            type="button"
            onClick={() => handleTestCardFill('3ds')}
            className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono hover:bg-blue-100 transition-colors"
          >
            ⟳ 3DS Authentication
          </button>
        </div>

        {/* Card Number Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Card Number
          </label>
          <div className="relative flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 px-3 py-2.5 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 dark:focus-within:border-white">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              className="w-full text-sm font-mono text-neutral-900 dark:text-white bg-transparent outline-none"
            />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
              {cardNumber.startsWith('4') ? 'VISA' : 'MC'}
            </span>
          </div>
        </div>

        {/* Expiry & CVC & Zip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Expires
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              CVC
            </label>
            <input
              type="password"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              ZIP
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="94107"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          disabled={isProcessing || isCanceling}
          className="flex-1 gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Confirming with Stripe...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Authorize & Pay {formatCurrency(amount)}</span>
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing || isCanceling}
          className="text-neutral-600 dark:text-neutral-300 hover:text-red-600 hover:border-red-200"
          size="lg"
        >
          {isCanceling ? (
            <span>Canceling...</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4" />
              Cancel Payment
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export function StripePaymentElement({
  paymentIntentId,
  clientSecret,
  amount,
  isSimulated = false,
  customerEmail,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) {
  const [stripeInstance, setStripeInstance] = useState<any>(null);

  useEffect(() => {
    getStripePromise().then((s) => {
      setStripeInstance(s);
    });
  }, []);

  const canUseLiveElements = Boolean(
    stripeInstance && clientSecret && !isSimulated && !clientSecret.startsWith('pi_test_')
  );

  return (
    <div className="space-y-4">
      {canUseLiveElements ? (
        <Elements
          stripe={stripeInstance}
          options={{
            clientSecret,
            appearance: {
              theme: 'flat',
              variables: {
                colorPrimary: '#171717',
                colorBackground: '#ffffff',
                colorText: '#171717',
                colorDanger: '#ef4444',
                borderRadius: '8px',
              },
            },
          }}
        >
          <LiveStripeForm
            paymentIntentId={paymentIntentId}
            amount={amount}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      ) : (
        <SimulatedStripeForm
          paymentIntentId={paymentIntentId}
          amount={amount}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

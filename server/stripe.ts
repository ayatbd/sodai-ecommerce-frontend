import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_placeholder') || key === 'sk_test_...') {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: '2025-02-24.acacia' as any,
      typescript: true,
    });
  }

  return stripeClient;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && !key.startsWith('sk_test_placeholder') && key !== 'sk_test_...');
}

// In-memory test store for PaymentIntents when running in local sandbox test mode
interface SimulatedPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata?: Record<string, any>;
  receipt_email?: string;
  created: number;
  canceled_at?: number;
}

const simulatedStore = new Map<string, SimulatedPaymentIntent>();

export const StripeService = {
  async createPaymentIntent(params: {
    amount: number; // in cents
    currency?: string;
    metadata?: Record<string, any>;
    receipt_email?: string;
    description?: string;
  }) {
    const currency = (params.currency || 'usd').toLowerCase();
    const stripe = getStripe();

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(params.amount),
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: params.metadata || {},
        receipt_email: params.receipt_email,
        description: params.description || 'AURA Design Store Purchase',
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
        isSimulated: false,
      };
    }

    // Realistic Stripe Test-Mode Simulator
    const randomHex = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
    const id = `pi_test_${randomHex}`;
    const clientSecret = `${id}_secret_${Math.random().toString(36).substring(2, 18)}`;

    const simulatedIntent: SimulatedPaymentIntent = {
      id,
      amount: Math.round(params.amount),
      currency,
      status: 'requires_payment_method',
      client_secret: clientSecret,
      metadata: params.metadata,
      receipt_email: params.receipt_email,
      created: Math.floor(Date.now() / 1000),
    };

    simulatedStore.set(id, simulatedIntent);

    return {
      id: simulatedIntent.id,
      amount: simulatedIntent.amount,
      currency: simulatedIntent.currency,
      status: simulatedIntent.status,
      clientSecret: simulatedIntent.client_secret,
      metadata: simulatedIntent.metadata,
      isSimulated: true,
    };
  },

  async retrievePaymentIntent(paymentIntentId: string) {
    const stripe = getStripe();

    if (stripe) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        clientSecret: intent.client_secret,
        metadata: intent.metadata,
        created: intent.created,
        isSimulated: false,
      };
    }

    const simulated = simulatedStore.get(paymentIntentId);
    if (!simulated) {
      return null;
    }

    return {
      id: simulated.id,
      amount: simulated.amount,
      currency: simulated.currency,
      status: simulated.status,
      clientSecret: simulated.client_secret,
      metadata: simulated.metadata,
      created: simulated.created,
      isSimulated: true,
    };
  },

  async cancelPaymentIntent(paymentIntentId: string) {
    const stripe = getStripe();

    if (stripe) {
      const intent = await stripe.paymentIntents.cancel(paymentIntentId);
      return {
        id: intent.id,
        status: intent.status,
        isSimulated: false,
      };
    }

    const simulated = simulatedStore.get(paymentIntentId);
    if (simulated) {
      simulated.status = 'canceled';
      simulated.canceled_at = Math.floor(Date.now() / 1000);
      simulatedStore.set(paymentIntentId, simulated);
      return {
        id: simulated.id,
        status: 'canceled',
        isSimulated: true,
      };
    }

    return {
      id: paymentIntentId,
      status: 'canceled',
      isSimulated: true,
    };
  },

  async confirmSimulatedPayment(paymentIntentId: string) {
    const simulated = simulatedStore.get(paymentIntentId);
    if (simulated) {
      simulated.status = 'succeeded';
      simulatedStore.set(paymentIntentId, simulated);
      return simulated;
    }
    return null;
  }
};

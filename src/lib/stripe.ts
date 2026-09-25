import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripePromise = (publishableKey?: string): Promise<Stripe | null> => {
  const key =
    publishableKey ||
    (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_TYooMQauvdEDq54NiTphI7jx'; // Stripe official public test key for testing

  if (!stripePromise) {
    try {
      stripePromise = loadStripe(key);
    } catch (e) {
      console.warn('[Stripe] Failed to load Stripe.js:', e);
      stripePromise = Promise.resolve(null);
    }
  }
  return stripePromise;
};

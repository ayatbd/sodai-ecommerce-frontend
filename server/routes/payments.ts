import { Router, Request, Response } from 'express';
import { StripeService, isStripeConfigured } from '../stripe';
import { PaymentRepository } from '../models/Payment';

export const paymentsRouter = Router();

/**
 * GET /api/v1/payments/config
 * Provides the public Stripe configuration for the frontend
 */
paymentsRouter.get('/config', (_req: Request, res: Response) => {
  const publishableKey =
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_sample_aura_checkout_mode';

  res.json({
    publishableKey,
    isTestMode: true,
    isStripeConfigured: isStripeConfigured(),
  });
});

/**
 * POST /api/v1/payments/create-payment-intent
 * Creates a Stripe PaymentIntent and registers it with the Mongoose Payment model
 */
paymentsRouter.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd', metadata = {}, receipt_email } = req.body;

    // Validate amount
    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount < 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Minimum amount is 50 cents ($0.50).',
      });
    }

    // 1. Create with Stripe Service (live or test mode simulator)
    const intent = await StripeService.createPaymentIntent({
      amount: parsedAmount,
      currency,
      metadata: {
        ...metadata,
        environment: 'test_mode',
      },
      receipt_email,
    });

    // 2. Persist with Mongoose Payment Model
    await PaymentRepository.create({
      paymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      clientSecret: intent.clientSecret || '',
      customerEmail: receipt_email,
      metadata: intent.metadata,
      paymentMethodType: 'card',
    });

    console.log(`[Stripe] Created PaymentIntent ${intent.id} for $${(intent.amount / 100).toFixed(2)} (${intent.currency})`);

    return res.status(201).json({
      success: true,
      clientSecret: intent.clientSecret,
      paymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      isTestMode: true,
      isSimulated: intent.isSimulated,
    });
  } catch (error) {
    console.error('[Stripe] Error creating PaymentIntent:', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to create payment intent',
    });
  }
});

/**
 * GET /api/v1/payments/:paymentIntentId
 * Retrieves payment intent details from Stripe and/or Mongoose Payment record
 */
paymentsRouter.get('/:paymentIntentId', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, error: 'paymentIntentId is required' });
    }

    // First check Stripe
    const stripeIntent = await StripeService.retrievePaymentIntent(paymentIntentId);

    // Also check Mongoose record
    const dbRecord = await PaymentRepository.findByPaymentIntentId(paymentIntentId);

    if (!stripeIntent && !dbRecord) {
      return res.status(404).json({
        success: false,
        error: `PaymentIntent ${paymentIntentId} not found`,
      });
    }

    const payload = {
      id: stripeIntent?.id || dbRecord?.paymentIntentId,
      amount: stripeIntent?.amount ?? dbRecord?.amount,
      currency: stripeIntent?.currency ?? dbRecord?.currency,
      status: stripeIntent?.status ?? dbRecord?.status,
      clientSecret: stripeIntent?.clientSecret ?? dbRecord?.clientSecret,
      metadata: stripeIntent?.metadata ?? dbRecord?.metadata,
      createdAt: dbRecord?.createdAt,
      customerEmail: dbRecord?.customerEmail,
    };

    return res.json({
      success: true,
      paymentIntent: payload,
    });
  } catch (error) {
    console.error(`[Stripe] Error retrieving PaymentIntent ${req.params.paymentIntentId}:`, error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to retrieve payment intent',
    });
  }
});

/**
 * POST /api/v1/payments/:paymentIntentId/cancel
 * Cancels a Stripe PaymentIntent and updates the Mongoose record
 */
paymentsRouter.post('/:paymentIntentId/cancel', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, error: 'paymentIntentId is required' });
    }

    // 1. Cancel in Stripe
    const canceledStripe = await StripeService.cancelPaymentIntent(paymentIntentId);

    // 2. Update Mongoose record
    await PaymentRepository.updateStatus(paymentIntentId, 'canceled');

    console.log(`[Stripe] Canceled PaymentIntent ${paymentIntentId}`);

    return res.json({
      success: true,
      paymentIntentId,
      status: canceledStripe?.status || 'canceled',
    });
  } catch (error) {
    console.error(`[Stripe] Error canceling PaymentIntent ${req.params.paymentIntentId}:`, error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to cancel payment intent',
    });
  }
});

/**
 * POST /api/v1/payments/:paymentIntentId/confirm-test
 * Dedicated endpoint for verifying simulated test payments
 */
paymentsRouter.post('/:paymentIntentId/confirm-test', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;
    const { paymentMethodId = 'pm_card_visa' } = req.body;

    await StripeService.confirmSimulatedPayment(paymentIntentId);
    await PaymentRepository.updateStatus(paymentIntentId, 'succeeded', {
      paymentMethodType: paymentMethodId,
      receiptUrl: `https://dashboard.stripe.com/test/payments/${paymentIntentId}`,
    });

    return res.json({
      success: true,
      paymentIntentId,
      status: 'succeeded',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to confirm test payment',
    });
  }
});

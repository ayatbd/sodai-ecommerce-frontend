import express, { Request, Response } from 'express';

export const couponsRouter = express.Router();

export interface ServerCoupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  description: string;
  expiresAt?: string;
  isPopular?: boolean;
}

const ACTIVE_COUPONS: ServerCoupon[] = [
  {
    code: 'AURA15',
    discountPercent: 15,
    minSpend: 100,
    description: '15% off any order over $100',
    isPopular: true,
  },
  {
    code: 'WELCOME25',
    discountAmount: 25,
    minSpend: 150,
    description: '$25 off orders above $150',
    isPopular: true,
  },
  {
    code: 'STUDIO20',
    discountPercent: 20,
    minSpend: 200,
    description: '20% off for studio members',
  },
];

/**
 * GET /api/v1/coupons
 * Returns active coupons for discovery
 */
couponsRouter.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    coupons: ACTIVE_COUPONS,
  });
});

/**
 * POST /api/v1/coupons/validate
 * Validates a coupon code against current subtotal
 */
couponsRouter.post('/validate', (req: Request, res: Response) => {
  const { code, subtotal = 0 } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code is required',
    });
  }

  const normalized = String(code).trim().toUpperCase();
  const coupon = ACTIVE_COUPONS.find((c) => c.code.toUpperCase() === normalized);

  if (!coupon) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired promo code',
    });
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return res.status(400).json({
      success: false,
      message: `Coupon ${coupon.code} requires a minimum order of $${coupon.minSpend}`,
    });
  }

  return res.status(200).json({
    success: true,
    coupon,
    message: `Coupon ${coupon.code} applied successfully!`,
  });
});

import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { validateCouponSchema, createCouponSchema, updateCouponSchema } from '../validators/coupon.validator.js';

const router = Router();

// Public coupon validation at checkout
router.post('/validate', validateBody(validateCouponSchema), CouponController.validate);

// Admin coupon management
router.get('/', authenticate, requireAdmin, CouponController.getCoupons);
router.post('/', authenticate, requireAdmin, validateBody(createCouponSchema), CouponController.createCoupon);
router.patch('/:id', authenticate, requireAdmin, validateBody(updateCouponSchema), CouponController.updateCoupon);
router.delete('/:id', authenticate, requireAdmin, CouponController.deleteCoupon);

export const couponRoutes = router;

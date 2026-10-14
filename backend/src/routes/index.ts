import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { productRoutes } from './product.routes.js';
import { categoryRoutes } from './category.routes.js';
import { orderRoutes } from './order.routes.js';
import { reviewRoutes } from './review.routes.js';
import { couponRoutes } from './coupon.routes.js';
import { adminRoutes } from './admin.routes.js';
import { ApiResponseView } from '../views/apiResponse.view.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  ApiResponseView.success(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'SODAI MVC Backend API',
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);

export const apiRouter = router;

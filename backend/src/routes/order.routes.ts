import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate, requireAdmin, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema, updateTrackingSchema } from '../validators/order.validator.js';

const router = Router();

// Order creation (supports both guest and authenticated users)
router.post('/checkout', optionalAuth, validateBody(createOrderSchema), OrderController.createOrder);

// Customer order retrieval
router.get('/my-orders', authenticate, OrderController.getMyOrders);
router.get('/:id', optionalAuth, OrderController.getOrderById);

// Admin order operations
router.get('/', authenticate, requireAdmin, OrderController.getAllOrders);
router.patch('/:id/status', authenticate, requireAdmin, validateBody(updateOrderStatusSchema), OrderController.updateOrderStatus);
router.patch('/:id/tracking', authenticate, requireAdmin, validateBody(updateTrackingSchema), OrderController.updateTracking);

export const orderRoutes = router;

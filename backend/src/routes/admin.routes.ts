import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// All admin routes require admin privileges
router.use(authenticate, requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/customers', AdminController.getCustomers);
router.patch('/customers/:id/status', AdminController.updateCustomerStatus);
router.get('/settings', AdminController.getSettings);
router.patch('/settings', AdminController.updateSettings);

export const adminRoutes = router;

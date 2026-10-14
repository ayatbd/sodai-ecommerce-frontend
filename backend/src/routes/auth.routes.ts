import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  addressSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), AuthController.resetPassword);

// Protected routes (require valid JWT)
router.get('/me', authenticate, AuthController.getMe);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), AuthController.updateProfile);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), AuthController.changePassword);
router.post('/addresses', authenticate, validateBody(addressSchema), AuthController.addAddress);
router.delete('/addresses/:addressId', authenticate, AuthController.deleteAddress);

export const authRoutes = router;

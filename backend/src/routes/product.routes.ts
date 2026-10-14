import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate, requireAdmin, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/product.validator.js';

const router = Router();

// Public routes with optional auth for admin previews
router.get('/', optionalAuth, validateQuery(productQuerySchema), ProductController.getProducts);
router.get('/featured', ProductController.getFeatured);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id', ProductController.getProductById);

// Admin restricted endpoints
router.post('/', authenticate, requireAdmin, validateBody(createProductSchema), ProductController.createProduct);
router.patch('/:id', authenticate, requireAdmin, validateBody(updateProductSchema), ProductController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, ProductController.deleteProduct);

export const productRoutes = router;

import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = Router();

// Public routes
router.get('/', CategoryController.getCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);

// Admin routes
router.post('/', authenticate, requireAdmin, validateBody(createCategorySchema), CategoryController.createCategory);
router.patch('/:id', authenticate, requireAdmin, validateBody(updateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, CategoryController.deleteCategory);

export const categoryRoutes = router;

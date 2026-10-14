import { Request, Response } from 'express';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ApiResponseView } from '../views/apiResponse.view.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator.js';

export class CategoryController {
  static async getCategories(_req: Request, res: Response): Promise<void> {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    ApiResponseView.success(res, categories.map((c) => c.toJSON()));
  }

  static async getCategoryBySlug(req: Request<{ slug: string }>, res: Response): Promise<void> {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      ApiResponseView.error(res, `Category not found: ${req.params.slug}`, 404);
      return;
    }

    ApiResponseView.success(res, category.toJSON());
  }

  static async createCategory(req: Request<{}, {}, CreateCategoryInput>, res: Response): Promise<void> {
    const existing = await Category.findOne({ slug: req.body.slug });
    if (existing) {
      ApiResponseView.error(res, 'A category with this slug already exists.', 409);
      return;
    }

    // Count existing products matching slug if any
    const productCount = await Product.countDocuments({ category: req.body.slug, published: true });

    const category = new Category({
      ...req.body,
      productCount,
    });

    await category.save();
    ApiResponseView.created(res, category.toJSON(), 'Category created successfully');
  }

  static async updateCategory(req: Request<{ id: string }, {}, UpdateCategoryInput>, res: Response): Promise<void> {
    const category = await Category.findById(req.params.id);
    if (!category) {
      ApiResponseView.error(res, 'Category not found', 404);
      return;
    }

    Object.assign(category, req.body);
    await category.save();

    ApiResponseView.success(res, category.toJSON(), 'Category updated successfully');
  }

  static async deleteCategory(req: Request<{ id: string }>, res: Response): Promise<void> {
    const category = await Category.findById(req.params.id);
    if (!category) {
      ApiResponseView.error(res, 'Category not found', 404);
      return;
    }

    const assignedProducts = await Product.countDocuments({ category: category.slug });
    if (assignedProducts > 0) {
      ApiResponseView.error(
        res,
        `Cannot delete category "${category.name}" because ${assignedProducts} products are assigned to it. Reassign products first.`,
        400
      );
      return;
    }

    await Category.findByIdAndDelete(req.params.id);
    ApiResponseView.success(res, { id: req.params.id }, 'Category deleted successfully');
  }
}

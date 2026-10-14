import { Request, Response } from 'express';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { ApiResponseView } from '../views/apiResponse.view.js';
import { CreateProductInput, UpdateProductInput, ProductQueryParams } from '../validators/product.validator.js';

export class ProductController {
  static async getProducts(req: Request, res: Response): Promise<void> {
    const queryParams = req.query as unknown as ProductQueryParams;
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 12;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Filter by published status
    if (queryParams.published === 'all' && req.user?.role === 'admin') {
      // Return all products for admin
    } else if (queryParams.published === 'false' && req.user?.role === 'admin') {
      query.published = false;
    } else {
      query.published = true;
    }

    // Category filter
    if (queryParams.category && queryParams.category !== 'all') {
      query.category = queryParams.category;
    }

    // Price range filter
    if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
      query.price = {};
      if (queryParams.minPrice !== undefined) (query.price as any).$gte = queryParams.minPrice;
      if (queryParams.maxPrice !== undefined) (query.price as any).$lte = queryParams.maxPrice;
    }

    // In stock filter
    if (queryParams.inStock !== undefined) {
      query.inStock = queryParams.inStock;
    }

    // Featured filter
    if (queryParams.isFeatured !== undefined) {
      query.isFeatured = queryParams.isFeatured;
    }

    // Text search filter
    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      query.$or = [{ name: searchRegex }, { tagline: searchRegex }, { tags: searchRegex }];
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    switch (queryParams.sort) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'featured':
      default:
        sortOptions = { isFeatured: -1, createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    ApiResponseView.paginated(
      res,
      products.map((p) => p.toJSON()),
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    );
  }

  static async getFeatured(_req: Request, res: Response): Promise<void> {
    const products = await Product.find({ published: true, isFeatured: true }).limit(8);
    ApiResponseView.success(res, products.map((p) => p.toJSON()));
  }

  static async getProductBySlug(req: Request<{ slug: string }>, res: Response): Promise<void> {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      ApiResponseView.error(res, `Product not found with slug: ${req.params.slug}`, 404);
      return;
    }

    ApiResponseView.success(res, product.toJSON());
  }

  static async getProductById(req: Request<{ id: string }>, res: Response): Promise<void> {
    const product = await Product.findById(req.params.id);
    if (!product) {
      ApiResponseView.error(res, `Product not found with ID: ${req.params.id}`, 404);
      return;
    }

    ApiResponseView.success(res, product.toJSON());
  }

  static async createProduct(req: Request<{}, {}, CreateProductInput>, res: Response): Promise<void> {
    const { name } = req.body;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await Product.findOne({ slug });
    if (existing) {
      ApiResponseView.error(res, 'A product with this generated slug already exists. Please choose a different title.', 409);
      return;
    }

    const product = new Product({
      ...req.body,
      slug,
      inStock: req.body.stockCount > 0,
    });

    await product.save();

    // Increment category product count
    await Category.updateOne({ slug: product.category }, { $inc: { productCount: 1 } });

    ApiResponseView.created(res, product.toJSON(), 'Product created successfully');
  }

  static async updateProduct(req: Request<{ id: string }, {}, UpdateProductInput>, res: Response): Promise<void> {
    const product = await Product.findById(req.params.id);
    if (!product) {
      ApiResponseView.error(res, 'Product not found', 404);
      return;
    }

    const oldCategory = product.category;

    Object.assign(product, req.body);
    if (req.body.stockCount !== undefined) {
      product.inStock = req.body.stockCount > 0;
    }

    await product.save();

    // If category changed, update category counts
    if (req.body.category && req.body.category !== oldCategory) {
      await Promise.all([
        Category.updateOne({ slug: oldCategory }, { $inc: { productCount: -1 } }),
        Category.updateOne({ slug: req.body.category }, { $inc: { productCount: 1 } }),
      ]);
    }

    ApiResponseView.success(res, product.toJSON(), 'Product updated successfully');
  }

  static async deleteProduct(req: Request<{ id: string }>, res: Response): Promise<void> {
    const product = await Product.findById(req.params.id);
    if (!product) {
      ApiResponseView.error(res, 'Product not found', 404);
      return;
    }

    await Product.findByIdAndDelete(req.params.id);
    await Category.updateOne({ slug: product.category }, { $inc: { productCount: -1 } });

    ApiResponseView.success(res, { id: req.params.id }, 'Product removed successfully');
  }
}

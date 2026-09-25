import express, { Request, Response } from 'express';
import { SERVER_PRODUCTS, ServerProduct } from '../data/products';

export const wishlistRouter = express.Router();

// Memory store of wishlists per user/session
const userWishlists = new Map<string, ServerProduct[]>();

// Seed default items for demo user
const DEFAULT_USER_ID = 'usr-alex-rivera';
userWishlists.set(DEFAULT_USER_ID, [SERVER_PRODUCTS[0], SERVER_PRODUCTS[3]]);

function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token.includes('alex') || token.includes('demo')) {
      return DEFAULT_USER_ID;
    }
    return `usr_${token.slice(0, 12)}`;
  }
  return DEFAULT_USER_ID;
}

/**
 * GET /api/v1/wishlist
 * Returns saved products for the authenticated user
 */
wishlistRouter.get('/', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const items = userWishlists.get(userId) || [];

    return res.status(200).json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error('[Wishlist API] GET error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist items',
    });
  }
});

/**
 * POST /api/v1/wishlist/:productId
 * Adds a product to the user's wishlist
 */
wishlistRouter.post('/:productId', (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = getUserId(req);
    let items = userWishlists.get(userId) || [];

    const existingIndex = items.findIndex((p) => p.id === productId);
    if (existingIndex > -1) {
      return res.status(200).json({
        success: true,
        message: 'Product already in wishlist',
        items,
        count: items.length,
      });
    }

    // Find product from server catalog or client body
    let productToAdd: ServerProduct | undefined = SERVER_PRODUCTS.find(
      (p) => p.id === productId
    );

    if (!productToAdd && req.body && req.body.id) {
      productToAdd = req.body as ServerProduct;
    }

    if (!productToAdd) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    items = [productToAdd, ...items];
    userWishlists.set(userId, items);

    return res.status(201).json({
      success: true,
      message: `${productToAdd.name} added to wishlist`,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error('[Wishlist API] POST error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
    });
  }
});

/**
 * DELETE /api/v1/wishlist/:productId
 * Removes a product from the user's wishlist
 */
wishlistRouter.delete('/:productId', (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = getUserId(req);
    let items = userWishlists.get(userId) || [];

    items = items.filter((p) => p.id !== productId);
    userWishlists.set(userId, items);

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      items,
      count: items.length,
    });
  } catch (error) {
    console.error('[Wishlist API] DELETE error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
    });
  }
});

/**
 * DELETE /api/v1/wishlist
 * Clears all items from the user's wishlist
 */
wishlistRouter.delete('/', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    userWishlists.set(userId, []);

    return res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      items: [],
      count: 0,
    });
  } catch (error) {
    console.error('[Wishlist API] DELETE all error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
    });
  }
});

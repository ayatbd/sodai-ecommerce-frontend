import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order, OrderStatus } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { Coupon } from '../models/Coupon.model.js';
import { ApiResponseView } from '../views/apiResponse.view.js';
import { EmailTemplatesView } from '../views/emailTemplates.view.js';
import { CreateOrderInput, UpdateOrderStatusInput, updateTrackingSchema } from '../validators/order.validator.js';

export class OrderController {
  static async createOrder(req: Request<{}, {}, CreateOrderInput>, res: Response): Promise<void> {
    const { items, shippingAddress, billingAddress, shippingMethod, paymentMethod, couponCode, notes } = req.body;
    const userId = req.user?.id;

    // 1. Verify item availability and calculate subtotal
    let subtotal = 0;
    const verifiedItems: IOrderItem[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        ApiResponseView.error(res, `Product not found: ${item.name}`, 404);
        return;
      }

      if (product.stockCount < item.quantity) {
        ApiResponseView.error(
          res,
          `Insufficient stock for "${product.name}". Only ${product.stockCount} available.`,
          400
        );
        return;
      }

      subtotal += product.price * item.quantity;
      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || item.image,
        selectedVariants: item.selectedVariants,
      });
    }

    // 2. Validate coupon if supplied
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validation = coupon.isValid(subtotal);
        if (validation.valid && validation.discount) {
          discount = validation.discount;
          // Increment coupon usedCount
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // 3. Calculate tax and totals
    const shippingFee = shippingMethod.price;
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100; // 8% sales tax
    const total = Math.max(0, Math.round((subtotal - discount + shippingFee + tax) * 100) / 100);

    // 4. Generate unique order number
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `ORD-${new Date().getFullYear()}-${randomHex}`;

    // 5. Decrement inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockCount: -item.quantity },
      });
      // Check inStock status
      const updatedProduct = await Product.findById(item.productId);
      if (updatedProduct) {
        updatedProduct.inStock = updatedProduct.stockCount > 0;
        await updatedProduct.save();
      }
    }

    // 6. Create Order document
    const order = new Order({
      orderNumber,
      userId,
      items: verifiedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod,
      paymentMethod,
      paymentStatus: 'paid', // Simulated
      subtotal: Math.round(subtotal * 100) / 100,
      shippingFee,
      tax,
      discount,
      couponCode,
      total,
      status: 'processing',
      notes,
    });

    await order.save();

    // Generate formatted email view
    const emailView = EmailTemplatesView.orderConfirmation(orderNumber, shippingAddress.fullName, total);

    ApiResponseView.created(
      res,
      {
        order: order.toJSON(),
        emailConfirmationView: emailView,
      },
      'Order placed successfully'
    );
  }

  static async getMyOrders(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      ApiResponseView.error(res, 'Unauthorized', 401);
      return;
    }

    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    ApiResponseView.success(res, orders.map((o) => o.toJSON()));
  }

  static async getOrderById(req: Request<{ id: string }>, res: Response): Promise<void> {
    const order = await Order.findById(req.params.id);
    if (!order) {
      ApiResponseView.error(res, 'Order not found', 404);
      return;
    }

    // Authorize: customer must own the order or be admin
    if (order.userId && req.user?.role !== 'admin' && order.userId !== req.user?.id) {
      ApiResponseView.error(res, 'Access denied', 403);
      return;
    }

    ApiResponseView.success(res, order.toJSON());
  }

  static async getAllOrders(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: Record<string, unknown> = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.city': searchRegex },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    ApiResponseView.paginated(
      res,
      orders.map((o) => o.toJSON()),
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

  static async updateOrderStatus(
    req: Request<{ id: string }, {}, UpdateOrderStatusInput>,
    res: Response
  ): Promise<void> {
    const order = await Order.findById(req.params.id);
    if (!order) {
      ApiResponseView.error(res, 'Order not found', 404);
      return;
    }

    const previousStatus = order.status;
    const newStatus = req.body.status;

    order.status = newStatus;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.carrier) order.carrier = req.body.carrier;

    // If order was cancelled and was not cancelled before, restore stock
    if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockCount: item.quantity },
        });
      }
      order.paymentStatus = 'refunded';
    }

    await order.save();
    ApiResponseView.success(res, order.toJSON(), `Order status updated to ${newStatus}`);
  }

  static async updateTracking(req: Request<{ id: string }>, res: Response): Promise<void> {
    const parsed = updateTrackingSchema.safeParse(req.body);
    if (!parsed.success) {
      ApiResponseView.error(res, 'Tracking number is required', 400);
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      ApiResponseView.error(res, 'Order not found', 404);
      return;
    }

    order.trackingNumber = parsed.data.trackingNumber;
    order.carrier = parsed.data.carrier;
    order.status = 'shipped';
    await order.save();

    ApiResponseView.success(res, order.toJSON(), 'Tracking details updated and order marked shipped');
  }
}

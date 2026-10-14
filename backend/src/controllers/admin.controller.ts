import { Request, Response } from 'express';
import { Order } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { User } from '../models/User.model.js';
import { ApiResponseView } from '../views/apiResponse.view.js';

let storeSettings = {
  storeName: 'SODAI',
  supportEmail: 'concierge@sodai-design.com',
  lowStockThreshold: 5,
  currency: 'USD',
};

export class AdminController {
  static async getStats(_req: Request, res: Response): Promise<void> {
    const [orders, products, customerCount] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.find(),
      User.countDocuments({ role: 'customer' }),
    ]);

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);

    // Group sales by day
    const salesByDay = new Map<string, number>();
    orders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toISOString().split('T')[0];
      salesByDay.set(dateKey, (salesByDay.get(dateKey) || 0) + o.total);
    });

    const recentSales = Array.from(salesByDay.entries())
      .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
      .slice(-14);

    // Calculate top selling products
    const productSalesMap = new Map<string, { id: string; name: string; unitsSold: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSalesMap.get(item.productId);
        if (existing) {
          existing.unitsSold += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          productSalesMap.set(item.productId, {
            id: item.productId,
            name: item.name,
            unitsSold: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      });
    });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const lowStockProducts = products
      .filter((p) => p.stockCount <= storeSettings.lowStockThreshold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stockCount: p.stockCount,
        category: p.category,
      }));

    ApiResponseView.success(res, {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalCustomers: customerCount,
      totalProducts: products.length,
      recentSales,
      topSellingProducts,
      lowStockProducts,
    });
  }

  static async getCustomers(_req: Request, res: Response): Promise<void> {
    const customers = await User.find({ role: 'customer' });
    const orders = await Order.find();

    const customerList = customers.map((customer) => {
      const userOrders = orders.filter((o) => o.userId === customer.id || o.shippingAddress.fullName === customer.name);
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        orderCount: userOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        active: customer.isActive,
        createdAt: customer.createdAt,
      };
    });

    ApiResponseView.success(res, customerList);
  }

  static async updateCustomerStatus(
    req: Request<{ id: string }, {}, { active: boolean }>,
    res: Response
  ): Promise<void> {
    const user = await User.findById(req.params.id);
    if (!user) {
      ApiResponseView.error(res, 'Customer not found', 404);
      return;
    }

    user.isActive = req.body.active;
    await user.save();

    ApiResponseView.success(res, { id: user.id, active: user.isActive }, 'Customer status updated');
  }

  static async getSettings(_req: Request, res: Response): Promise<void> {
    ApiResponseView.success(res, storeSettings);
  }

  static async updateSettings(req: Request<{}, {}, Partial<typeof storeSettings>>, res: Response): Promise<void> {
    storeSettings = { ...storeSettings, ...req.body };
    ApiResponseView.success(res, storeSettings, 'Store settings updated');
  }
}

import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon.model.js';
import { ApiResponseView } from '../views/apiResponse.view.js';
import { ValidateCouponInput, CreateCouponInput, UpdateCouponInput } from '../validators/coupon.validator.js';

export class CouponController {
  static async validate(req: Request<{}, {}, ValidateCouponInput>, res: Response): Promise<void> {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      ApiResponseView.error(res, 'Invalid coupon code.', 404);
      return;
    }

    const check = coupon.isValid(subtotal);
    if (!check.valid) {
      ApiResponseView.error(res, check.message || 'Coupon cannot be applied to this order.', 400);
      return;
    }

    ApiResponseView.success(res, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: check.discount,
      minOrderValue: coupon.minOrderValue,
    });
  }

  static async getCoupons(_req: Request, res: Response): Promise<void> {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    ApiResponseView.success(res, coupons.map((c) => c.toJSON()));
  }

  static async createCoupon(req: Request<{}, {}, CreateCouponInput>, res: Response): Promise<void> {
    const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (existing) {
      ApiResponseView.error(res, 'A coupon with this code already exists.', 409);
      return;
    }

    const coupon = new Coupon(req.body);
    await coupon.save();

    ApiResponseView.created(res, coupon.toJSON(), 'Coupon created successfully');
  }

  static async updateCoupon(req: Request<{ id: string }, {}, UpdateCouponInput>, res: Response): Promise<void> {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      ApiResponseView.error(res, 'Coupon not found', 404);
      return;
    }

    Object.assign(coupon, req.body);
    await coupon.save();

    ApiResponseView.success(res, coupon.toJSON(), 'Coupon updated successfully');
  }

  static async deleteCoupon(req: Request<{ id: string }>, res: Response): Promise<void> {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      ApiResponseView.error(res, 'Coupon not found', 404);
      return;
    }

    await Coupon.findByIdAndDelete(req.params.id);
    ApiResponseView.success(res, { id: req.params.id }, 'Coupon removed successfully');
  }
}

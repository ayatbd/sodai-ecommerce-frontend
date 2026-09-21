import { CartItem, Coupon, ShippingMethod } from '../types';

export interface CartCalculationResult {
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export function calculateCart(
  items: CartItem[],
  coupon: Coupon | null,
  shippingMethod: ShippingMethod
): CartCalculationResult {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discountPercent) {
      discount = (subtotal * coupon.discountPercent) / 100;
    } else if (coupon.discountAmount) {
      discount = Math.min(coupon.discountAmount, subtotal);
    }
  }

  const shipping = subtotal > 0 ? shippingMethod.price : 0;
  // standard estimated sales tax (7.25% after discount)
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = subtotal > 0 ? Math.round(taxableAmount * 0.0725 * 100) / 100 : 0;
  const total = Math.max(0, taxableAmount + shipping + tax);

  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shipping,
    tax,
    total: Math.round(total * 100) / 100,
  };
}

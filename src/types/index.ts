export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags: string[];
  features: string[];
  dimensions?: string;
  material?: string;
  colors?: { name: string; hex: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  description: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: {
    type: 'card' | 'apple_pay' | 'google_pay';
    brand?: string;
    last4?: string;
  };
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  couponApplied?: Coupon;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'succeeded' | 'processing';
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeCustomers: number;
  recentSales: { date: string; amount: number }[];
  topSellingProducts: { id: string; name: string; unitsSold: number; revenue: number }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'destructive' | 'info';
  duration?: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  rating?: number;
  inStockOnly?: boolean;
  saleOnly?: boolean;
  search?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

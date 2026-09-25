import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Product,
  ProductCategory,
  ProductReview,
  Coupon,
  Address,
  Order,
  AdminStats,
  User,
  ProductFilters,
  ShippingMethod,
  CartItem,
} from '../types';
import {
  INITIAL_PRODUCTS,
  CATEGORIES,
  INITIAL_REVIEWS,
  COUPONS,
  INITIAL_ADDRESSES,
  INITIAL_ORDERS,
  INITIAL_ADMIN_STATS,
  SHIPPING_METHODS,
  INITIAL_USER,
  BRANDS,
} from './mockData';
import { sleep } from '../lib/utils';

// Local storage persistent caches
const STORAGE_KEYS = {
  PRODUCTS: 'aura_products_v2',
  REVIEWS: 'aura_reviews_v1',
  ADDRESSES: 'aura_addresses_v1',
  ORDERS: 'aura_orders_v1',
  STATS: 'aura_admin_stats_v1',
  CART: 'aura_cart_state_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Helper to safely clone objects avoiding frozen state references
const clone = <T>(val: T): T => JSON.parse(JSON.stringify(val));

// Always ensure products store has full catalog with brands
const storedProducts = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, []);
let productsStore: Product[] =
  storedProducts.length >= INITIAL_PRODUCTS.length ? storedProducts : clone(INITIAL_PRODUCTS);
let reviewsStore: ProductReview[] = getStored<ProductReview[]>(
  STORAGE_KEYS.REVIEWS,
  clone(INITIAL_REVIEWS)
);
let addressesStore: Address[] = getStored<Address[]>(
  STORAGE_KEYS.ADDRESSES,
  clone(INITIAL_ADDRESSES)
);
let ordersStore: Order[] = getStored<Order[]>(STORAGE_KEYS.ORDERS, clone(INITIAL_ORDERS));
let statsStore: AdminStats = getStored<AdminStats>(STORAGE_KEYS.STATS, clone(INITIAL_ADMIN_STATS));

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Product', 'Category', 'Review', 'Coupon', 'Address', 'Order', 'User', 'AdminData', 'Cart'],
  endpoints: (builder) => ({
    // 1. PRODUCTS
    getProducts: builder.query<Product[], ProductFilters | void>({
      async queryFn(filters) {
        await sleep(250);
        let result = [...productsStore];

        if (filters) {
          if (filters.category && filters.category !== 'all') {
            const cat = filters.category.toLowerCase();
            result = result.filter(
              (p) =>
                p.category.toLowerCase() === cat ||
                (cat === 'men' && (p.category === 'apparel' || p.tags.some((t) => t.toLowerCase() === 'men')))
            );
          }
          if (filters.brand && filters.brand !== 'all') {
            const b = filters.brand.toLowerCase();
            result = result.filter((p) => p.brand?.toLowerCase() === b);
          }
          if (filters.search && filters.search.trim()) {
            const q = filters.search.toLowerCase().trim();
            result = result.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.tagline.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                p.tags.some((t) => t.toLowerCase().includes(q))
            );
          }
          if (filters.minPrice !== undefined) {
            result = result.filter((p) => p.price >= (filters.minPrice ?? 0));
          }
          if (filters.maxPrice !== undefined) {
            result = result.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
          }
          if (filters.minRating !== undefined && filters.minRating > 0) {
            result = result.filter((p) => p.rating >= (filters.minRating ?? 0));
          }
          if (filters.inStockOnly) {
            result = result.filter((p) => p.inStock && p.stockCount > 0);
          }
          if (filters.saleOnly) {
            result = result.filter((p) => p.originalPrice !== undefined && p.originalPrice > p.price);
          }
          if (filters.sortBy) {
            switch (filters.sortBy) {
              case 'price-asc':
              case 'price_asc':
                result.sort((a, b) => a.price - b.price);
                break;
              case 'price-desc':
              case 'price_desc':
                result.sort((a, b) => b.price - a.price);
                break;
              case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
              case 'newest':
                result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
              case 'featured':
              default:
                result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
                break;
            }
          }
        }

        return { data: result };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getBrands: builder.query<string[], void>({
      async queryFn() {
        await sleep(50);
        return { data: BRANDS };
      },
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    getFeaturedProducts: builder.query<Product[], void>({
      async queryFn() {
        await sleep(150);
        const featured = productsStore.filter((p) => p.isFeatured);
        return { data: featured.length > 0 ? featured : productsStore.slice(0, 4) };
      },
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    getNewArrivals: builder.query<Product[], void>({
      async queryFn() {
        await sleep(150);
        const newItems = productsStore.filter((p) => p.isNew);
        return { data: newItems.length > 0 ? newItems : productsStore.slice(2, 6) };
      },
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query<Product, string>({
      async queryFn(idOrSlug) {
        await sleep(200);
        const product = productsStore.find(
          (p) => p.id === idOrSlug || p.slug === idOrSlug || p.slug?.toLowerCase() === idOrSlug?.toLowerCase()
        );
        if (!product) {
          return { error: { status: 404, data: 'Product not found' } };
        }
        return { data: product };
      },
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    getProductBySlug: builder.query<Product, string>({
      async queryFn(slugOrId) {
        await sleep(200);
        const product = productsStore.find(
          (p) => p.slug === slugOrId || p.id === slugOrId || p.slug?.toLowerCase() === slugOrId?.toLowerCase()
        );
        if (!product) {
          return { error: { status: 404, data: 'Product not found' } };
        }
        return { data: product };
      },
      providesTags: (result, _error, slug) =>
        result ? [{ type: 'Product', id: result.id }, { type: 'Product', id: slug }] : [{ type: 'Product', id: slug }],
    }),

    createProduct: builder.mutation<Product, Omit<Product, 'id' | 'rating' | 'reviewCount'>>({
      async queryFn(newProd) {
        await sleep(400);
        const product: Product = {
          ...newProd,
          id: `prod-${Date.now()}`,
          rating: 5.0,
          reviewCount: 0,
        };
        productsStore = [product, ...productsStore];
        setStored(STORAGE_KEYS.PRODUCTS, productsStore);
        return { data: product };
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'AdminData', id: 'STATS' }],
    }),

    updateProduct: builder.mutation<Product, Partial<Product> & { id: string }>({
      async queryFn({ id, ...updates }) {
        await sleep(350);
        const product = productsStore.find((p) => p.id === id);
        if (!product) {
          return { error: { status: 404, data: 'Product not found' } };
        }
        const updatedProduct: Product = { ...product, ...updates };
        productsStore = productsStore.map((p) => (p.id === id ? updatedProduct : p));
        setStored(STORAGE_KEYS.PRODUCTS, productsStore);
        return { data: updatedProduct };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'AdminData', id: 'STATS' },
      ],
    }),

    deleteProduct: builder.mutation<{ success: boolean; id: string }, string>({
      async queryFn(id) {
        await sleep(300);
        productsStore = productsStore.filter((p) => p.id !== id);
        setStored(STORAGE_KEYS.PRODUCTS, productsStore);
        return { data: { success: true, id } };
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'AdminData', id: 'STATS' }],
    }),

    // 2. CATEGORIES
    getCategories: builder.query<ProductCategory[], void>({
      async queryFn() {
        await sleep(200);
        return { data: CATEGORIES };
      },
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // 3. REVIEWS
    getReviews: builder.query<ProductReview[], string>({
      async queryFn(productId) {
        await sleep(250);
        const revs = reviewsStore.filter((r) => r.productId === productId);
        return { data: revs };
      },
      providesTags: (_result, _error, productId) => [{ type: 'Review', id: productId }],
    }),

    addReview: builder.mutation<ProductReview, Omit<ProductReview, 'id' | 'createdAt'>>({
      async queryFn(reviewInput) {
        await sleep(400);
        const review: ProductReview = {
          ...reviewInput,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        reviewsStore = [review, ...reviewsStore];
        setStored(STORAGE_KEYS.REVIEWS, reviewsStore);

        // recalculate product rating & count immutably
        const productReviews = reviewsStore.filter((r) => r.productId === review.productId);
        const avg =
          productReviews.reduce((sum, r) => sum + r.rating, 0) / (productReviews.length || 1);
        productsStore = productsStore.map((p) =>
          p.id === review.productId
            ? {
                ...p,
                rating: Math.round(avg * 10) / 10,
                reviewCount: productReviews.length,
              }
            : p
        );
        setStored(STORAGE_KEYS.PRODUCTS, productsStore);

        return { data: review };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Review', id: arg.productId },
        { type: 'Product', id: arg.productId },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // 4. COUPONS
    validateCoupon: builder.mutation<Coupon, { code: string; subtotal: number }>({
      async queryFn({ code, subtotal }) {
        await sleep(300);
        const normalized = code.trim().toUpperCase();
        const found = COUPONS.find((c) => c.code.toUpperCase() === normalized);

        if (!found) {
          return { error: { status: 400, data: 'Invalid coupon code' } };
        }

        if (found.minSpend && subtotal < found.minSpend) {
          return {
            error: {
              status: 400,
              data: `Coupon requires minimum order value of $${found.minSpend}`,
            },
          };
        }

        return { data: found };
      },
    }),

    // 5. ADDRESSES
    getAddresses: builder.query<Address[], void>({
      async queryFn() {
        await sleep(250);
        return { data: addressesStore };
      },
      providesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    addAddress: builder.mutation<Address, Omit<Address, 'id'>>({
      async queryFn(newAddr) {
        await sleep(350);
        const address: Address = {
          ...newAddr,
          id: `addr-${Date.now()}`,
        };

        if (address.isDefaultShipping) {
          addressesStore = addressesStore.map((a) => ({ ...a, isDefaultShipping: false }));
        }
        if (address.isDefaultBilling) {
          addressesStore = addressesStore.map((a) => ({ ...a, isDefaultBilling: false }));
        }

        addressesStore = [address, ...addressesStore];
        setStored(STORAGE_KEYS.ADDRESSES, addressesStore);
        return { data: address };
      },
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    deleteAddress: builder.mutation<{ success: boolean; id: string }, string>({
      async queryFn(id) {
        await sleep(250);
        addressesStore = addressesStore.filter((a) => a.id !== id);
        setStored(STORAGE_KEYS.ADDRESSES, addressesStore);
        return { data: { success: true, id } };
      },
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    // 6. SHIPPING METHODS
    getShippingMethods: builder.query<ShippingMethod[], void>({
      async queryFn() {
        return { data: SHIPPING_METHODS };
      },
    }),

    // 7. ORDERS
    getOrders: builder.query<Order[], void>({
      async queryFn() {
        await sleep(300);
        return { data: ordersStore };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    getOrderById: builder.query<Order, string>({
      async queryFn(orderId) {
        await sleep(200);
        const order = ordersStore.find((o) => o.id === orderId);
        if (!order) {
          return { error: { status: 404, data: 'Order not found' } };
        }
        return { data: order };
      },
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation<Order, Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'trackingNumber'>>({
      async queryFn(orderInput) {
        await sleep(600);
        const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date().toISOString();
        const order: Order = {
          ...orderInput,
          id: orderId,
          status: 'processing',
          trackingNumber: `AUR-${Math.floor(100000000 + Math.random() * 900000000)}-US`,
          createdAt: now,
          updatedAt: now,
        };

        ordersStore = [order, ...ordersStore];
        setStored(STORAGE_KEYS.ORDERS, ordersStore);

        // Update stats
        statsStore = {
          ...statsStore,
          totalRevenue: statsStore.totalRevenue + order.total,
          totalOrders: statsStore.totalOrders + 1,
        };
        setStored(STORAGE_KEYS.STATS, statsStore);

        // Deduct inventory stock immutably without mutating frozen objects
        productsStore = productsStore.map((prod) => {
          const item = order.items.find((it) => it.productId === prod.id);
          if (!item) return prod;
          const newStock = Math.max(0, prod.stockCount - item.quantity);
          return {
            ...prod,
            stockCount: newStock,
            inStock: newStock > 0,
          };
        });
        setStored(STORAGE_KEYS.PRODUCTS, productsStore);

        return { data: order };
      },
      invalidatesTags: [
        { type: 'Order', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
        { type: 'AdminData', id: 'STATS' },
      ],
    }),

    updateOrderStatus: builder.mutation<Order, { orderId: string; status: Order['status'] }>({
      async queryFn({ orderId, status }) {
        await sleep(300);
        const order = ordersStore.find((o) => o.id === orderId);
        if (!order) {
          return { error: { status: 404, data: 'Order not found' } };
        }
        const updatedOrder: Order = {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        };
        ordersStore = ordersStore.map((o) => (o.id === orderId ? updatedOrder : o));
        setStored(STORAGE_KEYS.ORDERS, ordersStore);
        return { data: updatedOrder };
      },
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
        { type: 'AdminData', id: 'STATS' },
      ],
    }),

    // 8. PAYMENTS (Stripe Payment Intent Simulation)
    processPayment: builder.mutation<
      { success: boolean; transactionId: string; message: string },
      { amount: number; paymentMethodId: string; currency?: string }
    >({
      async queryFn({ amount }) {
        await sleep(1000); // realistic payment latency
        return {
          data: {
            success: true,
            transactionId: `ch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
            message: `Payment of $${(amount).toFixed(2)} processed successfully via Stripe`,
          },
        };
      },
    }),

    // 9. USERS & AUTH
    getCurrentUser: builder.query<User, void>({
      async queryFn() {
        await sleep(150);
        return { data: INITIAL_USER };
      },
      providesTags: [{ type: 'User', id: 'CURRENT' }],
    }),

    updateUserProfile: builder.mutation<User, Partial<User>>({
      async queryFn(updates) {
        await sleep(350);
        const updatedUser = { ...INITIAL_USER, ...updates };
        return { data: updatedUser };
      },
      invalidatesTags: [{ type: 'User', id: 'CURRENT' }],
    }),

    // 10. ADMIN DATA
    getAdminStats: builder.query<AdminStats, void>({
      async queryFn() {
        await sleep(300);
        return { data: statsStore };
      },
      providesTags: [{ type: 'AdminData', id: 'STATS' }],
    }),

    // 11. NEWSLETTER
    subscribeNewsletter: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      async queryFn({ email }) {
        await sleep(400);
        return {
          data: {
            success: true,
            message: `Thank you for subscribing with ${email}. Welcome to AURA Studio dispatch.`,
          },
        };
      },
    }),

    // 12. CART (RTK Query Cache & Persistent Storage)
    getCart: builder.query<CartItem[], void>({
      async queryFn() {
        const stored = getStored<{ items: CartItem[] }>(STORAGE_KEYS.CART, { items: [] });
        return { data: stored.items || [] };
      },
      providesTags: [{ type: 'Cart', id: 'ITEMS' }],
    }),

    addToCartMutation: builder.mutation<
      CartItem[],
      {
        product: Product;
        quantity?: number;
        color?: string;
        size?: string;
        material?: string;
        selectedVariants?: Record<string, string>;
        unitPrice?: number;
      }
    >({
      async queryFn(payload) {
        await sleep(150);
        const stored = getStored<{ items: CartItem[]; appliedCoupon: any; shippingMethod: any }>(
          STORAGE_KEYS.CART,
          { items: [], appliedCoupon: null, shippingMethod: null }
        );
        const items = [...(stored.items || [])];
        const { product, quantity = 1, color, size, material, selectedVariants, unitPrice } = payload;
        const variantKey = selectedVariants ? JSON.stringify(selectedVariants) : (color || '');

        const existingIndex = items.findIndex((item) => {
          if (item.product.id !== product.id) return false;
          if (selectedVariants && item.selectedVariants) {
            return JSON.stringify(item.selectedVariants) === variantKey;
          }
          return (!color || item.selectedColor === color) && (!size || item.selectedSize === size);
        });

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          const existingItem = items[existingIndex];
          const updatedItem = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
            unitPrice: unitPrice || existingItem.unitPrice,
          };
          updatedItems = items.map((it, idx) => (idx === existingIndex ? updatedItem : it));
        } else {
          updatedItems = [
            ...items,
            {
              product,
              quantity,
              selectedColor: color || (product.colors?.[0]?.name ?? undefined),
              selectedSize: size,
              selectedMaterial: material,
              selectedVariants: selectedVariants || (color ? { Color: color } : undefined),
              unitPrice: unitPrice || product.price,
            },
          ];
        }

        const newCartState = {
          ...stored,
          items: updatedItems,
        };
        setStored(STORAGE_KEYS.CART, newCartState);
        return { data: updatedItems };
      },
      invalidatesTags: [{ type: 'Cart', id: 'ITEMS' }],
    }),

    checkCustomerEligibility: builder.query<
      { eligible: boolean; hasPurchased: boolean },
      { productId: string; userId?: string }
    >({
      async queryFn({ productId, userId }) {
        await sleep(100);
        if (!userId) return { data: { eligible: false, hasPurchased: false } };
        // Check if this user has any completed/delivered/processing order with this product
        const hasPurchased = ordersStore.some(
          (o) =>
            (o.userId === userId || !o.userId) &&
            o.items.some((item) => item.productId === productId)
        );
        return { data: { eligible: hasPurchased, hasPurchased } };
      },
      providesTags: (_res, _err, arg) => [{ type: 'Order', id: arg.productId }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetBrandsQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetReviewsQuery,
  useAddReviewMutation,
  useValidateCouponMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useGetShippingMethodsQuery,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useProcessPaymentMutation,
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useGetAdminStatsQuery,
  useSubscribeNewsletterMutation,
  useGetCartQuery,
  useAddToCartMutationMutation,
  useCheckCustomerEligibilityQuery,
} = apiSlice;

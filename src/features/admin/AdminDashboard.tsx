import React, { useState } from 'react';
import {
  useGetAdminStatsQuery,
  useGetProductsQuery,
  useGetOrdersQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateOrderStatusMutation,
} from '../../services/api';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentView, addToast } from '../../store/slices/uiSlice';
import { Product, Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Package,
  CheckCircle,
  Truck,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  tagline: z.string().min(5, 'Tagline is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  originalPrice: z.number().optional(),
  category: z.string().min(2, 'Category is required'),
  stockCount: z.number().int().nonnegative('Stock cannot be negative'),
  imageUrl: z.string().url('Must be a valid image URL'),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { data: stats, isLoading: isStatsLoading } = useGetAdminStatsQuery();
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const { data: orders = [], isLoading: isOrdersLoading } = useGetOrdersQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      name: '',
      tagline: '',
      description: '',
      price: 100,
      originalPrice: undefined,
      category: 'workspace',
      stockCount: 15,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      isFeatured: false,
      isNew: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      stockCount: product.stockCount,
      imageUrl: product.images[0],
      isFeatured: product.isFeatured || false,
      isNew: product.isNew || false,
    });
    setIsProductModalOpen(true);
  };

  const onProductSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct({
          ...editingProduct,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          category: data.category,
          stockCount: data.stockCount,
          inStock: data.stockCount > 0,
          images: [data.imageUrl, ...editingProduct.images.slice(1)],
          isFeatured: data.isFeatured,
          isNew: data.isNew,
        }).unwrap();

        dispatch(
          addToast({
            title: 'Product Updated',
            description: `${data.name} saved successfully.`,
            type: 'success',
          })
        );
      } else {
        await createProduct({
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          tagline: data.tagline,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          category: data.category,
          stockCount: data.stockCount,
          inStock: data.stockCount > 0,
          images: [data.imageUrl],
          tags: [data.category, 'studio', 'minimalist'],
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          features: ['Precision-machined finish', 'Studio grade materials'],
        }).unwrap();

        dispatch(
          addToast({
            title: 'Product Created',
            description: `${data.name} added to catalog.`,
            type: 'success',
          })
        );
      }
      setIsProductModalOpen(false);
    } catch {
      dispatch(
        addToast({
          title: 'Operation Failed',
          type: 'destructive',
        })
      );
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await deleteProduct(id).unwrap();
        dispatch(
          addToast({
            title: 'Product Removed',
            description: name,
            type: 'default',
          })
        );
      } catch {
        dispatch(
          addToast({
            title: 'Could not delete product',
            type: 'destructive',
          })
        );
      }
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      dispatch(
        addToast({
          title: 'Order Status Updated',
          description: `${orderId} marked as ${status}.`,
          type: 'success',
        })
      );
    } catch {
      dispatch(
        addToast({
          title: 'Status Update Failed',
          type: 'destructive',
        })
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6 dark:border-neutral-800">
        <div>
          <button
            onClick={() => dispatch(setCurrentView('shop'))}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Storefront</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
              Studio Command Console
            </h1>
            <Badge variant="default" className="gap-1 font-mono text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              ADMINISTRATOR
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time telemetry, live merchandise catalog, and fulfillment logistics.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          <span>New Product Item</span>
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Gross Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">
              {stats ? formatCurrency(stats.totalRevenue) : <Skeleton className="h-7 w-24" />}
            </span>
          </div>
          <span className="mt-1 block text-[11px] text-emerald-600 font-medium">
            +18.4% from last quarter
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Orders Dispatched</span>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">
              {stats ? stats.totalOrders : <Skeleton className="h-7 w-12" />}
            </span>
          </div>
          <span className="mt-1 block text-[11px] text-neutral-400">
            99.2% on-time carrier delivery
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Active Customers</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">
              {stats ? stats.activeCustomers : <Skeleton className="h-7 w-12" />}
            </span>
          </div>
          <span className="mt-1 block text-[11px] text-purple-600 font-medium">
            84% recurring order rate
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Avg Order Value</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">
              {stats ? formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0) : <Skeleton className="h-7 w-20" />}
            </span>
          </div>
          <span className="mt-1 block text-[11px] text-neutral-400">
            Across 14 product categories
          </span>
        </div>
      </div>

      {/* Tabs for Catalog Management & Orders */}
      <Tabs defaultValue="products">
        <TabsList className="grid w-full sm:w-80 grid-cols-2">
          <TabsTrigger value="products">Product Catalog ({products.length})</TabsTrigger>
          <TabsTrigger value="orders">Fulfillment Orders ({orders.length})</TabsTrigger>
        </TabsList>

        {/* Product Catalog Tab */}
        <TabsContent value="products" className="space-y-4 pt-4">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artifact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 line-clamp-1">
                            {p.tagline}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{p.category}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(p.price)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.stockCount > 5
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : p.stockCount > 0
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        }`}
                      >
                        {p.stockCount} units
                      </span>
                    </TableCell>
                    <TableCell>★ {p.rating.toFixed(1)} ({p.reviewCount})</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(p)}
                        className="h-8 w-8 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="h-8 w-8 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4 pt-4">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tracking Carrier</TableHead>
                  <TableHead>Fulfillment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                      {o.id}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-neutral-900 dark:text-white">{o.shippingAddress.fullName}</p>
                      <p className="text-[11px] text-neutral-400">{o.shippingAddress.city}, {o.shippingAddress.state}</p>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(o.total)}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500">
                      {o.trackingNumber || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Create/Edit Modal */}
      <Dialog
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        title={editingProduct ? 'Edit Catalog Artifact' : 'Add New Design Artifact'}
        description="Update inventory details, imagery, pricing, and merchandising tags."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onProductSubmit)} className="space-y-4 pt-2">
          <Input
            label="Product Name"
            placeholder="AURA Monolith Desk Mat"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Tagline"
            placeholder="Vegetable-tanned full grain Italian leather"
            {...register('tagline')}
            error={errors.tagline?.message}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />
            <Input
              label="Original Price (for discounts)"
              type="number"
              step="0.01"
              {...register('originalPrice', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category (workspace, audio, lighting, carry)"
              placeholder="workspace"
              {...register('category')}
              error={errors.category?.message}
            />
            <Input
              label="Inventory Stock Count"
              type="number"
              {...register('stockCount', { valueAsNumber: true })}
              error={errors.stockCount?.message}
            />
          </div>

          <Input
            label="Primary Image URL"
            placeholder="https://images.unsplash.com/..."
            {...register('imageUrl')}
            error={errors.imageUrl?.message}
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-xs focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-6 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="rounded" />
              <span>Feature on homepage banner</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isNew')} className="rounded" />
              <span>Mark as 'New Release'</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating || isUpdating}>
              {editingProduct ? 'Save Changes' : 'Create Artifact'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

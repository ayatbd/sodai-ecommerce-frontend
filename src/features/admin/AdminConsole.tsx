import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  Eye,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Tags,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { formatCurrency, formatDate } from "../../lib/utils";
import {
  useCancelOrderMutation,
  useCreateCategoryMutation,
  useCreateProductMutation,
  useDeleteAdminCouponMutation,
  useDeleteCategoryMutation,
  useDeleteProductMutation,
  useGetAdminCouponsQuery,
  useGetAdminCustomersQuery,
  useGetAdminReviewsQuery,
  useGetAdminSettingsQuery,
  useGetAdminStatsQuery,
  useGetCategoriesQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useSaveAdminCouponMutation,
  useSetAdminCustomerStatusMutation,
  useSetReviewApprovalMutation,
  useUpdateAdminSettingsMutation,
  useUpdateCategoryMutation,
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
  useUpdateProductMutation,
} from "../../services/api";
import { useAppDispatch } from "../../store/hooks";
import { addToast } from "../../store/slices/uiSlice";
import {
  AdminSettings,
  Coupon,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from "../../types";

const productSchema = z.object({
  name: z.string().min(3),
  tagline: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  category: z.string().min(1),
  stockCount: z.number().int().nonnegative(),
  imageUrls: z.string().min(1),
  specifications: z.string(),
  variants: z.string(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  published: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;
type AdminPage =
  | "overview"
  | "products"
  | "product-form"
  | "categories"
  | "orders"
  | "customers"
  | "coupons"
  | "reviews"
  | "settings";

const navigation: {
  title: string;
  href: string;
  page: AdminPage;
  icon: React.ElementType;
}[] = [
  {
    title: "Overview",
    href: "/admin",
    page: "overview",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    page: "products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    page: "categories",
    icon: Boxes,
  },
  { title: "Orders", href: "/admin/orders", page: "orders", icon: ShoppingBag },
  {
    title: "Customers",
    href: "/admin/customers",
    page: "customers",
    icon: Users,
  },
  { title: "Coupons", href: "/admin/coupons", page: "coupons", icon: Tags },
  { title: "Reviews", href: "/admin/reviews", page: "reviews", icon: Star },
  {
    title: "Settings",
    href: "/admin/settings",
    page: "settings",
    icon: Settings2,
  },
];

function resolvePage(path: string): AdminPage {
  if (path === "/admin" || path === "/admin/") return "overview";
  if (
    path.startsWith("/admin/products/new") ||
    /\/admin\/products\/[^/]+\/edit$/.test(path)
  )
    return "product-form";
  if (path.startsWith("/admin/products")) return "products";
  const section = path.split("/")[2] as AdminPage;
  return navigation.some((item) => item.page === section)
    ? section
    : "overview";
}

const fieldClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";
const panelClass =
  "border-y border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950";

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const tones = {
    neutral:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    green:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function RevenueChart({
  sales,
}: {
  sales: { date: string; amount: number }[];
}) {
  const data = sales.length ? sales : [];
  const formatAxisDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  const max = Math.max(1, ...data.map((point) => point.amount));
  const points = data
    .map(
      (point, index) =>
        `${data.length < 2 ? 50 : (index / (data.length - 1)) * 100},${96 - (point.amount / max) * 82}`,
    )
    .join(" ");
  return (
    <div className="h-56 w-full" aria-label="Revenue chart">
      {data.length ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          {[20, 45, 70, 95].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-800"
              strokeWidth=".5"
            />
          ))}
          <polyline
            fill="none"
            stroke="#0f766e"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            points={points}
          />
          {data.map((point, index) => (
            <circle
              key={`${point.date}-${index}`}
              cx={data.length < 2 ? 50 : (index / (data.length - 1)) * 100}
              cy={96 - (point.amount / max) * 82}
              r="1.4"
              fill="#0f766e"
            />
          ))}
        </svg>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-neutral-500">
          No revenue history yet
        </div>
      )}
      <div className="mt-2 flex justify-between text-[11px] text-neutral-400">
        {data
          .filter(
            (_, index) =>
              index === 0 ||
              index === data.length - 1 ||
              index % Math.ceil(data.length / 5) === 0,
          )
          .map((point, index) => (
            <span key={`${point.date}-${index}`}>
              {formatAxisDate(point.date)}
            </span>
          ))}
      </div>
    </div>
  );
}

function SalesChart({ orders }: { orders: Order[] }) {
  const grouped = new Map<string, number>();
  orders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    grouped.set(date, (grouped.get(date) ?? 0) + 1);
  });
  const entries = [...grouped.entries()].slice(-8);
  const max = Math.max(1, ...entries.map(([, count]) => count));
  return (
    <div
      className="flex h-56 items-end gap-2 border-b border-neutral-200 dark:border-neutral-800"
      aria-label="Sales chart"
    >
      {entries.length ? (
        entries.map(([date, count]) => (
          <div
            key={date}
            className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"
          >
            <span className="mb-1 text-[10px] text-neutral-500">{count}</span>
            <div
              className="mx-auto w-full max-w-10 bg-amber-500"
              style={{ height: `${Math.max(5, (count / max) * 78)}%` }}
            />
            <span className="mt-2 truncate text-[10px] text-neutral-400">
              {date}
            </span>
          </div>
        ))
      ) : (
        <p className="m-auto text-sm text-neutral-500">No order history yet</p>
      )}
    </div>
  );
}

export function AdminConsole() {
  const dispatch = useAppDispatch();
  const [path, setPath] = useState(window.location.pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [categoryDialog, setCategoryDialog] = useState<
    ProductCategory | null | false
  >(false);
  const [couponDialog, setCouponDialog] = useState<Coupon | null | false>(
    false,
  );
  const page = resolvePage(path);

  const { data: stats } = useGetAdminStatsQuery();
  const { data: products = [] } = useGetProductsQuery({ admin: true });
  const { data: orders = [] } = useGetOrdersQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: customers = [] } = useGetAdminCustomersQuery();
  const { data: coupons = [] } = useGetAdminCouponsQuery();
  const { data: reviews = [] } = useGetAdminReviewsQuery();
  const { data: settings } = useGetAdminSettingsQuery();

  const [createProduct, createProductState] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [updateOrderTracking] = useUpdateOrderTrackingMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [saveCoupon] = useSaveAdminCouponMutation();
  const [deleteCoupon] = useDeleteAdminCouponMutation();
  const [setCustomerStatus] = useSetAdminCustomerStatusMutation();
  const [setReviewApproval] = useSetReviewApprovalMutation();
  const [updateSettings] = useUpdateAdminSettingsMutation();

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      price: 0,
      originalPrice: undefined,
      category: categories[0]?.slug ?? "workspace",
      stockCount: 0,
      imageUrls: "",
      specifications: "",
      variants: "[]",
      isFeatured: false,
      isNew: false,
      published: true,
    },
  });

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    if (page !== "product-form") {
      setEditingProduct(null);
      return;
    }
    const match = path.match(/^\/admin\/products\/([^/]+)\/edit$/);
    const product = match
      ? products.find((item) => item.id === match[1])
      : undefined;
    setEditingProduct(product ?? null);
    if (product) {
      productForm.reset({
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        stockCount: product.stockCount,
        imageUrls: product.images.join("\n"),
        specifications: Object.entries(product.specifications ?? {})
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n"),
        variants: JSON.stringify(product.variants ?? [], null, 2),
        isFeatured: !!product.isFeatured,
        isNew: !!product.isNew,
        published: product.published !== false,
      });
    } else if (path.endsWith("/new")) {
      productForm.reset({
        name: "",
        tagline: "",
        description: "",
        price: 0,
        originalPrice: undefined,
        category: categories[0]?.slug ?? "workspace",
        stockCount: 0,
        imageUrls: "",
        specifications: "",
        variants: "[]",
        isFeatured: false,
        isNew: false,
        published: true,
      });
    }
  }, [path, page, products, categories, productForm]);

  const navigate = (href: string) => {
    window.history.pushState({}, "", href);
    setPath(href);
    setSearch("");
    setPageNumber(1);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const notify = (
    title: string,
    type: "success" | "destructive" = "success",
    description?: string,
  ): void => {
    dispatch(addToast({ title, type, description }));
  };
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          `${product.name} ${product.category} ${product.id}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return (
          matchesSearch &&
          (categoryFilter === "all" || product.category === categoryFilter)
        );
      }),
    [products, search, categoryFilter],
  );
  const pageSize = 8;
  const visibleProducts = filteredProducts.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize,
  );
  const lowStock = products.filter(
    (product) => product.stockCount <= (settings?.lowStockThreshold ?? 5),
  );
  const recentCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const submitProduct = productForm.handleSubmit(async (values) => {
    try {
      const specifications = Object.fromEntries(
        values.specifications
          .split("\n")
          .map((line) => line.split(":"))
          .filter((parts) => parts.length > 1)
          .map(([key, ...rest]) => [key.trim(), rest.join(":").trim()]),
      );
      const variants = JSON.parse(values.variants || "[]");
      const common = {
        name: values.name,
        slug: values.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        tagline: values.tagline,
        description: values.description,
        price: values.price,
        originalPrice: values.originalPrice,
        category: values.category,
        stockCount: values.stockCount,
        inStock: values.stockCount > 0,
        images: values.imageUrls
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        tags: [values.category],
        isFeatured: values.isFeatured,
        isNew: values.isNew,
        published: values.published,
        features: [],
        specifications,
        variants,
      };
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...common }).unwrap();
        notify("Product updated", "success", `${values.name} has been saved.`);
      } else {
        await createProduct(common).unwrap();
        notify(
          "Product created",
          "success",
          `${values.name} has been added to the catalog.`,
        );
      }
      navigate("/admin/products");
    } catch (error) {
      notify(
        "Product could not be saved",
        "destructive",
        error instanceof Error
          ? error.message
          : "Check the variants JSON and try again.",
      );
    }
  });

  const handleProductDelete = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`))
      return;
    try {
      await deleteProduct(product.id).unwrap();
      notify("Product deleted", "success", product.name);
    } catch {
      notify("Product could not be deleted", "destructive");
    }
  };

  const togglePublished = async (product: Product) => {
    try {
      await updateProduct({
        ...product,
        published: product.published === false,
      }).unwrap();
      notify(
        product.published === false
          ? "Product published"
          : "Product unpublished",
      );
    } catch {
      notify("Publish status could not be updated", "destructive");
    }
  };

  const changeOrderStatus = async (order: Order, status: OrderStatus) => {
    try {
      if (status === "cancelled") {
        const updated = await cancelOrder({ orderId: order.id }).unwrap();
        if (activeOrder?.id === order.id) setActiveOrder(updated);
        notify(
          "Order cancelled and refunded",
          "success",
          `${order.id} has been cancelled.`,
        );
      } else {
        await updateOrderStatus({ orderId: order.id, status }).unwrap();
        notify("Order updated", "success", `${order.id} is ${status}.`);
      }
    } catch {
      notify("Order status could not be updated", "destructive");
    }
  };

  const saveTracking = async () => {
    if (!activeOrder || !trackingNumber.trim()) return;
    try {
      const updated = await updateOrderTracking({
        orderId: activeOrder.id,
        trackingNumber: trackingNumber.trim(),
      }).unwrap();
      setActiveOrder(updated);
      notify("Tracking number saved");
    } catch {
      notify("Tracking number could not be saved", "destructive");
    }
  };

  const pageTitle =
    page === "product-form"
      ? editingProduct
        ? "Edit product"
        : "New product"
      : (navigation.find((item) => item.page === page)?.title ?? "Overview");

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-neutral-200 bg-white transition-transform dark:border-neutral-800 dark:bg-neutral-950 lg:static lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5 dark:border-neutral-800">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-left"
            >
              <span className="grid h-8 w-8 place-items-center bg-neutral-950 text-xs font-bold text-white dark:bg-white dark:text-neutral-950">
                AU
              </span>
              <span>
                <span className="block text-sm font-bold tracking-[.16em]">
                  AURA
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-neutral-400">
                  Store admin
                </span>
              </span>
            </button>
            <button
              className="lg:hidden"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="space-y-1 p-3" aria-label="Admin navigation">
            {navigation.map(({ title, href, page: itemPage, icon: Icon }) => (
              <a
                key={href}
                href={href}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(href);
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${page === itemPage || (itemPage === "products" && page === "product-form") ? "bg-neutral-100 font-medium text-neutral-950 dark:bg-neutral-800 dark:text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
                {title}
                {itemPage === "orders" &&
                  orders.filter((order) => order.status === "processing")
                    .length > 0 && (
                    <span className="ml-auto rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">
                      {
                        orders.filter((order) => order.status === "processing")
                          .length
                      }
                    </span>
                  )}
              </a>
            ))}
          </nav>
          <div className="mt-auto border-t border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Administrator access
            </div>
            <button
              onClick={() => {
                window.history.pushState({}, "", "/shop");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="mt-3 flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to storefront
            </button>
          </div>
        </aside>
        {mobileNavOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          />
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                  AURA / Admin
                </p>
                <h1 className="text-sm font-semibold">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-neutral-500 sm:block">
                Store status
              </span>
              <StatusBadge tone="green">Online</StatusBadge>
              <button
                aria-label="View storefront"
                onClick={() => {
                  window.history.pushState({}, "", "/shop");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-7 sm:py-8">
            {page === "overview" && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Store overview</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      A live snapshot of your store performance.
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    Updated {new Date().toLocaleString()}
                  </span>
                </div>
                <section className="grid grid-cols-2 gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 xl:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-800">
                  {[
                    {
                      label: "Total revenue",
                      value: formatCurrency(stats?.totalRevenue ?? 0),
                      icon: CircleDollarSign,
                      note: "Lifetime sales",
                    },
                    {
                      label: "Total orders",
                      value: stats?.totalOrders ?? 0,
                      icon: ClipboardList,
                      note: "Across all statuses",
                    },
                    {
                      label: "Total customers",
                      value: customers.length,
                      icon: Users,
                      note: "Active accounts",
                    },
                    {
                      label: "Total products",
                      value: products.length,
                      icon: Package,
                      note: "In your catalog",
                    },
                  ].map(({ label, value, icon: Icon, note }) => (
                    <div
                      key={label}
                      className="bg-white p-4 dark:bg-neutral-950 sm:p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          {label}
                        </span>
                        <Icon className="h-4 w-4 text-neutral-400" />
                      </div>
                      <p className="mt-3 text-2xl font-semibold tabular-nums">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">{note}</p>
                    </div>
                  ))}
                </section>
                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                  <section className={`${panelClass} p-5`}>
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">Revenue</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          Sales over time
                        </p>
                      </div>
                      <BarChart3 className="h-4 w-4 text-neutral-400" />
                    </div>
                    <RevenueChart sales={stats?.recentSales ?? []} />
                  </section>
                  <section className={`${panelClass} p-5`}>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Sales by product
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          Top performers
                        </p>
                      </div>
                      <Activity className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div className="space-y-4">
                      {(stats?.topSellingProducts ?? [])
                        .slice(0, 5)
                        .map((item, index) => (
                          <div key={item.id}>
                            <div className="mb-1 flex justify-between gap-3 text-xs">
                              <span className="truncate text-neutral-700 dark:text-neutral-300">
                                {index + 1}. {item.name}
                              </span>
                              <span className="shrink-0 font-medium">
                                {item.unitsSold} sold
                              </span>
                            </div>
                            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800">
                              <div
                                className="h-full bg-teal-700"
                                style={{
                                  width: `${Math.max(6, (item.unitsSold / Math.max(1, stats?.topSellingProducts[0]?.unitsSold ?? 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                </div>
                <section className={`${panelClass} p-5`}>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold">Sales volume</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      Orders by day
                    </p>
                  </div>
                  <SalesChart orders={orders} />
                </section>
                <div className="grid gap-6 2xl:grid-cols-[1.5fr_1fr]">
                  <section className={panelClass}>
                    <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
                      <div>
                        <h3 className="text-sm font-semibold">Recent orders</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          Latest customer purchases
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate("/admin/orders")}
                      >
                        All orders{" "}
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentOrders.map((order) => (
                            <TableRow
                              key={order.id}
                              className="cursor-pointer"
                              onClick={() => {
                                setActiveOrder(order);
                              }}
                            >
                              <TableCell className="font-medium">
                                {order.id}
                              </TableCell>
                              <TableCell>
                                {formatDate(order.createdAt)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(order.total)}
                              </TableCell>
                              <TableCell>
                                <StatusBadge
                                  tone={
                                    order.status === "delivered"
                                      ? "green"
                                      : order.status === "cancelled"
                                        ? "red"
                                        : "amber"
                                  }
                                >
                                  {order.status}
                                </StatusBadge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </section>
                  <section className={panelClass}>
                    <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
                      <div>
                        <h3 className="text-sm font-semibold">Low stock</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          At or below {settings?.lowStockThreshold ?? 5} units
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate("/admin/products")}
                      >
                        Inventory{" "}
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                      </Button>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {lowStock.slice(0, 5).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {product.category}
                            </p>
                          </div>
                          <StatusBadge
                            tone={product.stockCount === 0 ? "red" : "amber"}
                          >
                            {product.stockCount} left
                          </StatusBadge>
                        </div>
                      ))}
                      {lowStock.length === 0 && (
                        <p className="p-5 text-sm text-neutral-500">
                          Inventory levels look good.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
                <section className={panelClass}>
                  <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
                    <h3 className="text-sm font-semibold">Recent customers</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      Customers with the highest lifetime spend
                    </p>
                  </div>
                  <div className="grid gap-px bg-neutral-200 sm:grid-cols-2 xl:grid-cols-5 dark:bg-neutral-800">
                    {recentCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="bg-white p-4 dark:bg-neutral-950"
                      >
                        <p className="truncate text-sm font-medium">
                          {customer.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {customer.email}
                        </p>
                        <p className="mt-3 text-xs font-medium">
                          {formatCurrency(customer.totalSpent)}{" "}
                          <span className="font-normal text-neutral-400">
                            · {customer.orderCount} orders
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {page === "products" && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Products</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Manage catalog, pricing, and inventory.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate("/admin/products/new")}
                  >
                    <Plus className="h-4 w-4" />
                    New product
                  </Button>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPageNumber(1);
                      }}
                      placeholder="Search products"
                      className={`${fieldClass} pl-9`}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-500">
                    <SlidersHorizontal className="h-4 w-4" />
                    <select
                      value={categoryFilter}
                      onChange={(event) => {
                        setCategoryFilter(event.target.value);
                        setPageNumber(1);
                      }}
                      className={`${fieldClass} w-auto min-w-44`}
                    >
                      <option value="all">All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <section className={`${panelClass} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Inventory</TableHead>
                          <TableHead>Visibility</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex min-w-48 items-center gap-3">
                                <img
                                  src={product.images[0]}
                                  alt=""
                                  className="h-10 w-10 shrink-0 object-cover bg-neutral-100"
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {product.name}
                                  </p>
                                  <p className="truncate text-xs text-neutral-400">
                                    {product.id}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">
                              {product.category}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {formatCurrency(product.price)}
                              </div>
                              {product.originalPrice && (
                                <div className="text-xs text-neutral-400 line-through">
                                  {formatCurrency(product.originalPrice)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                tone={
                                  product.stockCount <= 0
                                    ? "red"
                                    : product.stockCount <=
                                        (settings?.lowStockThreshold ?? 5)
                                      ? "amber"
                                      : "green"
                                }
                              >
                                {product.stockCount} units
                              </StatusBadge>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => void togglePublished(product)}
                                aria-label={`${product.published === false ? "Publish" : "Unpublish"} ${product.name}`}
                              >
                                <StatusBadge
                                  tone={
                                    product.published === false
                                      ? "neutral"
                                      : "green"
                                  }
                                >
                                  {product.published === false
                                    ? "Draft"
                                    : "Published"}
                                </StatusBadge>
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Edit ${product.name}`}
                                  onClick={() =>
                                    navigate(
                                      `/admin/products/${product.id}/edit`,
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Delete ${product.name}`}
                                  onClick={() =>
                                    void handleProductDelete(product)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800">
                    <span>{filteredProducts.length} products</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pageNumber === 1}
                        onClick={() => setPageNumber((value) => value - 1)}
                      >
                        Previous
                      </Button>
                      <span>
                        Page {pageNumber} of{" "}
                        {Math.max(
                          1,
                          Math.ceil(filteredProducts.length / pageSize),
                        )}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          pageNumber >=
                          Math.ceil(filteredProducts.length / pageSize)
                        }
                        onClick={() => setPageNumber((value) => value + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {page === "product-form" && (
              <section className="max-w-4xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {editingProduct ? "Edit product" : "Create product"}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Configure listing details, prices, inventory, and product
                      data.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/admin/products")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <form onSubmit={submitProduct} className="space-y-5">
                  <section
                    className={`${panelClass} grid gap-4 p-5 sm:grid-cols-2`}
                  >
                    <Input
                      label="Product name"
                      {...productForm.register("name")}
                      error={productForm.formState.errors.name?.message}
                    />
                    <Input
                      label="Tagline"
                      {...productForm.register("tagline")}
                      error={productForm.formState.errors.tagline?.message}
                    />
                    <label className="space-y-1.5 text-xs font-medium">
                      Category
                      <select
                        {...productForm.register("category")}
                        className={fieldClass}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.slug}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input
                      label="Inventory quantity"
                      type="number"
                      {...productForm.register("stockCount", {
                        valueAsNumber: true,
                      })}
                      error={productForm.formState.errors.stockCount?.message}
                    />
                    <Input
                      label="Sale price"
                      type="number"
                      step="0.01"
                      {...productForm.register("price", {
                        valueAsNumber: true,
                      })}
                      error={productForm.formState.errors.price?.message}
                    />
                    <Input
                      label="Compare-at price"
                      type="number"
                      step="0.01"
                      {...productForm.register("originalPrice", {
                        valueAsNumber: true,
                      })}
                    />
                    <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
                      Description
                      <textarea
                        rows={4}
                        {...productForm.register("description")}
                        className={fieldClass}
                      />
                      {productForm.formState.errors.description && (
                        <span className="text-red-600">
                          {productForm.formState.errors.description.message}
                        </span>
                      )}
                    </label>
                    <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
                      Image URLs{" "}
                      <span className="font-normal text-neutral-400">
                        (one per line)
                      </span>
                      <textarea
                        rows={3}
                        {...productForm.register("imageUrls")}
                        className={fieldClass}
                      />
                      {productForm.formState.errors.imageUrls && (
                        <span className="text-red-600">
                          At least one image URL is required.
                        </span>
                      )}
                    </label>
                    <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
                      Specifications{" "}
                      <span className="font-normal text-neutral-400">
                        (one key: value per line)
                      </span>
                      <textarea
                        rows={3}
                        placeholder={
                          "Material: Recycled aluminum\nDimensions: 20 x 30 cm"
                        }
                        {...productForm.register("specifications")}
                        className={fieldClass}
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
                      Variants{" "}
                      <span className="font-normal text-neutral-400">
                        (JSON array using product variant format)
                      </span>
                      <textarea
                        rows={5}
                        {...productForm.register("variants")}
                        className={`${fieldClass} font-mono text-xs`}
                      />
                      {productForm.formState.errors.variants && (
                        <span className="text-red-600">Enter valid JSON.</span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-5 text-sm sm:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...productForm.register("published")}
                          className="accent-neutral-900"
                        />
                        Published
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...productForm.register("isFeatured")}
                          className="accent-neutral-900"
                        />
                        Featured
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...productForm.register("isNew")}
                          className="accent-neutral-900"
                        />
                        New arrival
                      </label>
                    </div>
                  </section>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/products")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={createProductState.isLoading}
                    >
                      {editingProduct ? "Save product" : "Create product"}
                    </Button>
                  </div>
                </form>
              </section>
            )}

            {page === "orders" && (
              <OrdersPage
                orders={orders}
                search={search}
                setSearch={setSearch}
                status={orderStatusFilter}
                setStatus={setOrderStatusFilter}
                paymentStatus={paymentStatusFilter}
                setPaymentStatus={setPaymentStatusFilter}
                onOpen={setActiveOrder}
                onStatus={changeOrderStatus}
              />
            )}
            {page === "customers" && (
              <CustomersPage
                customers={customers}
                orders={orders}
                search={search}
                setSearch={setSearch}
                onStatus={(id, active) =>
                  setCustomerStatus({ id, active })
                    .unwrap()
                    .then(() =>
                      notify(
                        active ? "Customer activated" : "Customer deactivated",
                      ),
                    )
                    .catch(() =>
                      notify("Customer update failed", "destructive"),
                    )
                }
              />
            )}
            {page === "categories" && (
              <CategoriesPage
                categories={categories}
                products={products}
                onCreate={() => setCategoryDialog(null)}
                onEdit={setCategoryDialog}
                onDelete={(category) => {
                  if (window.confirm(`Delete category ${category.name}?`))
                    void deleteCategory(category.id)
                      .unwrap()
                      .then(() => notify("Category deleted"))
                      .catch(() =>
                        notify("Category could not be deleted", "destructive"),
                      );
                }}
              />
            )}
            {page === "coupons" && (
              <CouponsPage
                coupons={coupons}
                onCreate={() => setCouponDialog(null)}
                onEdit={setCouponDialog}
                onDelete={(code) => {
                  if (window.confirm(`Delete coupon ${code}?`))
                    void deleteCoupon(code)
                      .unwrap()
                      .then(() => notify("Coupon deleted"))
                      .catch(() =>
                        notify("Coupon could not be deleted", "destructive"),
                      );
                }}
              />
            )}
            {page === "reviews" && (
              <ReviewsPage
                reviews={reviews}
                products={products}
                onModerate={(reviewId, isApproved) =>
                  setReviewApproval({ reviewId, isApproved })
                    .unwrap()
                    .then(() =>
                      notify(isApproved ? "Review approved" : "Review hidden"),
                    )
                    .catch(() => notify("Review update failed", "destructive"))
                }
              />
            )}
            {page === "settings" && settings && (
              <SettingsPage
                settings={settings}
                onSave={(value) =>
                  updateSettings(value)
                    .unwrap()
                    .then(() => notify("Settings saved"))
                    .catch(() =>
                      notify("Settings could not be saved", "destructive"),
                    )
                }
              />
            )}
          </main>
        </div>
      </div>

      <Dialog
        open={!!activeOrder}
        onOpenChange={(open) => !open && setActiveOrder(null)}
        title={`Order ${activeOrder?.id ?? ""}`}
        description="Order details and fulfillment controls."
        maxWidth="2xl"
      >
        {activeOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Customer</p>
                <p className="mt-1 font-medium">
                  {activeOrder.shippingAddress.fullName}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Placed</p>
                <p className="mt-1">{formatDate(activeOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Payment status</p>
                <p className="mt-1">{activeOrder.paymentStatus ?? "paid"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Total</p>
                <p className="mt-1 font-semibold">
                  {formatCurrency(activeOrder.total)}
                </p>
              </div>
            </div>
            <div className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {activeOrder.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between py-3 text-sm"
                >
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <label className="block space-y-1.5 text-xs font-medium">
              Fulfillment status
              <select
                className={fieldClass}
                value={activeOrder.status}
                onChange={(event) => {
                  const status = event.target.value as OrderStatus;
                  void changeOrderStatus(activeOrder, status);
                  setActiveOrder({ ...activeOrder, status });
                }}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <div className="space-y-2">
              <label
                className="block text-xs font-medium"
                htmlFor="tracking-number"
              >
                Tracking number
              </label>
              <div className="flex gap-2">
                <input
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder={
                    activeOrder.trackingNumber ?? "Enter tracking number"
                  }
                  className={fieldClass}
                />
                <Button size="sm" onClick={() => void saveTracking()}>
                  Save
                </Button>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Cancelling an eligible pending or processing order records a
              refund.
            </p>
          </div>
        )}
      </Dialog>

      <Dialog
        open={categoryDialog !== false}
        onOpenChange={(open) => !open && setCategoryDialog(false)}
        title={categoryDialog ? "Edit category" : "New category"}
        description="Set category name, description, image, and display order."
      >
        {categoryDialog !== false && (
          <CategoryForm
            key={categoryDialog?.id ?? "new-category"}
            category={categoryDialog || null}
            onCancel={() => setCategoryDialog(false)}
            onSubmit={async (value) => {
              try {
                if (categoryDialog)
                  await updateCategory({
                    ...categoryDialog,
                    ...value,
                  }).unwrap();
                else await createCategory(value).unwrap();
                notify(categoryDialog ? "Category saved" : "Category created");
                setCategoryDialog(false);
              } catch {
                notify("Category could not be saved", "destructive");
              }
            }}
          />
        )}
      </Dialog>
      <Dialog
        open={couponDialog !== false}
        onOpenChange={(open) => !open && setCouponDialog(false)}
        title={couponDialog ? "Edit coupon" : "New coupon"}
        description="Configure a discount code and its minimum spend."
      >
        {couponDialog !== false && (
          <CouponForm
            key={couponDialog?.code ?? "new-coupon"}
            coupon={couponDialog || null}
            onCancel={() => setCouponDialog(false)}
            onSubmit={async (coupon) => {
              try {
                await saveCoupon(coupon).unwrap();
                notify("Coupon saved");
                setCouponDialog(false);
              } catch {
                notify("Coupon could not be saved", "destructive");
              }
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function OrdersPage({
  orders,
  search,
  setSearch,
  status,
  setStatus,
  paymentStatus,
  setPaymentStatus,
  onOpen,
  onStatus,
}: {
  orders: Order[];
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  paymentStatus: string;
  setPaymentStatus: (value: string) => void;
  onOpen: (order: Order) => void;
  onStatus: (order: Order, status: OrderStatus) => void;
}) {
  const filtered = orders.filter(
    (order) =>
      `${order.id} ${order.shippingAddress.fullName}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "all" || order.status === status) &&
      (paymentStatus === "all" ||
        (order.paymentStatus ?? "paid") === paymentStatus),
  );
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold">Orders</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Search purchases and manage fulfillment.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number or customer"
            className={`${fieldClass} pl-9`}
          />
        </label>
        <select
          className={`${fieldClass} sm:w-48`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All fulfillment statuses</option>
          {["pending", "processing", "shipped", "delivered", "cancelled"].map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ),
          )}
        </select>
        <select
          className={`${fieldClass} sm:w-44`}
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value)}
          aria-label="Filter by payment status"
        >
          <option value="all">All payment statuses</option>
          {["pending", "paid", "refunded", "failed"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <section className={`${panelClass} overflow-x-auto`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.shippingAddress.fullName}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge
                    tone={
                      (order.paymentStatus ?? "paid") === "paid"
                        ? "green"
                        : "amber"
                    }
                  >
                    {order.paymentStatus ?? "paid"}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <select
                    className="rounded-sm border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                    value={order.status}
                    onChange={(event) =>
                      onStatus(order, event.target.value as OrderStatus)
                    }
                  >
                    {[
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpen(order)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-neutral-500">
            No matching orders.
          </p>
        )}
      </section>
    </>
  );
}

function CustomersPage({
  customers,
  orders,
  search,
  setSearch,
  onStatus,
}: {
  customers: {
    id: string;
    name: string;
    email: string;
    orderCount: number;
    totalSpent: number;
    active: boolean;
  }[];
  orders: Order[];
  search: string;
  setSearch: (value: string) => void;
  onStatus: (id: string, active: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const customerOrders = orders.filter(
    (order) =>
      order.userId === selected ||
      order.shippingAddress.fullName ===
        customers.find((customer) => customer.id === selected)?.name,
  );
  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold">Customers</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Review customer profiles and order history.
        </p>
      </div>
      <label className="relative block max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customers"
          className={`${fieldClass} pl-9`}
        />
      </label>
      <section className={`${panelClass} overflow-x-auto`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <button
                    className="text-left"
                    onClick={() => setSelected(customer.id)}
                  >
                    <span className="block font-medium">{customer.name}</span>
                    <span className="text-xs text-neutral-500">
                      {customer.email}
                    </span>
                  </button>
                </TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                <TableCell>
                  <StatusBadge tone={customer.active ? "green" : "red"}>
                    {customer.active ? "Active" : "Deactivated"}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatus(customer.id, !customer.active)}
                  >
                    {customer.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-neutral-500">
            No matching customers.
          </p>
        )}
      </section>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={
          customers.find((customer) => customer.id === selected)?.name ??
          "Customer"
        }
        description={
          customers.find((customer) => customer.id === selected)?.email
        }
      >
        {selected && (
          <div className="space-y-3">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-neutral-100 py-3 text-sm dark:border-neutral-800"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(order.createdAt)} · {order.status}
                  </p>
                </div>
                <span>{formatCurrency(order.total)}</span>
              </div>
            ))}
            {customerOrders.length === 0 && (
              <p className="text-sm text-neutral-500">
                No order history found.
              </p>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}

function CategoriesPage({
  categories,
  products,
  onCreate,
  onEdit,
  onDelete,
}: {
  categories: ProductCategory[];
  products: Product[];
  onCreate: () => void;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
}) {
  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Categories</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Organize and order your catalog collections.
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </div>
      <section className={`${panelClass} overflow-x-auto`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Order</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories
              .filter((category) => category.id !== "cat-all")
              .sort(
                (left, right) =>
                  (left.sortOrder ?? Number.MAX_SAFE_INTEGER) -
                  (right.sortOrder ?? Number.MAX_SAFE_INTEGER),
              )
              .map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={category.imageUrl}
                        alt=""
                        className="h-10 w-12 object-cover"
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description}
                  </TableCell>
                  <TableCell>
                    {
                      products.filter(
                        (product) => product.category === category.slug,
                      ).length
                    }
                  </TableCell>
                  <TableCell>{category.sortOrder ?? index + 1}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => onDelete(category)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}

function CategoryForm({
  category,
  onCancel,
  onSubmit,
}: {
  category: ProductCategory | null;
  onCancel: () => void;
  onSubmit: (
    value: Omit<ProductCategory, "id" | "productCount">,
  ) => Promise<void>;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  const [order, setOrder] = useState(category?.sortOrder ?? 0);
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          name,
          slug: name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          description,
          imageUrl,
          sortOrder: Number(order),
        });
      }}
    >
      <Input
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Input
        label="Image URL"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        type="url"
        required
      />
      <label className="block space-y-1.5 text-xs font-medium">
        Description
        <textarea
          className={fieldClass}
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </label>
      <Input
        label="Display order"
        type="number"
        value={order}
        onChange={(event) => setOrder(Number(event.target.value))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save category</Button>
      </div>
    </form>
  );
}

function CouponsPage({
  coupons,
  onCreate,
  onEdit,
  onDelete,
}: {
  coupons: Coupon[];
  onCreate: () => void;
  onEdit: (coupon: Coupon) => void;
  onDelete: (code: string) => void;
}) {
  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Coupons</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Create and maintain promotional codes.
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New coupon
        </Button>
      </div>
      <section className={`${panelClass} overflow-x-auto`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Minimum spend</TableHead>
              <TableHead>Description</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.code}>
                <TableCell className="font-mono font-semibold">
                  {coupon.code}
                </TableCell>
                <TableCell>
                  {coupon.discountPercent
                    ? `${coupon.discountPercent}%`
                    : formatCurrency(coupon.discountAmount ?? 0)}
                </TableCell>
                <TableCell>
                  {coupon.minSpend ? formatCurrency(coupon.minSpend) : "None"}
                </TableCell>
                <TableCell>{coupon.description}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(coupon)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${coupon.code}`}
                    onClick={() => onDelete(coupon.code)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}

function CouponForm({
  coupon,
  onCancel,
  onSubmit,
}: {
  coupon: Coupon | null;
  onCancel: () => void;
  onSubmit: (coupon: Coupon) => Promise<void>;
}) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [discountPercent, setDiscountPercent] = useState(
    coupon?.discountPercent ?? 10,
  );
  const [discountAmount, setDiscountAmount] = useState(
    coupon?.discountAmount ?? 0,
  );
  const [minSpend, setMinSpend] = useState(coupon?.minSpend ?? 0);
  const [description, setDescription] = useState(coupon?.description ?? "");
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          code: code.trim().toUpperCase(),
          discountPercent: discountAmount ? undefined : Number(discountPercent),
          discountAmount: discountAmount ? Number(discountAmount) : undefined,
          minSpend: Number(minSpend) || undefined,
          description,
        });
      }}
    >
      <Input
        label="Code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Percent discount"
          type="number"
          min="0"
          max="100"
          value={discountPercent}
          onChange={(event) => setDiscountPercent(Number(event.target.value))}
        />
        <Input
          label="Fixed discount amount"
          type="number"
          min="0"
          value={discountAmount}
          onChange={(event) => setDiscountAmount(Number(event.target.value))}
        />
      </div>
      <Input
        label="Minimum spend"
        type="number"
        min="0"
        value={minSpend}
        onChange={(event) => setMinSpend(Number(event.target.value))}
      />
      <Input
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        required
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save coupon</Button>
      </div>
    </form>
  );
}

function ReviewsPage({
  reviews,
  products,
  onModerate,
}: {
  reviews: {
    id: string;
    productId: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
    isApproved?: boolean;
  }[];
  products: Product[];
  onModerate: (reviewId: string, isApproved: boolean) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold">Reviews</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Moderate customer feedback before it appears publicly.
        </p>
      </div>
      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className={`${panelClass} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{review.title}</h3>
                  <StatusBadge
                    tone={review.isApproved === false ? "amber" : "green"}
                  >
                    {review.isApproved === false ? "Hidden" : "Published"}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {review.userName} ·{" "}
                  {products.find((product) => product.id === review.productId)
                    ?.name ?? "Product"}{" "}
                  · {formatDate(review.createdAt)}
                </p>
              </div>
              <span className="text-sm text-amber-600">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {review.comment}
            </p>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onModerate(review.id, review.isApproved === false)
                }
              >
                {review.isApproved === false ? (
                  <>
                    <Check className="h-4 w-4" />
                    Publish
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Hide
                  </>
                )}
              </Button>
            </div>
          </article>
        ))}
        {reviews.length === 0 && (
          <div
            className={panelClass + " p-8 text-center text-sm text-neutral-500"}
          >
            No reviews to moderate.
          </div>
        )}
      </div>
    </>
  );
}

function SettingsPage({
  settings,
  onSave,
}: {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => Promise<void>;
}) {
  const [values, setValues] = useState(settings);
  useEffect(() => setValues(settings), [settings]);
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Store settings</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Manage contact and inventory alert defaults.
        </p>
      </div>
      <form
        className={`${panelClass} space-y-4 p-5`}
        onSubmit={(event) => {
          event.preventDefault();
          void onSave({
            ...values,
            lowStockThreshold: Number(values.lowStockThreshold),
          });
        }}
      >
        <Input
          label="Store name"
          value={values.storeName}
          onChange={(event) =>
            setValues({ ...values, storeName: event.target.value })
          }
          required
        />
        <Input
          label="Support email"
          type="email"
          value={values.supportEmail}
          onChange={(event) =>
            setValues({ ...values, supportEmail: event.target.value })
          }
          required
        />
        <Input
          label="Low-stock threshold"
          type="number"
          min="0"
          value={values.lowStockThreshold}
          onChange={(event) =>
            setValues({
              ...values,
              lowStockThreshold: Number(event.target.value),
            })
          }
        />
        <label className="block space-y-1.5 text-xs font-medium">
          Currency
          <select
            className={fieldClass}
            value={values.currency}
            onChange={(event) =>
              setValues({ ...values, currency: event.target.value })
            }
          >
            <option value="USD">USD - US Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </label>
        <div className="flex justify-end">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect } from "react";
import { Provider } from "react-redux";
import HomePage from "./app/(store)/page";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { ToastContainer } from "./components/ui/Toast";
import { AccountDashboard } from "./features/account/AccountDashboard";
import { AddressesPage } from "./features/account/AddressesPage";
import { OrderDetailPage } from "./features/account/OrderDetailPage";
import { OrdersPage } from "./features/account/OrdersPage";
import { ProfilePage } from "./features/account/ProfilePage";
import { AdminConsole } from "./features/admin/AdminConsole";
import { AuthModal } from "./features/auth/AuthModal";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./features/auth/VerifyEmailPage";
import { CartDrawer } from "./features/cart/CartDrawer";
import { CheckoutView } from "./features/checkout/CheckoutView";
import { ProductDetailView } from "./features/products/ProductDetailView";
import { ProductQuickViewModal } from "./features/products/ProductQuickViewModal";
import { ShopView } from "./features/shop/ShopView";
import { WishlistDrawer } from "./features/wishlist/WishlistDrawer";
import { WishlistPage } from "./features/wishlist/WishlistPage";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  setActiveOrderId,
  setAuthModalOpen,
  setCurrentView,
  viewProductDetail,
} from "./store/slices/uiSlice";

function AppContent() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const currentView = useAppSelector((state) => state.ui.currentView);
  const isAdmin = useAppSelector(
    (state) => state.auth.isAuthenticated && state.auth.user?.role === "admin",
  );

  // Synchronize dark/light theme on the html root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Synchronize browser URL on load and back/forward navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith("/products/")) {
        const slug = path.replace("/products/", "").split("/")[0];
        if (slug) {
          dispatch(viewProductDetail(slug));
          dispatch(setCurrentView("product-detail"));
        }
      } else if (path === "/checkout") {
        dispatch(setCurrentView("checkout"));
      } else if (path === "/shop") {
        dispatch(setCurrentView("shop"));
      } else if (path.startsWith("/admin")) {
        dispatch(setCurrentView("admin"));
      } else if (path === "/account") {
        dispatch(setCurrentView("account"));
      } else if (path === "/account/profile") {
        dispatch(setCurrentView("account-profile"));
      } else if (path === "/account/orders") {
        dispatch(setCurrentView("account-orders"));
      } else if (path.startsWith("/account/orders/")) {
        const orderId = path.replace("/account/orders/", "").split("/")[0];
        if (orderId) dispatch(setActiveOrderId(orderId));
        dispatch(setCurrentView("account-order-detail"));
      } else if (path === "/account/addresses") {
        dispatch(setCurrentView("account-addresses"));
      } else if (path === "/orders") {
        dispatch(setCurrentView("account-orders"));
      } else if (path === "/addresses") {
        dispatch(setCurrentView("account-addresses"));
      } else if (path === "/login") {
        dispatch(setCurrentView("login"));
      } else if (path === "/register") {
        dispatch(setCurrentView("register"));
      } else if (path === "/forgot-password") {
        dispatch(setCurrentView("forgot-password"));
      } else if (path === "/reset-password") {
        dispatch(setCurrentView("reset-password"));
      } else if (path === "/verify-email") {
        dispatch(setCurrentView("verify-email"));
      } else if (path === "/wishlist") {
        dispatch(setCurrentView("wishlist"));
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white dark:bg-neutral-950 dark:text-neutral-50 dark:selection:bg-neutral-100 dark:selection:text-neutral-900 font-sans">
      {currentView !== "admin" && <Header />}

      {/* Primary Dynamic View Content */}
      <main className="flex-1">
        {currentView === "home" && <HomePage />}
        {currentView === "shop" && <ShopView />}
        {currentView === "product-detail" && <ProductDetailView />}
        {currentView === "checkout" && <CheckoutView />}
        {currentView === "wishlist" && <WishlistPage />}
        {currentView === "account" && <AccountDashboard />}
        {currentView === "account-profile" && <ProfilePage />}
        {(currentView === "account-orders" || currentView === "orders") && (
          <OrdersPage />
        )}
        {currentView === "account-order-detail" && <OrderDetailPage />}
        {(currentView === "account-addresses" ||
          currentView === "addresses") && <AddressesPage />}
        {currentView === "login" && <LoginPage />}
        {currentView === "register" && <RegisterPage />}
        {currentView === "forgot-password" && <ForgotPasswordPage />}
        {currentView === "reset-password" && <ResetPasswordPage />}
        {currentView === "verify-email" && <VerifyEmailPage />}
        {currentView === "admin" &&
          (isAdmin ? (
            <AdminConsole />
          ) : (
            <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
              <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
                Admin access required
              </h1>
              <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                This area is only available to authenticated store
                administrators.
              </p>
              <button
                type="button"
                onClick={() => dispatch(setAuthModalOpen(true))}
                className="mt-5 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                Sign in
              </button>
            </section>
          ))}
      </main>

      {currentView !== "admin" && <Footer />}

      {/* Global Interactive Overlays */}
      {currentView !== "admin" && <CartDrawer />}
      {currentView !== "admin" && <WishlistDrawer />}
      {currentView !== "admin" && <ProductQuickViewModal />}
      {(currentView !== "admin" || !isAdmin) && <AuthModal />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

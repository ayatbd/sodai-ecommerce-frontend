import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { removeToast } from './store/slices/uiSlice';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import HomePage from './app/(store)/page';
import { ShopView } from './features/shop/ShopView';
import { ProductDetailView } from './features/products/ProductDetailView';
import { CheckoutView } from './features/checkout/CheckoutView';
import { OrderHistory } from './features/orders/OrderHistory';
import { AddressBook } from './features/addresses/AddressBook';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { CartDrawer } from './features/cart/CartDrawer';
import { WishlistDrawer } from './features/wishlist/WishlistDrawer';
import { ProductQuickViewModal } from './features/products/ProductQuickViewModal';
import { AuthModal } from './features/auth/AuthModal';
import { ToastContainer } from './components/ui/Toast';

function AppContent() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const currentView = useAppSelector((state) => state.ui.currentView);

  // Synchronize dark/light theme on the html root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white dark:bg-neutral-950 dark:text-neutral-50 dark:selection:bg-neutral-100 dark:selection:text-neutral-900 font-sans">
      {/* Responsive E-commerce Header */}
      <Header />

      {/* Primary Dynamic View Content */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'shop' && <ShopView />}
        {currentView === 'product-detail' && <ProductDetailView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'orders' && <OrderHistory />}
        {currentView === 'addresses' && <AddressBook />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <WishlistDrawer />
      <ProductQuickViewModal />
      <AuthModal />
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

import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentView, setActiveOrderId, AppView } from '../store/slices/uiSlice';

const VIEW_PATHS: Record<AppView, string> = {
  home: '/',
  shop: '/shop',
  'product-detail': '/products',
  checkout: '/checkout',
  orders: '/account/orders',
  addresses: '/account/addresses',
  admin: '/admin',
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'verify-email': '/verify-email',
  account: '/account',
  'account-profile': '/account/profile',
  'account-orders': '/account/orders',
  'account-order-detail': '/account/orders',
  'account-addresses': '/account/addresses',
  wishlist: '/wishlist',
};

export function useNavigateView() {
  const dispatch = useAppDispatch();

  const navigate = useCallback(
    (view: AppView, searchParams?: string, dynamicId?: string) => {
      if (view === 'account-order-detail' && dynamicId) {
        dispatch(setActiveOrderId(dynamicId));
      }
      dispatch(setCurrentView(view));
      if (typeof window !== 'undefined') {
        let path = VIEW_PATHS[view] || '/';
        if (view === 'account-order-detail' && dynamicId) {
          path = `/account/orders/${dynamicId}`;
        }
        const url = searchParams ? `${path}?${searchParams}` : path;
        window.history.pushState({}, '', url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [dispatch]
  );

  return navigate;
}

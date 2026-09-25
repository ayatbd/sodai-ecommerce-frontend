import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentView, AppView } from '../store/slices/uiSlice';

const VIEW_PATHS: Record<AppView, string> = {
  home: '/',
  shop: '/shop',
  'product-detail': '/products',
  checkout: '/checkout',
  orders: '/orders',
  addresses: '/addresses',
  admin: '/admin',
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'verify-email': '/verify-email',
};

export function useNavigateView() {
  const dispatch = useAppDispatch();

  const navigate = useCallback(
    (view: AppView, searchParams?: string) => {
      dispatch(setCurrentView(view));
      if (typeof window !== 'undefined') {
        const path = VIEW_PATHS[view] || '/';
        const url = searchParams ? `${path}?${searchParams}` : path;
        window.history.pushState({}, '', url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [dispatch]
  );

  return navigate;
}

'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { viewProductDetail, setCurrentView } from '../../../store/slices/uiSlice';
import { ProductDetailView } from '../../../features/products/ProductDetailView';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

/**
 * Next.js App Router Product Details Page
 * Route: /products/[slug]
 */
export default function ProductDetailPage({ params }: ProductPageProps) {
  const dispatch = useAppDispatch();
  const slug = params?.slug;

  useEffect(() => {
    if (slug) {
      dispatch(viewProductDetail(slug));
      dispatch(setCurrentView('product-detail'));
    }
  }, [slug, dispatch]);

  return <ProductDetailView />;
}

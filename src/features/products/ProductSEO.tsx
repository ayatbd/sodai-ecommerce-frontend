import React, { useEffect } from 'react';
import { Product } from '../../types';

interface ProductSEOProps {
  product: Product;
  selectedPrice?: number;
}

export function ProductSEO({ product, selectedPrice }: ProductSEOProps) {
  const currentPrice = selectedPrice !== undefined ? selectedPrice : product.price;
  const pageTitle = `${product.name} — ${product.brand || 'AURA Studio'}`;
  const metaDescription = product.description.slice(0, 155);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://aurastudio.design/products/${product.slug}`;
  const mainImage = product.images?.[0] || '';

  useEffect(() => {
    // 1. Update Document Title
    const originalTitle = document.title;
    document.title = pageTitle;

    // Helper to update or insert meta tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);

    // 3. OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', mainImage);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'product');

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', mainImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // 6. Schema.org JSON-LD Structured Data
    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.images,
      description: product.description,
      sku: product.id,
      mpn: product.id,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'AURA Studio',
      },
      offers: {
        '@type': 'Offer',
        url: currentUrl,
        priceCurrency: 'USD',
        price: currentPrice.toFixed(2),
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'AURA Studio',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: product.reviewCount.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    };

    let scriptTag = document.querySelector('script#product-schema-ld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'product-schema-ld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(structuredData);

    return () => {
      document.title = originalTitle;
      const existingScript = document.querySelector('script#product-schema-ld');
      if (existingScript) existingScript.remove();
    };
  }, [product, currentPrice, pageTitle, metaDescription, currentUrl, mainImage]);

  return null;
}

import React from 'react';
import { Product } from '../../types';
import { Package, ShieldCheck, Layers, Sliders } from 'lucide-react';

interface ProductSpecificationsProps {
  product: Product;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // Assemble specifications from product fields and product.specifications map
  const specs: { label: string; value: string; icon?: React.ReactNode }[] = [];

  if (product.dimensions) {
    specs.push({ label: 'Dimensions', value: product.dimensions });
  }

  if (product.material) {
    specs.push({ label: 'Primary Materials', value: product.material });
  }

  if (product.brand) {
    specs.push({ label: 'Brand & Studio', value: product.brand });
  }

  if (product.specifications) {
    Object.entries(product.specifications).forEach(([label, value]) => {
      // Don't duplicate if already added
      if (!specs.some((s) => s.label.toLowerCase() === label.toLowerCase())) {
        specs.push({ label, value });
      }
    });
  }

  // Add standard architectural e-commerce specs if missing
  if (!specs.some((s) => s.label.toLowerCase().includes('warranty'))) {
    specs.push({
      label: 'Warranty',
      value: product.warranty || '2-Year Studio Guarantee (parts & labor)',
    });
  }

  if (!specs.some((s) => s.label.toLowerCase().includes('origin'))) {
    specs.push({
      label: 'Origin',
      value: 'Engineered in San Francisco, California',
    });
  }

  return (
    <div className="space-y-6" id="product-specifications">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">
          Technical Specifications
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Precision-tested acoustic and structural metrics.
        </p>
      </div>

      {/* Grid of Specifications */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-3 p-3.5 sm:p-4 text-xs sm:text-sm hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30 transition-colors"
            >
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 sm:col-span-1">
                {item.label}
              </dt>
              <dd className="font-mono text-neutral-900 dark:text-neutral-100 sm:col-span-2 mt-0.5 sm:mt-0">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Features bullet breakdown if present */}
      {product.features && product.features.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Key Architectural Highlights
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {product.features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 p-2.5 rounded-xl bg-neutral-100/60 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white mt-1.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { VariantGroup, VariantOption } from '../../types';
import { Check, AlertCircle } from 'lucide-react';

interface ProductVariantsProps {
  variantGroups: VariantGroup[];
  selectedVariants: Record<string, string>;
  onSelectVariant: (groupName: string, optionId: string) => void;
  validationErrors?: Record<string, string>;
}

export function ProductVariants({
  variantGroups,
  selectedVariants,
  onSelectVariant,
  validationErrors = {},
}: ProductVariantsProps) {
  if (!variantGroups || variantGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" id="product-variants">
      {variantGroups.map((group) => {
        const selectedOptionId = selectedVariants[group.name];
        const selectedOption = group.options.find((o) => o.id === selectedOptionId);
        const error = validationErrors[group.name];

        return (
          <div key={group.id || group.name} className="space-y-2.5">
            {/* Group Header: Name, Current Selection, & Requirement */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-neutral-900 dark:text-white">
                  {group.name}
                </span>
                {group.required && (
                  <span className="text-amber-600 dark:text-amber-400 text-xs font-mono">
                    *required
                  </span>
                )}
                {selectedOption && (
                  <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                    — {selectedOption.name}
                  </span>
                )}
              </div>

              {/* Price offset hint if selected */}
              {selectedOption && (selectedOption.priceOffset || selectedOption.priceOverride) && (
                <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-300">
                  {selectedOption.priceOverride
                    ? `$${selectedOption.priceOverride.toFixed(2)}`
                    : selectedOption.priceOffset && selectedOption.priceOffset > 0
                    ? `+$${selectedOption.priceOffset.toFixed(2)}`
                    : `-$${Math.abs(selectedOption.priceOffset || 0).toFixed(2)}`}
                </span>
              )}
            </div>

            {/* Validation Alert */}
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 animate-fadeIn">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Options Renderers based on Group Type */}
            {group.type === 'color' ? (
              /* Color Swatches */
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={group.name}>
                {group.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isOutOfStock = option.inStock === false;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isOutOfStock}
                      onClick={() => onSelectVariant(group.name, option.id)}
                      className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        isOutOfStock
                          ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 opacity-50 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-neutral-950 dark:border-white bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                      }`}
                      title={isOutOfStock ? `${option.name} (Sold Out)` : option.name}
                    >
                      {/* Color Dot Swatch */}
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                        style={{ backgroundColor: option.colorHex || '#ccc' }}
                      />
                      <span>{option.name}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            ) : group.type === 'size' ? (
              /* Size Buttons */
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={group.name}>
                {group.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isOutOfStock = option.inStock === false;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isOutOfStock}
                      onClick={() => onSelectVariant(group.name, option.id)}
                      className={`flex flex-col items-center justify-center min-w-[72px] px-3.5 py-2 rounded-xl border text-xs transition-all ${
                        isOutOfStock
                          ? 'border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900/40 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-neutral-950 dark:border-white bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900 font-medium'
                      }`}
                    >
                      <span>{option.name}</span>
                      {option.priceOffset && option.priceOffset > 0 && (
                        <span
                          className={`text-[10px] font-mono mt-0.5 ${
                            isSelected ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          +${option.priceOffset.toFixed(0)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Material or Custom Variant Selector */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label={group.name}>
                {group.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isOutOfStock = option.inStock === false;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isOutOfStock}
                      onClick={() => onSelectVariant(group.name, option.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                        isOutOfStock
                          ? 'border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900/40 cursor-not-allowed'
                          : isSelected
                          ? 'border-neutral-950 dark:border-white bg-neutral-950/5 dark:bg-white/5 ring-1 ring-neutral-950 dark:ring-white font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                              : 'border-neutral-300 dark:border-neutral-700'
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                        </div>
                        <span className={isOutOfStock ? 'line-through' : ''}>{option.name}</span>
                      </div>

                      {isOutOfStock ? (
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          Out of stock
                        </span>
                      ) : option.priceOffset && option.priceOffset > 0 ? (
                        <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                          +${option.priceOffset.toFixed(2)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

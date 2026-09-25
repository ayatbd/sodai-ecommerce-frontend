import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, disabled, checked, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="flex items-start space-x-2.5">
        <div className="relative flex items-center pt-0.5">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            disabled={disabled}
            checked={checked}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded border border-neutral-300 bg-white text-neutral-900 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-neutral-200',
              'checked:bg-neutral-900 checked:border-neutral-900 dark:checked:bg-neutral-100 dark:checked:border-neutral-100',
              'cursor-pointer',
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-1 h-3 w-3 text-white dark:text-neutral-950 opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="grid gap-1 leading-none">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none',
                  disabled && 'cursor-not-allowed opacity-70'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
            )}
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

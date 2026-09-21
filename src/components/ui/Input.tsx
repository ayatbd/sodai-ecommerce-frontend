import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, helperText, prefixIcon, suffixIcon, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1',
              'dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-neutral-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              prefixIcon ? 'pl-10' : 'pl-3',
              suffixIcon ? 'pr-10' : 'pr-3',
              error
                ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500'
                : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600',
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 flex items-center text-neutral-400 dark:text-neutral-500">
              {suffixIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

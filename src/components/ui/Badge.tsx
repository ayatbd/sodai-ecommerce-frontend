import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    default:
      'border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
    secondary:
      'border-transparent bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
    outline:
      'border-neutral-300 text-neutral-800 dark:border-neutral-700 dark:text-neutral-200',
    destructive:
      'border-transparent bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    success:
      'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

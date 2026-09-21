import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    const variants = {
      info: 'border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200',
      success:
        'border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200',
      warning:
        'border-amber-200 bg-amber-50/50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200',
      destructive:
        'border-red-200 bg-red-50/50 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200',
    };

    const icons = {
      info: <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />,
      success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />,
      warning: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />,
      destructive: <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />,
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative flex w-full gap-3 rounded-lg border p-4 text-sm leading-relaxed',
          variants[variant],
          className
        )}
        {...props}
      >
        {icons[variant]}
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('font-medium leading-tight tracking-tight', className)} {...props} />
  )
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-xs opacity-90', className)} {...props} />
  )
);
AlertDescription.displayName = 'AlertDescription';

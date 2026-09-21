import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  const [hasError, setHasError] = useState(!src);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full font-medium select-none bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 items-center justify-center border border-neutral-200 dark:border-neutral-700',
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="uppercase">{fallback.slice(0, 2)}</span>
      )}
    </div>
  );
}

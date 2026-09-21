import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'right' | 'left' | 'bottom';
  className?: string;
  title?: string;
  description?: string;
}

export function Sheet({
  open,
  onOpenChange,
  children,
  side = 'right',
  className,
  title,
  description,
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  const slideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      layoutClasses: 'right-0 top-0 h-full w-full max-w-md sm:max-w-lg border-l',
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
      layoutClasses: 'left-0 top-0 h-full w-full max-w-sm border-r',
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
      layoutClasses: 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t',
    },
  };

  const currentVariant = slideVariants[side];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Panel */}
          <motion.div
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className={cn(
              'fixed z-50 flex flex-col bg-white shadow-2xl dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
              currentVariant.layoutClasses,
              className
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-6 py-4 shrink-0">
                <div>
                  {title && (
                    <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  aria-label="Close panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* If no header was passed, still provide close button */}
            {!title && !description && (
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Drawer alias for semantics
export const Drawer = Sheet;

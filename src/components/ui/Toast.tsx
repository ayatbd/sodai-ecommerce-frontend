import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeToast } from '../../store/slices/uiSlice';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ToastMessage } from '../../types';

export function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dispatch(removeToast(toast.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    default: <Info className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    destructive: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const borders = {
    default: 'border-neutral-200 dark:border-neutral-800',
    info: 'border-blue-200 dark:border-blue-800',
    success: 'border-emerald-200 dark:border-emerald-800',
    destructive: 'border-red-200 dark:border-red-800',
  };

  const type = toast.type || 'default';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg dark:bg-neutral-900',
        borders[type]
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

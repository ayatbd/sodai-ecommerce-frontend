import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
  const activeValue = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = (val: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = ctx.value === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        isActive
          ? 'text-neutral-950 dark:text-neutral-50 shadow-xs'
          : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabPill"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
          className="absolute inset-0 rounded-md bg-white dark:bg-neutral-900 shadow-xs"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');

  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('mt-3 ring-offset-white focus-visible:outline-none focus-visible:ring-2', className)}
    >
      {children}
    </div>
  );
}

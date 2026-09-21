import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setSelectedCategory, setCurrentView, addToast } from '../../store/slices/uiSlice';
import { Shield, Truck, RotateCcw, Award, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Footer() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      dispatch(
        addToast({
          title: 'Invalid Email',
          description: 'Please provide a valid email address.',
          type: 'destructive',
        })
      );
      return;
    }
    setSubscribed(true);
    dispatch(
      addToast({
        title: 'Welcome to AURA Circle',
        description: 'Check your inbox for your 15% welcome code.',
        type: 'success',
      })
    );
    setEmail('');
  };

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 transition-colors">
      {/* Brand value pillars */}
      <div className="border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Carbon Neutral</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Electric logistics fleet</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Lifetime Craft</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Guaranteed structural integrity</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">30-Day Studio Trial</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Hassle-free complimentary returns</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Pure Form Factor</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Material purity & honest design</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer directory */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold text-xs">
                AU
              </div>
              <span className="text-base font-bold tracking-tight text-neutral-950 dark:text-white">
                AURA STUDIO
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              Crafting minimal, architectural everyday artifacts that balance sensory acoustics, precision ergonomics, and sustainable material honesty.
            </p>

            <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2 pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Join the newsletter for release drops..."
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <Button type="submit" size="sm" variant="default" className="shrink-0 gap-1 text-xs">
                <span>Join</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </form>
          </div>

          {/* Catalog links */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory('audio'));
                    dispatch(setCurrentView('shop'));
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Acoustics & Sound
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory('workspace'));
                    dispatch(setCurrentView('shop'));
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Workspace & Tech
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory('living'));
                    dispatch(setCurrentView('shop'));
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Living & Interior
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory('carry'));
                    dispatch(setCurrentView('shop'));
                  }}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Bags & EDC
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button
                  onClick={() => dispatch(setCurrentView('orders'))}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Track Shipments
                </button>
              </li>
              <li>
                <button
                  onClick={() => dispatch(setCurrentView('addresses'))}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Saved Addresses
                </button>
              </li>
              <li>
                <span className="text-neutral-400 dark:text-neutral-500">Care & Maintenance</span>
              </li>
              <li>
                <span className="text-neutral-400 dark:text-neutral-500">Warranty Registration</span>
              </li>
            </ul>
          </div>

          {/* Platform Console */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Store Operations
            </h5>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button
                  onClick={() => dispatch(setCurrentView('admin'))}
                  className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline"
                >
                  Admin Console
                </button>
              </li>
              <li>
                <span className="text-neutral-400 dark:text-neutral-500">Redux Toolkit Architecture</span>
              </li>
              <li>
                <span className="text-neutral-400 dark:text-neutral-500">RTK Query Invalidation</span>
              </li>
              <li>
                <span className="text-neutral-400 dark:text-neutral-500">Stripe Elements Layer</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-150 pt-8 sm:flex-row dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            © {new Date().getFullYear()} AURA Studio Inc. All rights reserved. Built with modern TypeScript, Redux Toolkit &amp; RTK Query.
          </p>
          <div className="flex gap-4 text-xs text-neutral-400">
            <span className="hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer">Privacy</span>
            <span className="hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer">Supply Chain Transparency</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

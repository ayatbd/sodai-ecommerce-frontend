import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Globe,
  Coins,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import {
  setSelectedCategory,
  setCurrentView,
  setSearchQuery,
  addToast,
} from '../../store/slices/uiSlice';
import { useSubscribeNewsletterMutation } from '../../services/api';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';

// Newsletter Form Validation Schema
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid work or personal email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

type ModalContentKey =
  | 'contact'
  | 'faq'
  | 'shipping'
  | 'returns'
  | 'about'
  | 'careers'
  | 'blog'
  | 'privacy'
  | 'terms'
  | null;

export function Footer() {
  const dispatch = useAppDispatch();

  // Active Informational Modal State
  const [activeModal, setActiveModal] = useState<ModalContentKey>(null);

  // Language & Currency State
  const [language, setLanguage] = useState('English (US)');
  const [currency, setCurrency] = useState('USD ($)');

  // Newsletter subscription mutation
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();
  const [newsletterStatus, setNewsletterStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onNewsletterSubmit = async (data: NewsletterFormData) => {
    try {
      const res = await subscribeNewsletter({ email: data.email }).unwrap();
      setNewsletterStatus({
        type: 'success',
        message: res.message || 'Thank you for joining the AURA dispatch.',
      });
      reset();
      dispatch(
        addToast({
          title: 'Newsletter Subscribed',
          description: 'Welcome to AURA private previews & archive updates.',
          type: 'success',
        })
      );
    } catch {
      setNewsletterStatus({
        type: 'error',
        message: 'Could not complete subscription. Please try again.',
      });
    }
  };

  // Navigators
  const navigateToCatalog = (category: string = 'all') => {
    dispatch(setSelectedCategory(category));
    dispatch(setSearchQuery(''));
    dispatch(setCurrentView('shop'));
    if (typeof window !== 'undefined') {
      if (category === 'all') {
        window.history.pushState({}, '', '/shop');
      } else {
        window.history.pushState({}, '', `/categories/${category}`);
      }
    }
    const el = document.getElementById('catalog-grid') || document.getElementById('product-listing-content');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLanguage(val);
    dispatch(
      addToast({
        title: 'Region Updated',
        description: `Language set to ${val}.`,
        type: 'info',
      })
    );
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrency(val);
    dispatch(
      addToast({
        title: 'Currency Updated',
        description: `Store currency switched to ${val}.`,
        type: 'info',
      })
    );
  };

  return (
    <>
      <footer className="border-t border-neutral-200/80 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
        {/* Core Pillars Ribbon */}
        <div className="border-b border-neutral-150 dark:border-neutral-800/60">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                  <Truck className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Complimentary Delivery</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Carbon-neutral on orders $150+</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                  <ShieldCheck className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">10-Year Craft Guarantee</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Precision aerospace aluminum</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                  <RotateCcw className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">30-Day Studio Trial</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Hassle-free return collection</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                  <Sparkles className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Architectural Restraint</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Sensory tactility & acoustics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Directory Grid */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            {/* 1. Store Information & Socials */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-mono text-xs font-bold dark:bg-white dark:text-neutral-900 shadow-xs">
                  AU
                </div>
                <div>
                  <span className="font-extrabold tracking-widest text-base text-neutral-950 dark:text-white font-mono">
                    AURA
                  </span>
                  <span className="block text-[9px] text-neutral-400 uppercase tracking-widest font-sans -mt-0.5">
                    Design & Lifestyle
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm">
                Architectural precision, tactile resonance, and enduring material integrity. Crafting minimalist workspace instruments and conscious living artifacts designed to outlast trends.
              </p>

              {/* Social Media Links with Accessible Labels */}
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
                  Follow Studio Dispatches
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="AURA on Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="AURA on Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="AURA on X (formerly Twitter)"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="AURA on YouTube"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="AURA on TikTok"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                  >
                    <Music2 className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Shop Links */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono">
                Shop
              </h5>
              <nav aria-label="Footer Shop Navigation">
                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li>
                    <button
                      onClick={() => navigateToCatalog('all')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      All Products
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToCatalog('all')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      New Arrivals
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToCatalog('all')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Best Sellers
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToCatalog('all')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Featured Products
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToCatalog('workspace')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Categories & Disciplines
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* 3. Customer Service */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono">
                Customer Care
              </h5>
              <nav aria-label="Footer Customer Care Navigation">
                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li>
                    <button
                      onClick={() => setActiveModal('contact')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('faq')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Frequently Asked Questions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('shipping')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Shipping Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('returns')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Return Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => dispatch(setCurrentView('orders'))}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left font-medium text-neutral-900 dark:text-neutral-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Track Order & Invoices
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        dispatch(setCurrentView('login'));
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', '/login');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Member Sign In & Access
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* 4. Company Links */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono">
                Company
              </h5>
              <nav aria-label="Footer Company Navigation">
                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li>
                    <button
                      onClick={() => setActiveModal('about')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('careers')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Careers & Atelier
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('blog')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Design Journal & Essays
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('privacy')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('terms')}
                      className="transition-colors hover:text-neutral-950 dark:hover:text-white text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
                    >
                      Terms of Service
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* 5. Newsletter Signup */}
            <div className="space-y-3 lg:col-span-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono">
                Studio Gazette
              </h5>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Receive private release invitations and material essays.
              </p>

              {newsletterStatus.type === 'success' ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-[11px] font-medium leading-tight">{newsletterStatus.message}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onNewsletterSubmit)} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email..."
                      aria-label="Footer newsletter email input"
                      {...register('email')}
                      className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
                    />
                  </div>

                  {errors.email && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.email.message}</span>
                    </p>
                  )}

                  {newsletterStatus.type === 'error' && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{newsletterStatus.message}</span>
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubscribing}
                    className="w-full justify-center gap-1.5 text-xs font-semibold rounded-xl"
                  >
                    <span>{isSubscribing ? 'Subscribing...' : 'Subscribe to Drops'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* 6. Payment & Security Information */}
          <div className="mt-12 pt-8 border-t border-neutral-150 dark:border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Lock className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                Encrypted 256-bit SSL secure checkout powered by Stripe Elements. No raw payment data stored.
              </span>
            </div>

            {/* Supported Payment Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                VISA
              </span>
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                Mastercard
              </span>
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                AMEX
              </span>
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                Apple Pay
              </span>
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                Google Pay
              </span>
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[10px] font-bold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                Stripe
              </span>
            </div>
          </div>

          {/* 7. Footer Bottom Section */}
          <div className="mt-8 pt-6 border-t border-neutral-150 dark:border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <p>
              &copy; {new Date().getFullYear()} AURA Studio Inc. All rights reserved. Designed for mindful workspaces.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-xs"
              >
                Terms of Service
              </button>

              {/* Language Selector */}
              <div className="relative inline-flex items-center gap-1.5 ml-2">
                <Globe className="h-3.5 w-3.5 text-neutral-400" />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  aria-label="Select store language"
                  className="rounded-lg border border-neutral-200 bg-white py-1 pl-2 pr-6 text-xs text-neutral-700 hover:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 cursor-pointer"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Français">Français</option>
                  <option value="Deutsch">Deutsch</option>
                  <option value="日本語">日本語</option>
                </select>
              </div>

              {/* Currency Selector */}
              <div className="relative inline-flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-neutral-400" />
                <select
                  value={currency}
                  onChange={handleCurrencyChange}
                  aria-label="Select store currency"
                  className="rounded-lg border border-neutral-200 bg-white py-1 pl-2 pr-6 text-xs text-neutral-700 hover:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 cursor-pointer"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="JPY (¥)">JPY (¥)</option>
                  <option value="CAD ($)">CAD ($)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Accessible Informational Dialogs */}
      {/* 1. Contact Us Dialog */}
      <Dialog
        open={activeModal === 'contact'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Studio Concierge</DialogTitle>
          <DialogDescription>
            Speak directly with our engineering and design team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>
            Whether you require tailored architectural workspace consultations, custom bulk orders, or technical support for your acoustic gear, our concierge is at your service.
          </p>
          <div className="space-y-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 p-4 border border-neutral-200 dark:border-neutral-800 text-xs">
            <div>
              <strong className="text-neutral-900 dark:text-white">Email:</strong>{' '}
              <a href="mailto:concierge@aura-studio.design" className="text-blue-600 hover:underline">
                concierge@aura-studio.design
              </a>
            </div>
            <div>
              <strong className="text-neutral-900 dark:text-white">Direct Line:</strong>{' '}
              <span className="font-mono">+1 (800) 287-2026</span>
            </div>
            <div>
              <strong className="text-neutral-900 dark:text-white">Operating Hours:</strong>{' '}
              <span>Monday – Friday, 09:00 – 18:00 EST</span>
            </div>
            <div>
              <strong className="text-neutral-900 dark:text-white">Atelier Address:</strong>{' '}
              <span>740 Broadway, Floor 8, New York, NY 10003</span>
            </div>
          </div>
        </div>
      </Dialog>

      {/* 2. FAQ Dialog */}
      <Dialog
        open={activeModal === 'faq'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Frequently Asked Questions</DialogTitle>
          <DialogDescription>
            Common questions regarding materials, guarantees, and dispatch.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="border-b border-neutral-150 dark:border-neutral-800 pb-3">
            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">
              What materials are used in AURA products?
            </h4>
            <p>
              We machine each core enclosure from aerospace-grade 6063 anodized aluminum, balanced with Italian vegetable-tanned leather and acoustic phosphor bronze.
            </p>
          </div>
          <div className="border-b border-neutral-150 dark:border-neutral-800 pb-3">
            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">
              How does the 10-Year Craft Guarantee work?
            </h4>
            <p>
              We guarantee structural durability and electrical mechanics for a decade. If any hinge, potentiometer, or chassis fastener fails under normal studio usage, we repair or replace it free of charge.
            </p>
          </div>
          <div className="border-b border-neutral-150 dark:border-neutral-800 pb-3">
            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">
              What is the 30-Day Studio Trial?
            </h4>
            <p>
              Experience our objects in your personal workspace for 30 calendar days. If it does not bring spatial clarity, return it in original packaging for a 100% refund.
            </p>
          </div>
        </div>
      </Dialog>

      {/* 3. Shipping Policy Dialog */}
      <Dialog
        open={activeModal === 'shipping'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Shipping & Logistics Policy</DialogTitle>
          <DialogDescription>
            Carbon-neutral courier dispatch and transit specifications.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>
            All shipments originate from our climate-controlled distribution center in Newark, NJ or Amsterdam, NL. Orders placed before 14:00 EST depart on the same business day.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Domestic Express:</strong> 2–3 business days via carbon-neutral courier ($15, or free over $150).</li>
            <li><strong>Overnight Priority:</strong> 1 business day ($35 flat rate).</li>
            <li><strong>International Courier:</strong> 3–6 business days with pre-cleared customs duties (DDP).</li>
          </ul>
        </div>
      </Dialog>

      {/* 4. Return Policy Dialog */}
      <Dialog
        open={activeModal === 'returns'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Return & Exchange Policy</DialogTitle>
          <DialogDescription>
            30-day effortless trial period.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>
            We take pride in every millimeter of our objects. If you wish to return an item:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Navigate to <strong>Track Order & Invoices</strong> and select &ldquo;Request Return Label&rdquo;.</li>
            <li>Repackage the artifact in its original molded pulp packaging and protective sleeve.</li>
            <li>Affix the prepaid courier label and drop it off at any authorized courier depot.</li>
          </ol>
          <p className="text-neutral-400 pt-1">
            Refunds are issued to your original payment method within 48 hours of inspection.
          </p>
        </div>
      </Dialog>

      {/* 5. About Us Dialog */}
      <Dialog
        open={activeModal === 'about'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">About AURA Studio</DialogTitle>
          <DialogDescription>
            A manifesto of material integrity and quiet intention.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>
            AURA was founded by a collective of industrial designers, architects, and acoustic engineers who grew tired of disposable consumer electronics.
          </p>
          <p>
            We adhere to the doctrine of <em>less, but better</em>. Our designs celebrate unadorned metals, honest weight, and tactile click mechanisms that bring mindful presence to daily work.
          </p>
        </div>
      </Dialog>

      {/* 6. Careers Dialog */}
      <Dialog
        open={activeModal === 'careers'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Careers & Atelier Openings</DialogTitle>
          <DialogDescription>
            Build enduring objects with our international team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>We are currently welcoming applications for:</p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <span className="font-bold text-neutral-900 dark:text-white block text-xs">Senior Industrial Designer</span>
              <span className="text-neutral-500">New York, NY / Hybrid • Solid aluminum CMF & mechanical architecture</span>
            </div>
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <span className="font-bold text-neutral-900 dark:text-white block text-xs">Acoustics & Transducer Engineer</span>
              <span className="text-neutral-500">Kyoto, JP / Remote • Custom driver tuning & dampening</span>
            </div>
          </div>
          <p className="text-neutral-500">Send portfolios to <span className="font-mono text-neutral-800 dark:text-neutral-200">talent@aura-studio.design</span>.</p>
        </div>
      </Dialog>

      {/* 7. Blog / Design Journal Dialog */}
      <Dialog
        open={activeModal === 'blog'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Design Journal & Essays</DialogTitle>
          <DialogDescription>
            Dispatches on material science, acoustics, and minimalism.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <article className="border-b border-neutral-150 dark:border-neutral-800 pb-2">
            <span className="text-[10px] font-mono text-neutral-400">ESSAY 04 • SEPTEMBER 2026</span>
            <h4 className="font-bold text-neutral-900 dark:text-white mt-0.5 text-xs">
              The Tactile Resonance of Anodized Aluminum Enclosures
            </h4>
            <p className="text-neutral-500 mt-1">
              Examining structural rigidity and vibration dampening in compact near-field desktop acoustic monitors.
            </p>
          </article>
          <article className="pb-2">
            <span className="text-[10px] font-mono text-neutral-400">ESSAY 03 • AUGUST 2026</span>
            <h4 className="font-bold text-neutral-900 dark:text-white mt-0.5 text-xs">
              Why We Ban Synthetic Coatings on Italian Leathers
            </h4>
            <p className="text-neutral-500 mt-1">
              Embracing natural patina, tallow treatments, and the longevity of vegetable tanning over plastic polymer finishes.
            </p>
          </article>
        </div>
      </Dialog>

      {/* 8. Privacy Policy Dialog */}
      <Dialog
        open={activeModal === 'privacy'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
          <DialogDescription>
            Our commitment to total data dignity and cryptographic encryption.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>
            At AURA, we believe your personal data is sacred. We strictly enforce:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Zero Data Brokerage:</strong> We never sell, rent, or monetize customer records to third-party ad networks.</li>
            <li><strong>Encrypted Checkout:</strong> Payment telemetry is tokenized via Stripe Elements with 256-bit SSL encryption.</li>
            <li><strong>GDPR & CCPA Rights:</strong> You may request full erasure of your account and saved addresses at any time.</li>
          </ul>
        </div>
      </Dialog>

      {/* 9. Terms of Service Dialog */}
      <Dialog
        open={activeModal === 'terms'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        maxWidth="lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Terms of Service</DialogTitle>
          <DialogDescription>
            Sales conditions and operational terms.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 py-2 leading-relaxed">
          <p>
            By accessing or purchasing from AURA Studio, you agree to our standard terms governing artifact warranty, authorized residential and commercial studio use, and intellectual property.
          </p>
          <p>
            All custom engravings and limited-edition archive units are produced under certified European and North American consumer protection laws.
          </p>
        </div>
      </Dialog>
    </>
  );
}

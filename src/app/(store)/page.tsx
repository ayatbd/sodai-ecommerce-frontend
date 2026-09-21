import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Compass,
  ArrowDown,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSelectedCategory,
  setCurrentView,
  setSearchQuery,
  addToast,
} from '../../store/slices/uiSlice';
import {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetCategoriesQuery,
  useSubscribeNewsletterMutation,
} from '../../services/api';
import { ProductCard } from '../../features/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';

// Newsletter Form Schema
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid work or personal email address'),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

// Verified Testimonials
const TESTIMONIALS = [
  {
    id: 'test-1',
    quote:
      'The AURA Studio mechanical keyboard has completely altered my relationship with typing. The tactile weight and acoustics are truly sublime.',
    author: 'Elena Rostova',
    role: 'Principal Architect, Studio OMA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    product: 'Lumbar Aluminum Mechanical Keyboard',
  },
  {
    id: 'test-2',
    quote:
      'Every single edge, seam, and dial feels deliberate. Their desk mat and monitor riser transformed my studio into an oasis of focus.',
    author: 'Julian Thorne',
    role: 'Design Director, Monocle Media',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    product: 'Artisanal Full-Grain Desk Mat',
  },
  {
    id: 'test-3',
    quote:
      'Customer support was extraordinary when I needed an international courier expedited. A rare luxury brand with genuine integrity.',
    author: 'Sophia Chen',
    role: 'Creative Lead, Pentagram',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    product: 'Anodized Counterbalance Task Lamp',
  },
];

export default function HomePage() {
  const dispatch = useAppDispatch();

  // RTK Query endpoints
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const {
    data: featuredProducts = [],
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    refetch: refetchFeatured,
  } = useGetFeaturedProductsQuery();
  const { data: newArrivals = [], isLoading: isNewArrivalsLoading } = useGetNewArrivalsQuery();
  const { data: allProducts = [] } = useGetProductsQuery();

  // Derive Best Sellers by rating and review count
  const bestSellers = React.useMemo(() => {
    return [...allProducts]
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, 4);
  }, [allProducts]);

  // Newsletter mutation
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetNewsletter,
    formState: { errors: newsletterErrors },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
  });

  const onNewsletterSubmit = async (data: NewsletterFormValues) => {
    try {
      const res = await subscribeNewsletter({ email: data.email }).unwrap();
      setNewsletterSuccess(res.message);
      resetNewsletter();
      dispatch(
        addToast({
          title: 'Welcome to AURA',
          description: 'You are now registered for private studio dispatches.',
          type: 'success',
        })
      );
    } catch {
      dispatch(
        addToast({
          title: 'Subscription Error',
          description: 'Unable to register email at this moment. Please try again.',
          type: 'destructive',
        })
      );
    }
  };

  // Testimonials carousel index
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Navigation handlers
  const handleShopNow = () => {
    dispatch(setSelectedCategory('all'));
    dispatch(setSearchQuery(''));
    dispatch(setCurrentView('shop'));
    const el = document.getElementById('featured-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategory = (catSlug: string) => {
    dispatch(setSelectedCategory(catSlug));
    dispatch(setCurrentView('shop'));
    const el = document.getElementById('catalog-grid');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Structured Data (JSON-LD) for SEO & rich snippet discovery
  useEffect(() => {
    document.title = 'AURA — Modern Lifestyle & Architectural Design Store';

    // Meta description tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Discover AURA, a modern lifestyle and workspace brand designing precision instruments, acoustic monitors, task lighting, and tactile leather goods.'
    );

    // OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'AURA — Modern Lifestyle & Architectural Design Store');
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        'Shop enduring objects engineered from aerospace aluminum, vegetable-tanned leather, and acoustic components.'
      );
    }

    // Insert structured data JSON-LD script
    const schemaScriptId = 'aura-schema-jsonld';
    let schemaScript = document.getElementById(schemaScriptId);
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaScriptId;
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'AURA Store',
      description: 'Modern Lifestyle & Architectural Design Instruments',
      url: 'https://aura-studio.design',
      priceRange: '$$$',
      currenciesAccepted: 'USD',
      paymentAccepted: 'Credit Card, Apple Pay, Google Pay, Stripe',
      openingHours: 'Mo-Su',
    });
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[85vh] sm:min-h-[88vh] flex items-center">
        {/* Background Artwork with Optical Gradient Mask */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2000&auto=format&fit=crop"
            alt="Minimalist architectural workspace and tactile design objects"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-transparent to-neutral-950/40" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 w-full">
          <div className="max-w-3xl space-y-6">
            {/* Promotional Badge with subtle entrance */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700/80 bg-neutral-900/90 px-3.5 py-1.5 text-xs font-mono tracking-widest text-neutral-300 backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>AUTUMN / WINTER 2026 ARCHIVE • LIMITED EDITIONS</span>
            </motion.div>

            {/* Semantic H1 Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]"
            >
              Instruments for Mindful Living & Creative Workspaces
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-neutral-300 leading-relaxed max-w-2xl font-normal"
            >
              Every artifact is machined from solid aerospace-grade aluminum, full-grain Italian leather, and acoustic bronze. Designed with architectural restraint to outlast trends.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Button
                size="lg"
                onClick={handleShopNow}
                className="bg-white text-neutral-950 hover:bg-neutral-100 font-semibold px-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <span>Shop Now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('featured-categories');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-neutral-700 bg-neutral-900/60 text-white hover:bg-neutral-800 hover:border-neutral-500 backdrop-blur-xs font-medium"
              >
                <Compass className="mr-2 h-4 w-4 text-neutral-400" />
                <span>Explore Collection</span>
              </Button>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center gap-6 pt-6 text-xs text-neutral-400 border-t border-neutral-800/80"
            >
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-400" />
                <span>Complimentary courier shipping over $150</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-neutral-300" />
                <span>10-Year Craftsmanship Guarantee</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator prompt */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-neutral-500 text-[11px] font-mono tracking-widest uppercase">
          <span>Scroll</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section id="featured-categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Curated Disciplines
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Featured Categories
            </h2>
          </div>
          <p className="mt-2 sm:mt-0 text-sm text-neutral-500 max-w-md">
            Architectural solutions tailored to elevate your spatial workflow and acoustic atmosphere.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isCategoriesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))
            : categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-300">
                        {cat.productCount} Artifacts
                      </span>
                      <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-neutral-300 line-clamp-1 mt-1 font-light">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-950 dark:group-hover:text-white">
                    <span>Explore {cat.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section id="featured-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Studio Highlights</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Featured Products
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={handleShopNow}
            className="mt-3 sm:mt-0 self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Loading Skeletons */}
        {isFeaturedLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isFeaturedError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <h3 className="text-base font-semibold text-red-900 dark:text-red-200">
              Unable to load featured artifacts
            </h3>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              There was an issue connecting to the catalog store.
            </p>
            <Button variant="outline" onClick={() => refetchFeatured()} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isFeaturedLoading && !isFeaturedError && featuredProducts.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 p-12 text-center dark:border-neutral-800">
            <Compass className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              No featured artifacts currently listed
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Browse our complete catalog to discover in-stock items.
            </p>
            <Button onClick={handleShopNow} className="mt-4">
              Explore All Items
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isFeaturedLoading && !isFeaturedError && featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW ARRIVALS (With Horizontal Scroll on Mobile) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Just Released
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              New Arrivals
            </h2>
          </div>
          <span className="text-xs text-neutral-500 hidden sm:block">
            Freshly engineered batches from the Kyoto and Berlin workshops.
          </span>
        </div>

        {/* Horizontal scroll container on mobile, clean grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none">
          {isNewArrivalsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[260px] sm:min-w-0 shrink-0 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            : newArrivals.map((product) => (
                <div key={product.id} className="min-w-[280px] sm:min-w-0 shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 text-white shadow-2xl">
          {/* Background Artwork with contrast protection */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1800&auto=format&fit=crop"
              alt="Artisanal studio workbench"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center opacity-35"
            />
            <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/40" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl space-y-4">
            <Badge variant="outline" className="border-amber-400/40 text-amber-300 font-mono">
              <Tag className="mr-1.5 h-3 w-3" />
              ANNUAL STUDIO ARCHIVE PROMO
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Enjoy 15% Off Your First Architectural Artifact
            </h2>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Elevate your desk, studio, and acoustic setup with enduring materials. Apply code{' '}
              <strong className="text-white font-mono bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
                AURA15
              </strong>{' '}
              at checkout. Includes complimentary courier delivery and insurance.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Button
                onClick={handleShopNow}
                className="bg-white text-neutral-950 hover:bg-neutral-100 font-semibold shadow-lg"
              >
                <span>Claim Offer & Shop</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 font-mono">
              Most Coveted
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Best Sellers
            </h2>
          </div>
          <span className="text-xs text-neutral-500 hidden sm:block">
            Consistently rated 4.9+ by industrial designers and software craftspeople.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. STORE BENEFITS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-8 sm:p-10 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Benefit 1 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white">
                <Truck className="h-6 w-6 text-neutral-900 dark:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Complimentary Shipping
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Courier tracking and carbon-neutral transit included on all orders over $150.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white">
                <ShieldCheck className="h-6 w-6 text-neutral-900 dark:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Secure Encrypted Payment
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Direct Stripe Elements checkout with AES-256 bank-level data encryption.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white">
                <RefreshCw className="h-6 w-6 text-neutral-900 dark:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  30-Day Effortless Returns
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Not entirely satisfied? Return in original packaging for a no-questions refund.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white">
                <Headphones className="h-6 w-6 text-neutral-900 dark:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Studio Concierge Support
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Real industrial designers and support staff ready to assist 7 days a week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION (Keyboard-Accessible Carousel) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Voices of Craft
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Customer Testimonials
            </h2>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-neutral-400 px-1">
              {testimonialIndex + 1} / {TESTIMONIALS.length}
            </span>
            <button
              onClick={nextTestimonial}
              aria-label="Next testimonial"
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel Active Card */}
        <div
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') prevTestimonial();
            if (e.key === 'ArrowRight') nextTestimonial();
          }}
          className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 sm:p-12 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        >
          <div className="max-w-3xl space-y-6">
            {/* 5-Star Rating Display */}
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: TESTIMONIALS[testimonialIndex].rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <blockquote className="text-xl sm:text-2xl font-medium tracking-tight text-neutral-900 dark:text-white leading-relaxed">
              &ldquo;{TESTIMONIALS[testimonialIndex].quote}&rdquo;
            </blockquote>

            {/* Author Profile */}
            <div className="flex items-center gap-4 pt-2">
              <img
                src={TESTIMONIALS[testimonialIndex].avatar}
                alt={TESTIMONIALS[testimonialIndex].author}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
              />
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {TESTIMONIALS[testimonialIndex].author}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {TESTIMONIALS[testimonialIndex].role}
                </p>
                <span className="text-[11px] font-mono text-neutral-400 mt-0.5 block">
                  Purchased {TESTIMONIALS[testimonialIndex].product}
                </span>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="mt-8 flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === testimonialIndex ? 'w-8 bg-neutral-900 dark:bg-white' : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER SIGNUP SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 text-white p-8 sm:p-14 shadow-xl dark:border-neutral-800">
          <div className="max-w-xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 font-mono">
              The AURA Gazette
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Stay Informed on Limited Studio Runs & Material Essays
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Receive early invitations to seasonal collections, technical specifications, and architectural interviews. Strictly zero advertising fluff.
            </p>

            {newsletterSuccess ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="text-xs sm:text-sm font-medium">{newsletterSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onNewsletterSubmit)} className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Enter your email address..."
                      aria-label="Email for newsletter"
                      {...register('email')}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800/90 px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-white text-neutral-950 hover:bg-neutral-100 font-semibold px-6 shrink-0 py-3 h-auto"
                  >
                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>

                {newsletterErrors.email && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{newsletterErrors.email.message}</span>
                  </p>
                )}

                <p className="text-[11px] text-neutral-400">
                  Unsubscribe at any time with a single click. We respect your privacy.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL-TO-ACTION SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-neutral-200/80 bg-neutral-100/60 py-16 px-6 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 font-mono">
            Spatial Harmony
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-2xl mx-auto">
            Ready to Transform Your Creative & Physical Environment?
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto">
            Explore hundreds of meticulous workspace artifacts, acoustic instruments, and timeless accessories crafted for a lifetime.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={handleShopNow} className="px-8 shadow-md">
              <span>Explore Complete Catalog</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

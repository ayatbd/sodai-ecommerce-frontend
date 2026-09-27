import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useNavigateView } from "../../hooks/useNavigateView";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface AboutHeroProps {
  onContactClick?: () => void;
}

export function AboutHero({ onContactClick }: AboutHeroProps) {
  const navigate = useNavigateView();

  const handleShopClick = () => {
    navigate("shop");
  };

  const handleScrollToStory = () => {
    const el = document.getElementById("brand-story");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-labelledby="about-hero-heading"
      className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-neutral-200/80 dark:border-neutral-800"
    >
      {/* Background Subtle Gradient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-neutral-200/40 via-transparent to-transparent dark:from-neutral-800/25 blur-3xl opacity-60"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 md:space-y-8"
          >
            {/* Small Eyebrow Label */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1 text-xs tracking-wider uppercase font-mono font-medium gap-1.5 border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                Built with purpose
              </Badge>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                Est. 2021 • Stockholm & Tokyo
              </span>
            </div>

            {/* Strong H1 Heading */}
            <h1
              id="about-hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.1] text-balance"
            >
              Products designed for the way you{" "}
              <span className="underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-8">
                live
              </span>
              .
            </h1>

            {/* Brand Introduction */}
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl font-normal">
              <strong className="text-neutral-900 dark:text-white font-semibold">
                SODAI
              </strong>{" "}
              creates carefully selected products that combine quality,
              function, and modern design. We believe everyday objects should
              elevate human routines through enduring material integrity,
              sensory tactility, and architectural simplicity.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={handleShopClick}
                className="group px-7 py-3 text-sm font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-md"
              >
                <span>Shop Our Collection</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onContactClick || handleScrollToStory}
                className="px-6 py-3 text-sm font-medium rounded-xl border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <span>Contact Us</span>
              </Button>
            </div>

            {/* Trust & Craft Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200/80 dark:border-neutral-800/80 max-w-lg">
              <div>
                <span className="block text-2xl font-bold font-mono text-neutral-950 dark:text-white">
                  100%
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Traceable Materials
                </span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-neutral-950 dark:text-white">
                  10-Yr
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Repair Guarantee
                </span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-neutral-950 dark:text-white">
                  0%
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Plastic Packaging
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card frame */}
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1200&auto=format&fit=crop"
                  alt="Minimalist architectural workspace and tactile design instruments by SODAI"
                  className="w-full h-[420px] sm:h-[480px] object-cover object-center transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />

                {/* Subtle Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

                {/* Floating Bottom Card Badge */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block font-semibold">
                        Design Studio Spec
                      </span>
                      <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                        Aerospace Aluminum & Tuscan Leather
                      </h3>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shrink-0 font-mono text-xs font-bold">
                      SD
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Hand-inspected tolerances to within 0.05mm at our Nordic
                    facility.
                  </p>
                </div>
              </div>

              {/* Floating Decorative Accent Badge */}
              <div className="hidden sm:flex absolute -top-5 -left-5 items-center gap-2 rounded-2xl border border-neutral-200 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 animate-bounce [animation-duration:3s]">
                <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  Certified Carbon Neutral
                </span>
              </div>

              <div className="hidden sm:flex absolute -bottom-4 -right-4 items-center gap-2 rounded-2xl border border-neutral-200 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  Precision Engineering
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

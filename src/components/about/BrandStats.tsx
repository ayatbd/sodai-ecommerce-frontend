import {
  Award,
  Globe2,
  ShieldCheck,
  Sparkles,
  TreePine,
  Users,
} from "lucide-react";
import { Badge } from "../ui/Badge";

export function BrandStats() {
  const stats = [
    {
      icon: Users,
      value: "48,000+",
      label: "Mindful Spaces Furnished",
      subtext: "Across 45 countries worldwide",
    },
    {
      icon: ShieldCheck,
      value: "99.4%",
      label: "Customer Satisfaction",
      subtext: "Verified by 12,000+ reviews",
    },
    {
      icon: Award,
      value: "10-Year",
      label: "Comprehensive Warranty",
      subtext: "Free parts & modular repairs",
    },
    {
      icon: TreePine,
      value: "0%",
      label: "Single-Use Plastics",
      subtext: "100% unbleached pulp packaging",
    },
    {
      icon: Sparkles,
      value: "14",
      label: "Global Design Accolades",
      subtext: "Including Red Dot & Good Design",
    },
    {
      icon: Globe2,
      value: "100%",
      label: "Carbon Offset Logistics",
      subtext: "With certified climate partners",
    },
  ];

  return (
    <section
      aria-labelledby="brand-stats-heading"
      className="py-16 md:py-24 bg-neutral-900 text-white dark:bg-black border-y border-neutral-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono text-neutral-300 border-neutral-700 bg-neutral-800/80"
          >
            Measurable Impact
          </Badge>
          <h2
            id="brand-stats-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white"
          >
            Numbers that define our integrity.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            Real metrics reflecting our dedication to human ergonomics,
            sustainable manufacturing, and uncompromising hardware.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-neutral-800 bg-neutral-850/60 p-8 text-center sm:text-left transition-all hover:border-neutral-700 hover:bg-neutral-800/80 group"
              >
                <div className="flex items-center justify-center sm:justify-between mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    {stat.value}
                  </span>
                  <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700">
                    <Icon className="h-5 w-5 text-neutral-300" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-100 mb-1">
                  {stat.label}
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  {stat.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

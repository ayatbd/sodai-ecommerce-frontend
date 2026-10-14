import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  RefreshCcw, 
  HeartHandshake, 
  Wrench,
  CheckCircle
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export function ValuesSection() {
  const values = [
    {
      icon: ShieldCheck,
      number: '01',
      title: 'Uncompromising Materiality',
      description:
        'We reject synthetic composites and hollow plastics. Every enclosure is carved from solid billet aluminum, complemented by Italian vegetable-tanned leather and Japanese acoustic damping.',
      badge: 'Materials',
    },
    {
      icon: Sparkles,
      number: '02',
      title: 'Intentional Minimalism',
      description:
        'Clarity over clutter. We eliminate aggressive LEDs, garish logos, and superficial decorations to honor pure geometric proportions and quiet tactile satisfaction.',
      badge: 'Aesthetics',
    },
    {
      icon: Scale,
      number: '03',
      title: 'Radical Transparency',
      description:
        'Every mineral, alloy, and finish in our catalog is 100% traceable. We publish complete bill-of-materials breakdowns with zero undisclosed chemicals or conflict materials.',
      badge: 'Integrity',
    },
    {
      icon: Wrench,
      number: '04',
      title: 'Right to Repair',
      description:
        'Planned obsolescence is an environmental offense. Our products use standard Torx fasteners, user-swappable modular components, and freely downloadable repair manuals.',
      badge: 'Longevity',
    },
    {
      icon: HeartHandshake,
      number: '05',
      title: 'Fair Atelier Alliances',
      description:
        'We do not exploit low-cost sweatshops. We partner directly with historic workshops across Sweden, Germany, and Japan, guaranteeing safe conditions and living wages.',
      badge: 'Humanity',
    },
    {
      icon: RefreshCcw,
      number: '06',
      title: 'Closed-Loop Circularity',
      description:
        'Our unbleached cardboard packaging is 100% plastic-free and recyclable. Our "SODAI Second Life" program buys back retired units to refurbish or recycle into new billet.',
      badge: 'Ecology',
    },
  ];

  return (
    <section id="values" aria-labelledby="values-heading" className="py-20 md:py-28 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono">
            Core Principles
          </Badge>
          <h2 id="values-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            The values that anchor our discipline.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We don’t measure success merely by quarterly units moved, but by the generational longevity of the artifacts we release into your world.
          </p>
        </div>

        {/* 6-Card Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {values.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.number}
                className="group relative rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-8 transition-all duration-300 hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 shadow-xs group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
                    <Icon className="h-6 w-6 text-neutral-800 dark:text-neutral-200 group-hover:text-white dark:group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400 dark:text-neutral-600">
                    {val.number}
                  </span>
                </div>

                <Badge variant="secondary" className="mb-2 text-[10px] uppercase font-mono tracking-wider">
                  {val.badge}
                </Badge>

                <h3 className="text-lg font-bold text-neutral-950 dark:text-white mb-2 tracking-tight">
                  {val.title}
                </h3>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

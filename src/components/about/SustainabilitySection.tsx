import React from 'react';
import { 
  Leaf, 
  Recycle, 
  ShieldCheck, 
  Droplets, 
  Package, 
  Wind, 
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function SustainabilitySection() {
  const commitments = [
    {
      icon: Package,
      title: '100% Plastic-Free Unbleached Packaging',
      description:
        'Every SODAI box is engineered from FSC-certified unbleached Kraft paper and molded sugarcane bagasse pulp. We use natural vegetable-oil inks and zero polybags or petroleum-based blister packs.',
      stat: '0 Grams Plastic',
    },
    {
      icon: Droplets,
      title: 'Hydro-Powered Aluminum Smelting',
      description:
        'Our billet aluminum is extruded exclusively in Nordic facilities powered 100% by regional hydroelectric run-of-river turbines, emitting less than 4.0 kg CO2 per kg of finished alloy (industry average: 16.8 kg).',
      stat: '-74% Carbon Footprint',
    },
    {
      icon: Recycle,
      title: 'The "SODAI Second Life" Circular Trade-In',
      description:
        'When you’re ready to upgrade or reconfigure your space, send your retired unit back. We meticulously inspect, restore, and certify it for our archive market, or cleanly re-smelt the metals with zero landfill waste.',
      stat: 'Circular Guarantee',
    },
    {
      icon: Wind,
      title: 'Carbon-Neutral Freight & Local Warehousing',
      description:
        'By maintaining regional fulfillment hubs across Europe, the Americas, and Asia, we minimize air freight emissions and offset 100% of final-mile delivery miles in partnership with DHL GoGreen.',
      stat: '100% Offset Logistics',
    },
  ];

  return (
    <section id="sustainability" aria-labelledby="sustainability-heading" className="py-20 md:py-28 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40">
            Ecological Responsibility
          </Badge>
          <h2 id="sustainability-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            Designed to honor the planet it inhabits.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Sustainability is not an afterthought marketing campaign at SODAI; it is an architectural boundary condition established before the first sketch is drawn.
          </p>
        </div>

        {/* Highlight Feature Banner */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white overflow-hidden shadow-2xl mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-emerald-300 backdrop-blur-xs">
                <Leaf className="h-3.5 w-3.5" />
                <span>Our 10-Year Anti-Obsolescence Covenant</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                No glue. No planned death dates. 100% repairable architecture.
              </h3>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                Most consumer electronics are deliberately glued shut to force premature upgrades. We assemble every SODAI instrument with exposed, precision-threaded Torx fasteners, allowing modular replacement of switches, PCBs, batteries, and acoustic foam pads.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Free open-source CAD & teardowns</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Guaranteed replacement parts for 10 yrs</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Non-destructive disassembly</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Free mail-in repair diagnostic service</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full min-h-[380px] relative overflow-hidden bg-neutral-800">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop"
                alt="Sustainable Scandinavian forestry and sustainable materials"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-950/40 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-neutral-900/90 backdrop-blur-md p-4 border border-neutral-700">
                <p className="text-xs font-mono text-neutral-300 uppercase tracking-widest">
                  Nordic Hydroelectric Smelters
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  100% recycled billet alloy verified under ISO 14021 standards.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {commitments.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-8 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-neutral-200/80 dark:bg-neutral-800 px-3 py-1 font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {item.stat}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-950 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

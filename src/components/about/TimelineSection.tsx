import React, { useState } from 'react';
import { Calendar, ChevronRight, Sparkles, Milestone } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function TimelineSection() {
  const [selectedMilestone, setSelectedMilestone] = useState(0);

  const milestones = [
    {
      year: '2021',
      title: 'The Studio Sketchbook',
      badge: 'Genesis',
      summary:
        'Founded in a shared industrial loft in Stockholm by Elena Rostova and Marcus Vance. The first three prototypes of our Lumbar Mechanical Keyboard and Desk Valet were hand-milled on a vintage 3-axis CNC router.',
      details: [
        'Initial run of 250 numbered mechanical boards sold out in 14 minutes.',
        'Established our foundational ethos: zero plastic enclosures, ever.',
        'Established our first collaboration with Swedish anodizing ateliers.',
      ],
      image:
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1000&auto=format&fit=crop',
    },
    {
      year: '2022',
      title: 'Hydroelectric Aluminum Lab',
      badge: 'Innovation',
      summary:
        'Partnered with Nordic aluminum smelters powered exclusively by hydroelectricity, dropping our raw material carbon footprint by 74% compared to industry averages.',
      details: [
        'Formulated our proprietary matte bead-blast texture (Texture 04).',
        'Partnered with historic vegetable tanneries in Santa Croce sull’Arno, Italy.',
        'Won our first Red Dot Best-of-the-Best Design Award.',
      ],
      image:
        'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop',
    },
    {
      year: '2023',
      title: 'Global Direct Flagship',
      badge: 'Scale',
      summary:
        'Scaled direct-to-consumer delivery to 45 countries with 100% carbon-offset freight, zero plastic mailers, and local warehousing in Europe, North America, and Japan.',
      details: [
        'Welcomed our 25,000th creative studio customer.',
        'Eliminated all foam inserts in favor of custom-molded recycled paper pulp.',
        'Launched the Gifu Stoneware ceramic acoustics collection.',
      ],
      image:
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop',
    },
    {
      year: '2024',
      title: 'The 10-Year Repair Pledge',
      badge: 'Circularity',
      summary:
        'Pioneered the consumer electronics industry’s boldest longevity commitment: every product guaranteed with readily available modular replacement parts and step-by-step video teardowns.',
      details: [
        'Released open-source exploded CAD schematics for all legacy models.',
        'Opened free physical repair counters in Stockholm, Berlin, and Tokyo.',
        'Launched the "SODAI Second Life" trade-in and refurbishment program.',
      ],
      image:
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop',
    },
    {
      year: '2025',
      title: 'Atmospheric & Living Artifacts',
      badge: 'Evolution',
      summary:
        'Expanded our design vocabulary into acoustic lighting, ergonomic seating, and tactile ceramic vessels designed for mindful living spaces and studios.',
      details: [
        'Introduced the Halo Anodized Task Lamp with warm dimming LED engine.',
        'Reached 48,000+ homes and creative workspaces worldwide.',
        'Ranked among the top sustainable hardware independent studios in Europe.',
      ],
      image:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
    },
    {
      year: 'Today & Beyond',
      title: '100% Closed-Loop Hardware',
      badge: 'Horizon',
      summary:
        'Forging ahead with our mission to achieve true 100% circularity: collecting every scrap of retired SODAI aluminum and re-smelting it into tomorrow’s master editions.',
      details: [
        'Developing bio-composite vegan finishes sourced from Scandinavian timber waste.',
        'Expanding global community workshops and collaborative design labs.',
        'Continuing our steadfast refusal to follow fast-paced disposable trends.',
      ],
      image:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  const active = milestones[selectedMilestone];

  return (
    <section id="timeline" aria-labelledby="timeline-heading" className="py-20 md:py-28 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono">
            Evolution
          </Badge>
          <h2 id="timeline-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
            Our evolutionary journey.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            From three hand-milled keyboard prototypes in a freezing Nordic winter to a globally recognized design brand.
          </p>
        </div>

        {/* Milestone Navigation Bar */}
        <div className="mb-10 overflow-x-auto pb-4">
          <div className="flex items-center gap-2 min-w-max">
            {milestones.map((m, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMilestone(idx)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-mono font-medium transition-all ${
                  selectedMilestone === idx
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md font-bold'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{m.year}</span>
                <span className="text-[10px] opacity-70 uppercase tracking-widest hidden sm:inline">
                  • {m.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Milestone Card */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Content Area */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black font-mono text-neutral-950 dark:text-white">
                  {active.year}
                </span>
                <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider">
                  {active.badge}
                </Badge>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                {active.title}
              </h3>

              <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {active.summary}
              </p>

              {/* Specific Milestone Bullet Accomplishments */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Key Milestones Achieved:
                </span>
                {active.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <ChevronRight className="h-4 w-4 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Archival Photo */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full min-h-[360px] relative overflow-hidden bg-neutral-200 dark:bg-neutral-800">
              <img
                src={active.image}
                alt={`${active.title} - ${active.year}`}
                className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-950/15 pointer-events-none" />
              <div className="absolute bottom-4 right-4 rounded-xl bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-mono text-neutral-300">
                Archive Ref: SD-{active.year.replace(/[^0-9]/g, '') || 'FUTURE'}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

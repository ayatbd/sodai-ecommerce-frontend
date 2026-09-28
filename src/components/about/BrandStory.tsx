import { Hammer, Layers, Quote } from "lucide-react";
import { Badge } from "../ui/Badge";

export function BrandStory() {
  return (
    <section
      id="brand-story"
      aria-labelledby="brand-story-heading"
      className="py-20 md:py-28 bg-white dark:bg-neutral-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono"
          >
            Origin & Craft
          </Badge>
          <h2
            id="brand-story-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-tight"
          >
            From a quiet studio sketch to enduring living artifacts.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            SODAI was founded in 2021 by a cross-disciplinary team of industrial
            architects, acoustics engineers, and heritage craftspeople. We came
            together with a singular conviction: modern life deserves objects
            created with patience, precision, and permanence.
          </p>
        </div>

        {/* Editorial Story Layout: Split Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Story Canvas */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop"
                alt="SODAI design atelier showing materials and prototyping tools"
                className="w-full h-[400px] sm:h-[460px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-300 block mb-1">
                  Stockholm Studio • 2021
                </span>
                <p className="text-sm font-medium leading-snug text-neutral-100">
                  Where our earliest clay models and CNC toolpaths were
                  hand-calibrated.
                </p>
              </div>
            </div>

            {/* Secondary Accent Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/70 dark:bg-neutral-900/50">
                <Hammer className="h-5 w-5 text-neutral-700 dark:text-neutral-300 mb-2" />
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Subtractive Milling
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Solid aluminum billets carved into seamless, unibody
                  enclosures with zero rattling seams.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/70 dark:bg-neutral-900/50">
                <Layers className="h-5 w-5 text-neutral-700 dark:text-neutral-300 mb-2" />
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Acoustic Damping
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Multi-layered PORON foams tuned to eliminate harsh high
                  frequencies in daily desk interaction.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Narrative & Pull Quote */}
          <div className="lg:col-span-6 space-y-8">
            <div className="prose prose-neutral dark:prose-invert text-base leading-relaxed text-neutral-600 dark:text-neutral-300 space-y-4">
              <p>
                In a consumer landscape saturated with disposable plastic
                peripherals and built-in obsolescence, we set out to build an
                alternative: tools and living objects engineered to outlast the
                devices they connect with.
              </p>
              <p>
                Every SODAI product begins not with a price point or marketing
                brief, but with a question:{" "}
                <em className="text-neutral-900 dark:text-white font-medium">
                  How can this object bring calm, tactility, and sensory
                  satisfaction to the human user who touches it every day?
                </em>
              </p>
              <p>
                We source aerospace 6000-series billet aluminum from Nordic
                hydroelectric smelters, vegetable-tanned full-grain leather from
                family-run tanneries in Tuscany, and organic stoneware from
                artisans in Gifu, Japan. By respecting each material’s natural
                character, we create items that patina gracefully over decades
                of daily use.
              </p>
            </div>

            {/* Editorial Quote Card */}
            <div className="relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/70 p-6 sm:p-8">
              <Quote className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mb-3" />
              <blockquote className="text-base sm:text-lg font-serif italic text-neutral-900 dark:text-neutral-100 leading-relaxed">
                “In an era of disposable artifacts, we choose permanence. Every
                curve, chamfer, and acoustic tolerance must earn its place in
                your space.”
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                    alt="Elena Rostova, Chief Creative Officer at SODAI"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                    Elena Rostova
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Co-Founder & Chief Creative Officer
                  </p>
                </div>
              </div>
            </div>

            {/* Core Pillars Bullet Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-mono font-bold text-white dark:bg-neutral-100 dark:text-neutral-950">
                  01
                </span>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Architectural Restraint
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    No flashy LEDs or excessive logos. Pure proportions and
                    unadorned surfaces.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-mono font-bold text-white dark:bg-neutral-100 dark:text-neutral-950">
                  02
                </span>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Sensory Calibration
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Weighted bases, satisfying mechanical detents, and soft
                    matte anodized finishes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-mono font-bold text-white dark:bg-neutral-100 dark:text-neutral-950">
                  03
                </span>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Lifelong Serviceability
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Standardized fasteners, replaceable switch assemblies, and
                    openly available schematics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

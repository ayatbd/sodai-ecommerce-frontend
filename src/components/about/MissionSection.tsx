import { CheckCircle2, Compass, Eye, Target } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/Badge";

type MissionTab = "mission" | "vision" | "philosophy";

export function MissionSection() {
  const [activeTab, setActiveTab] = useState<MissionTab>("mission");

  const content = {
    mission: {
      badge: "Purpose",
      title: "Elevating daily routines into rituals of quiet focus.",
      description:
        "Our mission is to craft mindful lifestyle objects and workspace instruments that transform everyday friction into tactile joy. We believe that your immediate environment profoundly shapes your mental clarity, creative output, and peace of mind.",
      points: [
        "Eliminating sensory fatigue with acoustically dampened mechanisms and glare-free finishes.",
        "Prioritizing ergonomic human factors tested across thousands of hours of creative work.",
        "Empowering users with serviceable, repairable objects that remain beloved fixtures over decades.",
      ],
      metric: "48k+",
      metricLabel: "Mindful Spaces Transformed",
      image:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
    },
    vision: {
      badge: "Future Outlook",
      title:
        "A world anchored by generational stewardship, not disposable quarters.",
      description:
        "We envision an intentional future where consumers invest in fewer, better artifacts designed to outlast fast-paced trend cycles. In our vision, products are engineered to be maintained, repaired, and cherished through generations rather than discarded in landfills.",
      points: [
        "Championing circular economy practices with zero single-use plastics and closed-loop aluminum.",
        "Establishing permanent repair hubs in major design capitals across North America, Europe, and Asia.",
        "Publishing open schematics and modular hardware parts so every owner can maintain their tools.",
      ],
      metric: "100%",
      metricLabel: "Carbon Neutral Global Logistics",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    },
    philosophy: {
      badge: "Design DNA",
      title: "The resonance between Scandinavian Lagom and Japanese Shibui.",
      description:
        "Our design philosophy is anchored in the harmony between Nordic functional restraint and Japanese appreciation for subtle, unobtrusive perfection. True luxury is not loud ornamentation; it is the quiet confidence of perfect weight, flawless chamfers, and authentic materials.",
      points: [
        "Form follows human feeling — physical feedback that feels natural to touch and operate.",
        "No decorative bloat, gratuitous lights, or branded logos stamped across primary surfaces.",
        "Honoring the aging process: anodized metals and vegetable hides develop richer character over time.",
      ],
      metric: "0.05mm",
      metricLabel: "Architectural CNC Tolerance",
      image:
        "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1200&auto=format&fit=crop",
    },
  };

  const active = content[activeTab];

  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      className="py-20 md:py-28 bg-neutral-50/70 dark:bg-neutral-900/40 border-y border-neutral-200/80 dark:border-neutral-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono"
          >
            Guiding North Star
          </Badge>
          <h2
            id="mission-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white"
          >
            Driven by intention.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            Every product decision at SODAI is guided by our tripartite
            commitment to human well-being, radical material honesty, and
            ecological stewardship.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur-xs">
            <button
              onClick={() => setActiveTab("mission")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "mission"
                  ? "bg-white text-neutral-950 shadow-md dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Our Mission</span>
            </button>

            <button
              onClick={() => setActiveTab("vision")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "vision"
                  ? "bg-white text-neutral-950 shadow-md dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Our Vision</span>
            </button>

            <button
              onClick={() => setActiveTab("philosophy")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "philosophy"
                  ? "bg-white text-neutral-950 shadow-md dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Design Philosophy</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Card Content */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content Area */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 space-y-6">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider"
              >
                {active.badge}
              </Badge>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-snug">
                {active.title}
              </h3>

              <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {active.description}
              </p>

              <div className="space-y-3 pt-2">
                {active.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* Metric Callout */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800/80 flex items-baseline gap-3">
                <span className="text-3xl font-black font-mono text-neutral-950 dark:text-white">
                  {active.metric}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
                  {active.metricLabel}
                </span>
              </div>
            </div>

            {/* Right Image Showcase */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full min-h-[340px] relative overflow-hidden bg-neutral-100 dark:bg-neutral-900">
              <img
                src={active.image}
                alt={active.title}
                className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-neutral-900/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

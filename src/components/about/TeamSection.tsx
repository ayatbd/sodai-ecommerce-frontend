import React, { useState } from 'react';
import { Linkedin, Twitter, Mail, Sparkles, Filter } from 'lucide-react';
import { Badge } from '../ui/Badge';

type Department = 'all' | 'design' | 'engineering' | 'sustainability';

export function TeamSection() {
  const [activeDept, setActiveDept] = useState<Department>('all');

  const team = [
    {
      name: 'Elena Rostova',
      role: 'Co-Founder & Chief Creative Officer',
      dept: 'design',
      bio: 'Former lead architect at Studio OMA. Elena directs the architectural silhouettes, tactile restraint, and spatial presence of every SODAI instrument.',
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      location: 'Stockholm, Sweden',
      quote: 'Objects should quietly hold space, not scream for attention.',
    },
    {
      name: 'Marcus Vance',
      role: 'Co-Founder & Head of Industrial Design',
      dept: 'design',
      bio: '15 years specializing in precision aerospace unibody structures and acoustic detents. Obsessed with 0.05mm chamfer tolerances and sensory feedback.',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      location: 'Stockholm, Sweden',
      quote: 'If an enclosure squeaks or flexes, we tear it down and start again.',
    },
    {
      name: 'Kenji Takahashi',
      role: 'Master of Acoustic & Materials Engineering',
      dept: 'engineering',
      bio: 'Trained in Tokyo and Gifu. Kenji leads our vibration isolation research, PORON foam layer tuning, and traditional stoneware partnerships.',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
      location: 'Tokyo, Japan',
      quote: 'Sound is tactile. It informs the hand before the ear even registers.',
    },
    {
      name: 'Sophia Lin',
      role: 'Director of Sustainable Sourcing & Ateliers',
      dept: 'sustainability',
      bio: 'Pioneered our low-carbon hydroelectric aluminum pipeline and certified vegetable tanning partnerships throughout Scandinavia and Italy.',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
      location: 'Copenhagen, Denmark',
      quote: 'Luxury without provenance and circularity is an empty facade.',
    },
    {
      name: 'David Alvarez',
      role: 'Lead Ergonomics & Human Factors Researcher',
      dept: 'engineering',
      bio: 'Biomechanical specialist studying wrist tension, tactile key depression profiles, and posture alignment for digital craftspeople.',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
      location: 'Berlin, Germany',
      quote: 'Good ergonomics isn’t clinical; it feels like an effortless extension of you.',
    },
    {
      name: 'Amara Okafor',
      role: 'Head of Brand Experience & Repair Network',
      dept: 'sustainability',
      bio: 'Oversees the global 10-Year Repair Pledge, customer concierge, and community design salons across Europe and North America.',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
      location: 'London, UK',
      quote: 'When someone buys a SODAI piece, that is the start of a ten-year relationship.',
    },
  ];

  const filteredTeam =
    activeDept === 'all' ? team : team.filter((m) => m.dept === activeDept);

  return (
    <section id="team" aria-labelledby="team-heading" className="py-20 md:py-28 bg-neutral-50/70 dark:bg-neutral-900/40 border-y border-neutral-200/80 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono">
              The Collective
            </Badge>
            <h2 id="team-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              The architects behind the craft.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
              A tight-knit collective of industrial designers, acousticians, and materials researchers united by a disdain for the disposable.
            </p>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/80 self-start md:self-auto">
            {(
              [
                { id: 'all', label: 'All Roles' },
                { id: 'design', label: 'Design' },
                { id: 'engineering', label: 'Engineering' },
                { id: 'sustainability', label: 'Stewardship' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDept(tab.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeDept === tab.id
                    ? 'bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeam.map((member, idx) => (
            <div
              key={idx}
              className="group rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Member Image with Aspect Ratio */}
              <div className="relative h-72 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Location Badge */}
                <div className="absolute top-4 right-4 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-mono text-neutral-200">
                  {member.location}
                </div>

                {/* Name & Role overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-neutral-300">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {member.bio}
                </p>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850">
                  <p className="text-xs italic text-neutral-500 dark:text-neutral-400">
                    “{member.quote}”
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

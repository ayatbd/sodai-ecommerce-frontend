import React, { useEffect } from 'react';
import { AboutHero } from '../../../components/about/AboutHero';
import { BrandStory } from '../../../components/about/BrandStory';
import { MissionSection } from '../../../components/about/MissionSection';
import { ValuesSection } from '../../../components/about/ValuesSection';
import { BrandStats } from '../../../components/about/BrandStats';
import { TimelineSection } from '../../../components/about/TimelineSection';
import { TeamSection } from '../../../components/about/TeamSection';
import { SustainabilitySection } from '../../../components/about/SustainabilitySection';
import { AboutCta } from '../../../components/about/AboutCta';

export default function AboutPage() {
  // Sync document title and meta description for SEO
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'About Us — SODAI | Modern Lifestyle & Design Store';

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalMetaContent = metaDesc?.getAttribute('content') || '';

    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Discover SODAI: Our story, architectural design philosophy, 10-year repair covenant, sustainable Nordic aluminum craft, and the team engineering enduring living artifacts.'
      );
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalMetaContent) {
        metaDesc.setAttribute('content', originalMetaContent);
      }
    };
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact-inquiries');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Structured Data (JSON-LD) for Search Engine Optimization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SODAI',
    legalName: 'SODAI Design Studio AB',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://sodai-design.com',
    logo: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=300&auto=format&fit=crop',
    foundingDate: '2021',
    founders: [
      {
        '@type': 'Person',
        name: 'Elena Rostova',
        jobTitle: 'Chief Creative Officer',
      },
      {
        '@type': 'Person',
        name: 'Marcus Vance',
        jobTitle: 'Head of Industrial Design',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sveavägen 48',
      addressLocality: 'Stockholm',
      postalCode: '111 34',
      addressCountry: 'SE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'concierge@sodai-design.com',
      availableLanguage: ['English', 'Swedish', 'Japanese'],
    },
    sameAs: [
      'https://instagram.com/sodai_studio',
      'https://twitter.com/sodai_studio',
      'https://facebook.com/sodai_studio',
    ],
  };

  return (
    <article className="min-h-screen bg-white dark:bg-neutral-950 transition-colors">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sub-navigation Anchor Bar */}
      <nav 
        aria-label="About Page Section Navigation" 
        className="sticky top-16 z-30 hidden md:block border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80 transition-colors"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 overflow-x-auto text-xs font-mono">
            <span className="font-bold tracking-wider text-neutral-950 dark:text-white uppercase shrink-0 mr-4">
              SODAI Studio
            </span>
            <div className="flex items-center gap-1 sm:gap-4 shrink-0 text-neutral-500 dark:text-neutral-400">
              <a
                href="#brand-story"
                className="hover:text-neutral-950 dark:hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                Story
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#mission"
                className="hover:text-neutral-950 dark:hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                Mission & Vision
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#values"
                className="hover:text-neutral-950 dark:hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                Values
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#timeline"
                className="hover:text-neutral-950 dark:hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                Evolution
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#team"
                className="hover:text-neutral-950 dark:hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                Collective
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#sustainability"
                className="hover:text-neutral-950 dark:hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                Stewardship
              </a>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href="#contact-inquiries"
                className="hover:text-neutral-950 dark:hover:text-white px-2 py-1 rounded-md transition-colors text-amber-600 dark:text-amber-400 font-semibold"
              >
                Inquiries
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <AboutHero onContactClick={scrollToContact} />

      {/* 2. Brand Story Section */}
      <BrandStory />

      {/* 3. Mission & Vision Section */}
      <MissionSection />

      {/* 4. Values Section */}
      <ValuesSection />

      {/* 5. Brand Stats Section */}
      <BrandStats />

      {/* 6. Timeline Section */}
      <TimelineSection />

      {/* 7. Team Section */}
      <TeamSection />

      {/* 8. Sustainability Section */}
      <SustainabilitySection />

      {/* 9. About CTA & Inquiries Section */}
      <AboutCta />
    </article>
  );
}

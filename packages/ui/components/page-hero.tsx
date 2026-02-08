import React from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable page hero component with consistent dark theme
 * Used across all pages (landing, browse, blog, etc.) for visual consistency
 */
export function PageHero({ title, description, children, className = '' }: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="page-hero-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="rgb(148, 163, 184)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#page-hero-grid)" />
        </svg>
      </div>

      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-primary-500/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-info-500/10 to-transparent" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-neutral-300 mb-8">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

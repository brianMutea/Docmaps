import React from 'react';

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  gridId?: string;
}

/**
 * Reusable page section with consistent dark theme
 * Use this for any content section that needs the dark background with grid pattern
 */
export function PageSection({ children, className = '', gridId = 'page-section-grid' }: PageSectionProps) {
  return (
    <section className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id={gridId}
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
          <rect width="100%" height="100%" fill={`url(#${gridId})`} />
        </svg>
      </div>

      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-primary-500/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-info-500/10 to-transparent" />

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </section>
  );
}

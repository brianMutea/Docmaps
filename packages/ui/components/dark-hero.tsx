import React from 'react';

interface DarkHeroProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable dark hero section with grid pattern and gradient overlays
 * Used across landing, browse, and other pages for consistent theming
 */
export function DarkHero({ children, className = '' }: DarkHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="dark-hero-grid"
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
          <rect width="100%" height="100%" fill="url(#dark-hero-grid)" />
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

interface DarkSectionProps {
  children: React.ReactNode;
  className?: string;
  gridId?: string;
}

/**
 * Reusable dark section with grid pattern and gradient overlays
 * Use this for any section that needs the consistent dark theme
 */
export function DarkSection({ children, className = '', gridId = 'dark-section-grid' }: DarkSectionProps) {
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

/**
 * Dark-themed search input component
 */
interface DarkSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
}

export function DarkSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  className = ''
}: DarkSearchInputProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 text-base bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
        />
      </div>
    </form>
  );
}

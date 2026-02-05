/**
 * Component Utility Classes
 * 
 * Reusable Tailwind class combinations for consistent component styling.
 * Use these to avoid duplication and ensure consistency across components.
 */

export const componentUtils = {
  // ============================================
  // BUTTONS
  // ============================================
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    
    // Sizes
    size: {
      xs: 'px-2.5 py-1.5 text-xs rounded-md',
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-sm rounded-lg',
      lg: 'px-5 py-3 text-base rounded-xl',
      xl: 'px-6 py-3.5 text-base rounded-xl',
    },

    // Variants
    variant: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/20 shadow-md hover:shadow-lg',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500/20',
      accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500/20 shadow-md hover:shadow-lg',
      ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500/20',
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500/20 shadow-md hover:shadow-lg',
      success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500/20 shadow-md hover:shadow-lg',
    },
  },

  // ============================================
  // CARDS
  // ============================================
  card: {
    base: 'rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200',
    hover: 'hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5',
    interactive: 'cursor-pointer',
    elevated: 'shadow-lg border-neutral-300',
  },

  // ============================================
  // INPUTS
  // ============================================
  input: {
    base: 'w-full px-4 py-2.5 text-base rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
    error: 'border-error-500 focus:ring-error-500/20 focus:border-error-500',
    success: 'border-success-500 focus:ring-success-500/20 focus:border-success-500',
  },

  // ============================================
  // BADGES
  // ============================================
  badge: {
    base: 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
    
    variant: {
      primary: 'bg-primary-100 text-primary-700 border border-primary-200',
      accent: 'bg-accent-100 text-accent-700 border border-accent-200',
      success: 'bg-success-100 text-success-700 border border-success-200',
      warning: 'bg-warning-100 text-warning-700 border border-warning-200',
      error: 'bg-error-100 text-error-700 border border-error-200',
      neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    },
  },

  // ============================================
  // PANELS & CONTAINERS
  // ============================================
  panel: {
    base: 'rounded-xl border border-neutral-200 bg-white shadow-sm',
    header: 'px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-neutral-50',
    body: 'p-6',
    footer: 'px-6 py-4 border-t border-neutral-100 bg-neutral-50',
  },

  // ============================================
  // HEADERS & TYPOGRAPHY
  // ============================================
  header: {
    sticky: 'sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm',
    base: 'border-b border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-sm',
  },

  text: {
    heading: {
      h1: 'text-4xl font-bold text-neutral-900',
      h2: 'text-3xl font-bold text-neutral-900',
      h3: 'text-2xl font-bold text-neutral-900',
      h4: 'text-xl font-semibold text-neutral-900',
      h5: 'text-lg font-semibold text-neutral-900',
      h6: 'text-base font-semibold text-neutral-900',
    },
    body: {
      lg: 'text-lg text-neutral-700 leading-relaxed',
      base: 'text-base text-neutral-700 leading-relaxed',
      sm: 'text-sm text-neutral-600 leading-relaxed',
      xs: 'text-xs text-neutral-500 leading-relaxed',
    },
    muted: 'text-neutral-500 text-sm',
    accent: 'text-accent-600 font-semibold',
    primary: 'text-primary-600 font-semibold',
  },

  // ============================================
  // DIVIDERS
  // ============================================
  divider: {
    horizontal: 'border-t border-neutral-200',
    vertical: 'border-l border-neutral-200',
  },

  // ============================================
  // FOCUS STATES
  // ============================================
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2',
    ringAccent: 'focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-2',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transition: {
    fast: 'transition-all duration-150 ease-out',
    base: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out',
  },

  // ============================================
  // UTILITIES
  // ============================================
  util: {
    truncate: 'truncate',
    lineClamp: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
    },
    scrollbar: {
      thin: 'scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent',
      hide: 'scrollbar-hide',
    },
  },
};

/**
 * Combine multiple utility classes
 * @example
 * combineClasses(componentUtils.button.base, componentUtils.button.size.md, componentUtils.button.variant.primary)
 */
export function combineClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Create a component class factory
 * @example
 * const buttonClasses = createClassFactory(componentUtils.button.base, {
 *   size: componentUtils.button.size,
 *   variant: componentUtils.button.variant,
 * });
 * 
 * buttonClasses({ size: 'md', variant: 'primary' })
 */
export function createClassFactory(
  base: string,
  variants: Record<string, Record<string, string>>
) {
  return (options: Record<string, string>) => {
    const classes = [base];
    
    Object.entries(options).forEach(([key, value]) => {
      if (variants[key] && variants[key][value]) {
        classes.push(variants[key][value]);
      }
    });
    
    return classes.join(' ');
  };
}

/**
 * Tailwind Configuration Extension
 * 
 * Extends Tailwind with custom theme tokens for dark, premium UI.
 * Import this in your tailwind.config.ts to apply the design system.
 * 
 * Usage in tailwind.config.ts:
 * import { tailwindThemeExtension } from '@docmaps/ui/theme/tailwind-config';
 * 
 * export default {
 *   theme: {
 *     extend: tailwindThemeExtension,
 *   },
 * };
 */

import { themeTokens } from './tokens';

export const tailwindThemeExtension = {
  colors: {
    // Neutrals
    neutral: themeTokens.colors.neutral,
    
    // Primary (Blue)
    primary: themeTokens.colors.primary,
    blue: themeTokens.colors.primary,
    
    // Accent (Golden)
    accent: themeTokens.colors.accent,
    gold: themeTokens.colors.accent,
    amber: themeTokens.colors.accent,
    
    // Semantic colors
    success: themeTokens.colors.success,
    warning: themeTokens.colors.warning,
    error: themeTokens.colors.error,
    info: themeTokens.colors.info,
    
    // Aliases for common usage
    gray: themeTokens.colors.neutral,
    green: themeTokens.colors.success,
    red: themeTokens.colors.error,
    yellow: themeTokens.colors.warning,
    cyan: themeTokens.colors.info,
  },

  spacing: themeTokens.spacing as Record<string, string>,

  borderRadius: themeTokens.borderRadius as Record<string, string>,

  boxShadow: themeTokens.shadows as Record<string, string>,

  fontFamily: {
    sans: themeTokens.typography.fontFamily.sans,
    mono: themeTokens.typography.fontFamily.mono,
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  } as Record<string, [string, Record<string, string>]>,

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  } as Record<string, string>,

  transitionDuration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },

  transitionTimingFunction: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    backdrop: '1040',
    offcanvas: '1050',
    modal: '1060',
    popover: '1070',
    tooltip: '1080',
  },

  // Custom utilities
  extend: {
    // Gradient backgrounds
    backgroundImage: {
      'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'gradient-accent': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      'gradient-error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      'gradient-subtle': 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    },

    // Custom animations
    animation: {
      'fade-in': 'fadeIn 0.2s ease-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'scale-in': 'scaleIn 0.2s ease-out',
      'shimmer': 'shimmer 1.5s infinite',
      'pulse-slow': 'pulse 3s ease-in-out infinite',
      'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
    },

    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      scaleIn: {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      bounceSubtle: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-4px)' },
      },
    },
  },
} as const;

export default tailwindThemeExtension;

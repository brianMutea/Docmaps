/**
 * Theme Resolver System for SVG Exporter
 * 
 * This module handles the conversion of theme tokens and CSS classes
 * to concrete visual properties for the render model.
 */

import type { ThemeContext, ResolvedStyles, NodeShape, BorderSpec, FillSpec } from './render-model';

// ============================================================================
// Theme Token Definitions
// ============================================================================

/**
 * DocMaps theme tokens and their concrete values
 */
export interface DocMapsTheme {
  colors: {
    // Node type colors
    product: string;
    feature: string;
    component: string;
    textBlock: string;
    group: string;
    
    // Status colors
    stable: string;
    beta: string;
    deprecated: string;
    experimental: string;
    
    // UI colors
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    
    // Edge colors
    hierarchy: string;
    dependency: string;
    integration: string;
    alternative: string;
    extension: string;
  };
  
  typography: {
    fontFamily: string[];
    sizes: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
    };
    weights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ============================================================================
// Default Theme
// ============================================================================

/**
 * Default DocMaps theme based on current design system
 */
export const DEFAULT_THEME: DocMapsTheme = {
  colors: {
    // Node type colors (matching current implementation)
    product: '#10b981',
    feature: '#3b82f6',
    component: '#8b5cf6',
    textBlock: '#64748b',
    group: '#6b7280',
    
    // Status colors
    stable: '#10b981',
    beta: '#3b82f6',
    deprecated: '#ef4444',
    experimental: '#f59e0b',
    
    // UI colors
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e5e7eb',
    text: {
      primary: '#111827',
      secondary: '#374151',
      muted: '#6b7280',
    },
    
    // Edge colors
    hierarchy: '#64748b',
    dependency: '#ef4444',
    integration: '#3b82f6',
    alternative: '#3b82f6',
    extension: '#8b5cf6',
  },
  
  typography: {
    fontFamily: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    sizes: {
      xs: 11,
      sm: 12,
      base: 14,
      lg: 16,
      xl: 18,
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
};

// ============================================================================
// Theme Resolver Interface
// ============================================================================

export interface ThemeResolver {
  /**
   * Resolve theme context to concrete theme values
   */
  resolve(context: ThemeContext): DocMapsTheme;
  
  /**
   * Get resolved styles for a node type
   */
  getNodeStyles(nodeType: string, customColor?: string, status?: string): ResolvedStyles;
  
  /**
   * Get resolved styles for an edge type
   */
  getEdgeStyles(edgeType: string): ResolvedStyles;
  
  /**
   * Get node shape definition for a node type
   */
  getNodeShape(nodeType: string): NodeShape;
  
  /**
   * Convert CSS color to hex format
   */
  normalizeColor(color: string): string;
}

// ============================================================================
// Theme Resolver Implementation
// ============================================================================

export class DocMapsThemeResolver implements ThemeResolver {
  private theme: DocMapsTheme;
  
  constructor(baseTheme: DocMapsTheme = DEFAULT_THEME) {
    this.theme = baseTheme;
  }
  
  resolve(context: ThemeContext): DocMapsTheme {
    // For now, return the base theme
    // In the future, this could apply dark mode transformations,
    // custom color overrides, etc.
    return {
      ...this.theme,
      colors: {
        ...this.theme.colors,
        // Apply primary color override if provided
        ...(context.primaryColor && { feature: context.primaryColor }),
        // Apply accent color overrides
        ...context.accentColors,
      },
      typography: {
        ...this.theme.typography,
        // Apply font family override if provided
        ...(context.typography?.fontFamily && {
          fontFamily: context.typography.fontFamily,
        }),
      },
    };
  }
  
  getNodeStyles(nodeType: string, customColor?: string, status?: string): ResolvedStyles {
    const resolvedTheme = this.theme;
    const baseColor = customColor || this.getNodeTypeColor(nodeType);
    
    const styles: ResolvedStyles = {
      fill: resolvedTheme.colors.background,
      stroke: resolvedTheme.colors.border,
      strokeWidth: 1,
    };
    
    // Add type-specific styling
    switch (nodeType) {
      case 'product':
        styles.filter = `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))`;
        break;
      case 'feature':
        styles.filter = `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))`;
        break;
      case 'component':
        styles.filter = `drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))`;
        styles.stroke = '#f3f4f6';
        break;
      case 'group':
        styles.strokeWidth = 2;
        styles.strokeDasharray = '5,5';
        styles.opacity = 0.8;
        break;
    }
    
    return styles;
  }
  
  getEdgeStyles(edgeType: string): ResolvedStyles {
    const resolvedTheme = this.theme;
    
    const baseStyles: ResolvedStyles = {
      fill: 'none',
      strokeWidth: 2,
    };
    
    switch (edgeType) {
      case 'hierarchy':
        return {
          ...baseStyles,
          stroke: resolvedTheme.colors.hierarchy,
        };
      case 'dependency':
        return {
          ...baseStyles,
          stroke: resolvedTheme.colors.dependency,
          strokeWidth: 3,
        };
      case 'integration':
        return {
          ...baseStyles,
          stroke: resolvedTheme.colors.integration,
        };
      case 'alternative':
        return {
          ...baseStyles,
          stroke: resolvedTheme.colors.alternative,
          strokeDasharray: '5,5',
        };
      case 'extension':
        return {
          ...baseStyles,
          stroke: resolvedTheme.colors.extension,
          strokeDasharray: '2,2',
        };
      default:
        return {
          ...baseStyles,
          stroke: resolvedTheme.colors.hierarchy,
        };
    }
  }
  
  getNodeShape(nodeType: string): NodeShape {
    const resolvedTheme = this.theme;
    
    switch (nodeType) {
      case 'product':
        return {
          type: 'rounded-rectangle',
          cornerRadius: resolvedTheme.borderRadius.lg,
          borders: [{
            side: 'all',
            width: 1,
            color: resolvedTheme.colors.border,
            style: 'solid',
          }],
          fills: [{
            type: 'gradient',
            color: resolvedTheme.colors.background,
            gradient: {
              type: 'linear',
              direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                { offset: 0, color: resolvedTheme.colors.background },
                { offset: 1, color: '#f8fafc' },
              ],
            },
          }],
        };
        
      case 'feature':
        return {
          type: 'rounded-rectangle',
          cornerRadius: resolvedTheme.borderRadius.lg,
          borders: [
            {
              side: 'all',
              width: 1,
              color: resolvedTheme.colors.border,
              style: 'solid',
            },
            {
              side: 'left',
              width: 4,
              color: resolvedTheme.colors.feature,
              style: 'solid',
            },
          ],
          fills: [{
            type: 'solid',
            color: resolvedTheme.colors.background,
          }],
        };
        
      case 'component':
        return {
          type: 'rounded-rectangle',
          cornerRadius: resolvedTheme.borderRadius.md,
          borders: [{
            side: 'all',
            width: 1,
            color: '#f3f4f6',
            style: 'solid',
          }],
          fills: [{
            type: 'solid',
            color: resolvedTheme.colors.background,
          }],
        };
        
      case 'textBlock':
        return {
          type: 'rounded-rectangle',
          cornerRadius: resolvedTheme.borderRadius.md,
          borders: [{
            side: 'all',
            width: 1,
            color: resolvedTheme.colors.border,
            style: 'solid',
          }],
          fills: [{
            type: 'solid',
            color: resolvedTheme.colors.background,
          }],
        };
        
      case 'group':
        return {
          type: 'rounded-rectangle',
          cornerRadius: resolvedTheme.borderRadius.xl,
          borders: [{
            side: 'all',
            width: 2,
            color: resolvedTheme.colors.border,
            style: 'dashed',
          }],
          fills: [{
            type: 'solid',
            color: 'transparent',
          }],
        };
        
      default:
        return {
          type: 'rounded-rectangle',
          cornerRadius: resolvedTheme.borderRadius.lg,
          borders: [{
            side: 'all',
            width: 1,
            color: resolvedTheme.colors.border,
            style: 'solid',
          }],
          fills: [{
            type: 'solid',
            color: resolvedTheme.colors.background,
          }],
        };
    }
  }
  
  normalizeColor(color: string): string {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return '#ffffff';
    }
    
    if (color.startsWith('#')) {
      return color;
    }
    
    // Handle rgb/rgba colors
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    
    // Handle named colors (basic set)
    const namedColors: Record<string, string> = {
      black: '#000000',
      white: '#ffffff',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      gray: '#808080',
      grey: '#808080',
    };
    
    return namedColors[color.toLowerCase()] || '#000000';
  }
  
  private getNodeTypeColor(nodeType: string): string {
    switch (nodeType) {
      case 'product':
        return this.theme.colors.product;
      case 'feature':
        return this.theme.colors.feature;
      case 'component':
        return this.theme.colors.component;
      case 'textBlock':
        return this.theme.colors.textBlock;
      case 'group':
        return this.theme.colors.group;
      default:
        return this.theme.colors.feature;
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a theme resolver with custom theme overrides
 */
export function createThemeResolver(overrides?: Partial<DocMapsTheme>): ThemeResolver {
  const theme = overrides ? { ...DEFAULT_THEME, ...overrides } : DEFAULT_THEME;
  return new DocMapsThemeResolver(theme);
}

/**
 * Extract theme context from DOM or provide defaults
 */
export function extractThemeContext(): ThemeContext {
  // In a real implementation, this could read from CSS custom properties,
  // data attributes, or other theme sources
  return {
    mode: 'light',
    primaryColor: '#3b82f6',
    accentColors: {},
    typography: {
      fontFamily: ['system-ui', 'sans-serif'],
      baseFontSize: 14,
    },
  };
}
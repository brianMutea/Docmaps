/**
 * Font Embedding System
 * 
 * Handles font detection, embedding, and fallback management for SVG exports.
 * Provides system font fallbacks when font embedding is not available.
 */

import type { FontSpec, RenderModel } from './render-model';

/**
 * Font information for embedding
 */
export interface FontInfo {
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  format?: 'woff2' | 'woff' | 'truetype' | 'opentype';
  data?: string;  // Base64 encoded font data
}

/**
 * System font stacks for fallbacks
 */
export const SYSTEM_FONT_STACKS = {
  sansSerif: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  serif: [
    'Georgia',
    'Cambria',
    'Times New Roman',
    'Times',
    'serif',
  ],
  monospace: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
} as const;

/**
 * Font Embedder for SVG exports
 */
export class FontEmbedder {
  private fontCache = new Map<string, FontInfo>();
  
  /**
   * Collect all unique fonts from render model
   */
  collectFonts(model: RenderModel): FontSpec[] {
    const fonts = new Map<string, FontSpec>();
    
    // Collect from nodes
    model.nodes.forEach(node => {
      node.text?.forEach(text => {
        const key = this.getFontKey(text.font);
        fonts.set(key, text.font);
      });
    });
    
    // Collect from edges
    model.edges.forEach(edge => {
      if (edge.label) {
        const key = this.getFontKey(edge.label.font);
        fonts.set(key, edge.label.font);
      }
    });
    
    return Array.from(fonts.values());
  }
  
  /**
   * Generate font definitions for SVG
   */
  generateFontDefinitions(fonts: FontSpec[]): string {
    const styles: string[] = [];
    
    fonts.forEach(font => {
      const fontInfo = this.fontCache.get(this.getFontKey(font));
      
      if (fontInfo && fontInfo.data) {
        // Generate @font-face rule with embedded data
        styles.push(this.generateFontFace(fontInfo));
      }
    });
    
    return styles.length > 0 ? styles.join('\n') : '';
  }
  
  /**
   * Resolve font with system fallbacks
   */
  resolveFontWithFallbacks(font: FontSpec): FontSpec {
    // Determine font category
    const firstFamily = font.family[0]?.toLowerCase() || '';
    let fallbacks: readonly string[] = [];
    
    if (firstFamily.includes('mono') || firstFamily.includes('code')) {
      fallbacks = SYSTEM_FONT_STACKS.monospace;
    } else if (firstFamily.includes('serif')) {
      fallbacks = SYSTEM_FONT_STACKS.serif;
    } else {
      fallbacks = SYSTEM_FONT_STACKS.sansSerif;
    }
    
    // Merge with existing families and add fallbacks
    const uniqueFamilies = new Set([...font.family, ...fallbacks]);
    
    return {
      ...font,
      family: Array.from(uniqueFamilies),
    };
  }
  
  /**
   * Detect if font is available in the system
   */
  async isFontAvailable(fontFamily: string): Promise<boolean> {
    if (typeof document === 'undefined') {
      return false;
    }
    
    try {
      // Use CSS Font Loading API if available
      if ('fonts' in document) {
        const fontFace = new FontFace(fontFamily, 'local("' + fontFamily + '")');
        await fontFace.load();
        return true;
      }
      
      // Fallback: canvas-based detection
      return this.detectFontWithCanvas(fontFamily);
    } catch {
      return false;
    }
  }
  
  /**
   * Load font data for embedding (placeholder)
   */
  async loadFontData(fontFamily: string, weight: number, style: string): Promise<FontInfo | null> {
    // This is a placeholder for actual font loading
    // In a real implementation, this would:
    // 1. Check if font is available locally
    // 2. Load font file from system or web
    // 3. Convert to base64 for embedding
    // 4. Cache the result
    
    // For now, we'll return null to indicate font embedding is not available
    // and rely on system fonts with fallbacks
    return null;
  }
  
  /**
   * Cache font information
   */
  cacheFont(font: FontSpec, info: FontInfo): void {
    const key = this.getFontKey(font);
    this.fontCache.set(key, info);
  }
  
  /**
   * Clear font cache
   */
  clearCache(): void {
    this.fontCache.clear();
  }
  
  // Private helper methods
  
  private getFontKey(font: FontSpec): string {
    return `${font.family[0]}-${font.weight}-${font.style}`;
  }
  
  private generateFontFace(fontInfo: FontInfo): string {
    return `
@font-face {
  font-family: '${fontInfo.family}';
  font-weight: ${fontInfo.weight};
  font-style: ${fontInfo.style};
  src: url(data:font/${fontInfo.format || 'woff2'};base64,${fontInfo.data});
}`.trim();
  }
  
  private detectFontWithCanvas(fontFamily: string): boolean {
    if (typeof document === 'undefined') {
      return false;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      return false;
    }
    
    // Test text
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baselineFont = 'monospace';
    
    // Measure with baseline font
    context.font = `${testSize} ${baselineFont}`;
    const baselineWidth = context.measureText(testString).width;
    
    // Measure with test font
    context.font = `${testSize} ${fontFamily}, ${baselineFont}`;
    const testWidth = context.measureText(testString).width;
    
    // If widths differ, font is available
    return baselineWidth !== testWidth;
  }
}

/**
 * Get default font for node type
 */
export function getDefaultFontForNodeType(nodeType: string): FontSpec {
  switch (nodeType) {
    case 'product':
      return {
        family: ['system-ui', ...SYSTEM_FONT_STACKS.sansSerif],
        size: 14,
        weight: 600,
        style: 'normal',
      };
    case 'feature':
      return {
        family: ['system-ui', ...SYSTEM_FONT_STACKS.sansSerif],
        size: 14,
        weight: 500,
        style: 'normal',
      };
    case 'component':
      return {
        family: ['system-ui', ...SYSTEM_FONT_STACKS.sansSerif],
        size: 12,
        weight: 500,
        style: 'normal',
      };
    case 'textBlock':
      return {
        family: ['system-ui', ...SYSTEM_FONT_STACKS.sansSerif],
        size: 13,
        weight: 400,
        style: 'normal',
      };
    default:
      return {
        family: ['system-ui', ...SYSTEM_FONT_STACKS.sansSerif],
        size: 14,
        weight: 400,
        style: 'normal',
      };
  }
}

/**
 * Get font for edge labels
 */
export function getEdgeLabelFont(): FontSpec {
  return {
    family: ['ui-monospace', ...SYSTEM_FONT_STACKS.monospace],
    size: 11,
    weight: 500,
    style: 'normal',
  };
}

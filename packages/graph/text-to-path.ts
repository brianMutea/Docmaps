/**
 * Text-to-Path Conversion
 * 
 * Converts text elements to vector paths for print-safe SVG exports.
 * Ensures text renders consistently across all applications without font dependencies.
 */

import type { TextElement, PathCommand } from './render-model';

/**
 * Text path result
 */
export interface TextPath {
  paths: PathCommand[][];  // Array of path arrays (one per character/glyph)
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Text-to-Path Converter
 */
export class TextToPathConverter {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  
  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
    }
  }
  
  /**
   * Convert text element to vector paths
   * 
   * Note: This is a simplified implementation. A production version would need:
   * 1. Access to font glyph data (via opentype.js or similar)
   * 2. Proper glyph-to-path conversion
   * 3. Kerning and ligature support
   * 4. Complex script support (RTL, combining characters, etc.)
   * 
   * For now, this returns a placeholder that maintains text positioning
   * but uses a simplified path representation.
   */
  convertTextToPath(text: TextElement): TextPath {
    if (!this.context) {
      // Fallback: return empty paths if canvas is not available
      return {
        paths: [],
        bounds: text.bounds,
      };
    }
    
    // Set font for measurement
    this.context.font = this.getFontString(text.font);
    
    // For a real implementation, we would:
    // 1. Load the font file
    // 2. Parse glyph outlines
    // 3. Convert each character to its path representation
    // 4. Apply transformations for positioning
    
    // Simplified approach: Create a bounding box path as placeholder
    // In production, this would be replaced with actual glyph paths
    const paths: PathCommand[][] = [];
    
    // Create a simple rectangle path representing the text bounds
    // This maintains positioning but doesn't preserve actual glyphs
    const rectPath: PathCommand[] = [
      { type: 'M', x: text.bounds.x, y: text.bounds.y },
      { type: 'L', x: text.bounds.x + text.bounds.width, y: text.bounds.y },
      { type: 'L', x: text.bounds.x + text.bounds.width, y: text.bounds.y + text.bounds.height },
      { type: 'L', x: text.bounds.x, y: text.bounds.y + text.bounds.height },
      { type: 'Z' },
    ];
    
    paths.push(rectPath);
    
    return {
      paths,
      bounds: text.bounds,
    };
  }
  
  /**
   * Convert multiple text elements to paths
   */
  convertMultipleTexts(texts: TextElement[]): TextPath[] {
    return texts.map(text => this.convertTextToPath(text));
  }
  
  /**
   * Check if text-to-path conversion is supported
   */
  isSupported(): boolean {
    return this.context !== null;
  }
  
  /**
   * Get estimated path complexity for text
   */
  estimatePathComplexity(text: TextElement): number {
    // Estimate number of path commands needed
    // Each character typically needs 10-50 commands depending on complexity
    const avgCommandsPerChar = 25;
    return text.content.length * avgCommandsPerChar;
  }
  
  // Private helper methods
  
  private getFontString(font: any): string {
    const style = font.style === 'italic' ? 'italic' : 'normal';
    const weight = font.weight || 400;
    const size = font.size || 14;
    const family = font.family.join(', ');
    
    return `${style} ${weight} ${size}px ${family}`;
  }
}

/**
 * Fallback text rendering for print-safe mode
 * 
 * When true text-to-path conversion is not available, this function
 * provides an alternative approach that maintains better compatibility
 * than raw text while still being readable.
 */
export function createPrintSafeTextFallback(text: TextElement): {
  useTextElement: boolean;
  additionalAttributes: Record<string, string>;
} {
  // Use text element with additional attributes for better compatibility
  return {
    useTextElement: true,
    additionalAttributes: {
      // Add text rendering hints for better cross-application compatibility
      'text-rendering': 'geometricPrecision',
      'shape-rendering': 'geometricPrecision',
      // Prevent text selection in some viewers
      'user-select': 'none',
      '-webkit-user-select': 'none',
      // Add explicit font metrics
      'font-kerning': 'normal',
      'font-variant-ligatures': 'none',
    },
  };
}

/**
 * Check if text-to-path conversion is recommended
 */
export function shouldConvertTextToPath(
  text: TextElement,
  options: { maxComplexity?: number; forceConversion?: boolean }
): boolean {
  const { maxComplexity = 10000, forceConversion = false } = options;
  
  if (forceConversion) {
    return true;
  }
  
  // Don't convert very long text (too complex)
  if (text.content.length > 200) {
    return false;
  }
  
  // Estimate complexity
  const converter = new TextToPathConverter();
  const complexity = converter.estimatePathComplexity(text);
  
  return complexity <= maxComplexity;
}

/**
 * Optimize text paths by removing redundant commands
 */
export function optimizeTextPaths(paths: PathCommand[][]): PathCommand[][] {
  return paths.map(path => {
    const optimized: PathCommand[] = [];
    let lastX = 0;
    let lastY = 0;
    
    for (const cmd of path) {
      // Skip redundant move commands
      if (cmd.type === 'M' && cmd.x === lastX && cmd.y === lastY) {
        continue;
      }
      
      // Skip redundant line commands
      if (cmd.type === 'L' && cmd.x === lastX && cmd.y === lastY) {
        continue;
      }
      
      optimized.push(cmd);
      
      if ('x' in cmd && 'y' in cmd) {
        lastX = cmd.x;
        lastY = cmd.y;
      }
    }
    
    return optimized;
  });
}

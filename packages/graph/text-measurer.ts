/**
 * Text Measurement Utilities for SVG Exporter
 * 
 * This module provides accurate text measurement capabilities using canvas-based
 * measurement techniques, with caching for performance optimization.
 */

import type { FontSpec, BoundingBox, TextElement } from './render-model';

// ============================================================================
// Text Measurement Interface
// ============================================================================

export interface TextMeasurer {
  /**
   * Measure the dimensions of a text string with given font specifications
   */
  measureText(text: string, font: FontSpec): TextMetrics;
  
  /**
   * Measure text and return a bounding box
   */
  measureTextBounds(text: string, font: FontSpec): BoundingBox;
  
  /**
   * Calculate line height for a given font
   */
  getLineHeight(font: FontSpec): number;
  
  /**
   * Break text into lines that fit within a given width
   */
  wrapText(text: string, font: FontSpec, maxWidth: number): string[];
  
  /**
   * Clear the measurement cache
   */
  clearCache(): void;
}

// ============================================================================
// Text Metrics Interface
// ============================================================================

export interface TextMetrics {
  width: number;
  height: number;
  actualBoundingBoxLeft: number;
  actualBoundingBoxRight: number;
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
  fontBoundingBoxAscent: number;
  fontBoundingBoxDescent: number;
}

// ============================================================================
// Canvas-Based Text Measurer Implementation
// ============================================================================

export class CanvasTextMeasurer implements TextMeasurer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private cache = new Map<string, TextMetrics>();
  private fontCache = new Map<string, number>();
  
  constructor() {
    // Create an offscreen canvas for measurement
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1;
    this.canvas.height = 1;
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context for text measurement');
    }
    this.context = context;
  }
  
  measureText(text: string, font: FontSpec): TextMetrics {
    const cacheKey = this.getCacheKey(text, font);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Set font properties
    this.context.font = this.getFontString(font);
    this.context.textAlign = 'left';
    this.context.textBaseline = 'alphabetic';
    
    // Measure text
    const metrics = this.context.measureText(text);
    
    // Create our enhanced metrics object
    const enhancedMetrics: TextMetrics = {
      width: metrics.width,
      height: this.getLineHeight(font),
      actualBoundingBoxLeft: metrics.actualBoundingBoxLeft || 0,
      actualBoundingBoxRight: metrics.actualBoundingBoxRight || metrics.width,
      actualBoundingBoxAscent: metrics.actualBoundingBoxAscent || font.size * 0.8,
      actualBoundingBoxDescent: metrics.actualBoundingBoxDescent || font.size * 0.2,
      fontBoundingBoxAscent: metrics.fontBoundingBoxAscent || font.size * 0.8,
      fontBoundingBoxDescent: metrics.fontBoundingBoxDescent || font.size * 0.2,
    };
    
    // Cache the result
    this.cache.set(cacheKey, enhancedMetrics);
    
    return enhancedMetrics;
  }
  
  measureTextBounds(text: string, font: FontSpec): BoundingBox {
    const metrics = this.measureText(text, font);
    
    return {
      x: -metrics.actualBoundingBoxLeft,
      y: -metrics.actualBoundingBoxAscent,
      width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
      height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    };
  }
  
  getLineHeight(font: FontSpec): number {
    const cacheKey = `lineHeight:${this.getFontString(font)}`;
    
    // Check cache first
    const cached = this.fontCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Set font properties
    this.context.font = this.getFontString(font);
    
    // Measure a sample text to get line height
    const metrics = this.context.measureText('Mg');
    const lineHeight = (metrics.fontBoundingBoxAscent || font.size * 0.8) + 
                      (metrics.fontBoundingBoxDescent || font.size * 0.2);
    
    // Cache the result
    this.fontCache.set(cacheKey, lineHeight);
    
    return lineHeight;
  }
  
  wrapText(text: string, font: FontSpec, maxWidth: number): string[] {
    if (maxWidth <= 0) {
      return [text];
    }
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = this.measureText(testLine, font);
      
      if (metrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, break it
          const brokenWord = this.breakLongWord(word, font, maxWidth);
          lines.push(...brokenWord.slice(0, -1));
          currentLine = brokenWord[brokenWord.length - 1];
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [''];
  }
  
  clearCache(): void {
    this.cache.clear();
    this.fontCache.clear();
  }
  
  private getFontString(font: FontSpec): string {
    const style = font.style === 'italic' ? 'italic ' : '';
    const weight = font.weight !== 400 ? `${font.weight} ` : '';
    const size = `${font.size}px`;
    const family = font.family.map(f => f.includes(' ') ? `"${f}"` : f).join(', ');
    
    return `${style}${weight}${size} ${family}`;
  }
  
  private getCacheKey(text: string, font: FontSpec): string {
    return `${text}|${this.getFontString(font)}`;
  }
  
  private breakLongWord(word: string, font: FontSpec, maxWidth: number): string[] {
    const lines: string[] = [];
    let currentPart = '';
    
    for (const char of word) {
      const testPart = currentPart + char;
      const metrics = this.measureText(testPart, font);
      
      if (metrics.width <= maxWidth) {
        currentPart = testPart;
      } else {
        if (currentPart) {
          lines.push(currentPart);
          currentPart = char;
        } else {
          // Even a single character is too wide
          lines.push(char);
          currentPart = '';
        }
      }
    }
    
    if (currentPart) {
      lines.push(currentPart);
    }
    
    return lines.length > 0 ? lines : [''];
  }
}

// ============================================================================
// Server-Side Text Measurer (Fallback)
// ============================================================================

/**
 * Fallback text measurer for server-side rendering or when canvas is not available
 * Uses approximate calculations based on font metrics
 */
export class ApproximateTextMeasurer implements TextMeasurer {
  private cache = new Map<string, TextMetrics>();
  
  measureText(text: string, font: FontSpec): TextMetrics {
    const cacheKey = this.getCacheKey(text, font);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Approximate character width based on font size
    // This is a rough approximation - actual width varies by character
    const avgCharWidth = font.size * 0.6; // Approximate ratio for most fonts
    const width = text.length * avgCharWidth;
    const height = font.size * 1.2; // Line height approximation
    
    const metrics: TextMetrics = {
      width,
      height,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: width,
      actualBoundingBoxAscent: font.size * 0.8,
      actualBoundingBoxDescent: font.size * 0.2,
      fontBoundingBoxAscent: font.size * 0.8,
      fontBoundingBoxDescent: font.size * 0.2,
    };
    
    // Cache the result
    this.cache.set(cacheKey, metrics);
    
    return metrics;
  }
  
  measureTextBounds(text: string, font: FontSpec): BoundingBox {
    const metrics = this.measureText(text, font);
    
    return {
      x: 0,
      y: 0,
      width: metrics.width,
      height: metrics.height,
    };
  }
  
  getLineHeight(font: FontSpec): number {
    return font.size * 1.2;
  }
  
  wrapText(text: string, font: FontSpec, maxWidth: number): string[] {
    if (maxWidth <= 0) {
      return [text];
    }
    
    const avgCharWidth = font.size * 0.6;
    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
    
    if (maxCharsPerLine <= 0) {
      return [text];
    }
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, break it
          while (word.length > maxCharsPerLine) {
            lines.push(word.substring(0, maxCharsPerLine));
            word.substring(maxCharsPerLine);
          }
          currentLine = word;
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [''];
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  private getCacheKey(text: string, font: FontSpec): string {
    return `${text}|${font.family.join(',')}|${font.size}|${font.weight}|${font.style}`;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a text measurer instance
 * Uses canvas-based measurement when available, falls back to approximation
 */
export function createTextMeasurer(): TextMeasurer {
  try {
    // Try to create canvas-based measurer
    return new CanvasTextMeasurer();
  } catch (error) {
    // Fall back to approximate measurer
    console.warn('Canvas not available for text measurement, using approximation:', error);
    return new ApproximateTextMeasurer();
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a TextElement with proper bounds calculation
 */
export function createTextElement(
  content: string,
  x: number,
  y: number,
  font: FontSpec,
  color: string,
  align: 'left' | 'center' | 'right' = 'left',
  baseline: 'top' | 'middle' | 'bottom' = 'top',
  measurer?: TextMeasurer
): TextElement {
  const textMeasurer = measurer || createTextMeasurer();
  const bounds = textMeasurer.measureTextBounds(content, font);
  
  // Adjust bounds based on alignment
  let adjustedX = x;
  if (align === 'center') {
    adjustedX = x - bounds.width / 2;
  } else if (align === 'right') {
    adjustedX = x - bounds.width;
  }
  
  // Adjust bounds based on baseline
  let adjustedY = y;
  if (baseline === 'middle') {
    adjustedY = y - bounds.height / 2;
  } else if (baseline === 'bottom') {
    adjustedY = y - bounds.height;
  }
  
  return {
    content,
    bounds: {
      x: adjustedX,
      y: adjustedY,
      width: bounds.width,
      height: bounds.height,
    },
    font,
    color,
    align,
    baseline,
  };
}
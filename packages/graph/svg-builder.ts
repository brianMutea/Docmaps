/**
 * SVG Builder Utility
 * 
 * Provides a clean API for generating SVG markup with optimized string building.
 * Supports nested elements, attribute management, and performance optimization.
 */

/**
 * SVG Builder for efficient markup generation
 */
export class SVGBuilder {
  private parts: string[] = [];
  private indentLevel = 0;
  private readonly indentSize = 2;

  /**
   * Create SVG root element
   */
  root(attrs: Record<string, string | number>, content?: () => void): void {
    this.openElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      ...attrs,
    });
    
    if (content) {
      this.indentLevel++;
      content();
      this.indentLevel--;
    }
    
    this.closeElement('svg');
  }

  /**
   * Create defs section
   */
  defs(content: () => void): void {
    this.element('defs', {}, content);
  }

  /**
   * Create group element
   */
  group(attrs: Record<string, string | number>, content: () => void): void {
    this.element('g', attrs, content);
  }

  /**
   * Create rectangle element
   */
  rect(attrs: Record<string, string | number>): void {
    this.selfClosingElement('rect', attrs);
  }

  /**
   * Create circle element
   */
  circle(attrs: Record<string, string | number>): void {
    this.selfClosingElement('circle', attrs);
  }

  /**
   * Create path element
   */
  path(attrs: Record<string, string | number>): void {
    this.selfClosingElement('path', attrs);
  }

  /**
   * Create text element
   */
  text(attrs: Record<string, string | number>, content: string): void {
    this.openElement('text', attrs);
    this.parts.push(this.escapeXml(content));
    this.closeElement('text', false);
  }

  /**
   * Create tspan element (for multi-line text)
   */
  tspan(attrs: Record<string, string | number>, content: string): void {
    this.openElement('tspan', attrs);
    this.parts.push(this.escapeXml(content));
    this.closeElement('tspan', false);
  }

  /**
   * Create title element
   */
  title(content: string): void {
    this.openElement('title', {});
    this.parts.push(this.escapeXml(content));
    this.closeElement('title', false);
  }

  /**
   * Create desc element
   */
  desc(content: string): void {
    this.openElement('desc', {});
    this.parts.push(this.escapeXml(content));
    this.closeElement('desc', false);
  }

  /**
   * Create marker definition
   */
  marker(attrs: Record<string, string | number>, content: () => void): void {
    this.element('marker', attrs, content);
  }

  /**
   * Create filter definition
   */
  filter(attrs: Record<string, string | number>, content: () => void): void {
    this.element('filter', attrs, content);
  }

  /**
   * Create linearGradient definition
   */
  linearGradient(attrs: Record<string, string | number>, content: () => void): void {
    this.element('linearGradient', attrs, content);
  }

  /**
   * Create radialGradient definition
   */
  radialGradient(attrs: Record<string, string | number>, content: () => void): void {
    this.element('radialGradient', attrs, content);
  }

  /**
   * Create stop element (for gradients)
   */
  stop(attrs: Record<string, string | number>): void {
    this.selfClosingElement('stop', attrs);
  }

  /**
   * Create style element
   */
  style(content: string): void {
    this.openElement('style', { type: 'text/css' });
    this.parts.push(`<![CDATA[\n${content}\n]]>`);
    this.closeElement('style', false);
  }

  /**
   * Add raw SVG content
   */
  raw(content: string): void {
    this.parts.push(content);
  }

  /**
   * Generic element creation
   */
  element(tag: string, attrs: Record<string, string | number>, content?: () => void): void {
    this.openElement(tag, attrs);
    
    if (content) {
      this.indentLevel++;
      content();
      this.indentLevel--;
    }
    
    this.closeElement(tag);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + this.parts.join('');
  }

  /**
   * Clear the builder
   */
  clear(): void {
    this.parts = [];
    this.indentLevel = 0;
  }

  // Private helper methods

  private openElement(tag: string, attrs: Record<string, string | number>): void {
    this.parts.push('\n');
    this.parts.push(' '.repeat(this.indentLevel * this.indentSize));
    this.parts.push('<');
    this.parts.push(tag);
    
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        this.parts.push(' ');
        this.parts.push(key);
        this.parts.push('="');
        this.parts.push(this.escapeAttr(String(value)));
        this.parts.push('"');
      }
    }
    
    this.parts.push('>');
  }

  private closeElement(tag: string, withIndent = true): void {
    if (withIndent) {
      this.parts.push('\n');
      this.parts.push(' '.repeat(this.indentLevel * this.indentSize));
    }
    this.parts.push('</');
    this.parts.push(tag);
    this.parts.push('>');
  }

  private selfClosingElement(tag: string, attrs: Record<string, string | number>): void {
    this.parts.push('\n');
    this.parts.push(' '.repeat(this.indentLevel * this.indentSize));
    this.parts.push('<');
    this.parts.push(tag);
    
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        this.parts.push(' ');
        this.parts.push(key);
        this.parts.push('="');
        this.parts.push(this.escapeAttr(String(value)));
        this.parts.push('"');
      }
    }
    
    this.parts.push(' />');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escapeAttr(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

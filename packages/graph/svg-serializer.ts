/**
 * SVG Serializer
 * 
 * Pure function that converts render models to SVG markup.
 * Handles SVG root, defs, and main content structure.
 */

import { SVGBuilder } from './svg-builder';
import { TextToPathConverter, createPrintSafeTextFallback, shouldConvertTextToPath } from './text-to-path';
import { FontEmbedder } from './font-embedder';
import type {
  RenderModel,
  RenderNode,
  RenderEdge,
  ExportOptions,
  PathCommand,
  TextElement,
  EdgeMarker,
  Decoration,
  NodeShape,
  BorderSpec,
  FillSpec,
} from './render-model';

/**
 * SVG Serializer for DocMaps
 */
export class DocMapsSVGSerializer {
  private textToPathConverter: TextToPathConverter;
  private fontEmbedder: FontEmbedder;
  
  constructor() {
    this.textToPathConverter = new TextToPathConverter();
    this.fontEmbedder = new FontEmbedder();
  }
  
  /**
   * Serialize render model to SVG string
   */
  serialize(model: RenderModel, options: ExportOptions): string {
    const svg = new SVGBuilder();
    const padding = options.padding ?? 40;
    
    // Calculate dimensions
    const width = model.bounds.width + padding * 2;
    const height = model.bounds.height + padding * 2;
    
    // Create SVG root
    svg.root(
      {
        width: Math.round(width),
        height: Math.round(height),
        viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
      },
      () => {
        // Add metadata
        if (options.includeMetadata && model.metadata) {
          if (model.metadata.title) {
            svg.title(model.metadata.title);
          }
          if (model.metadata.description) {
            svg.desc(model.metadata.description);
          }
        }
        
        // Add definitions
        this.addDefinitions(svg, model, options);
        
        // Add background
        this.renderBackground(svg, model, options, width, height);
        
        // Create main group with padding offset
        svg.group(
          {
            transform: `translate(${padding - model.bounds.x}, ${padding - model.bounds.y})`,
          },
          () => {
            // Render edges first (behind nodes)
            svg.group({ class: 'edges' }, () => {
              model.edges.forEach(edge => this.renderEdge(svg, edge, options));
            });
            
            // Render nodes
            svg.group({ class: 'nodes' }, () => {
              // Sort by z-index if present
              const sortedNodes = [...model.nodes].sort((a, b) => {
                const aZ = a.zIndex ?? 0;
                const bZ = b.zIndex ?? 0;
                return aZ - bZ;
              });
              
              sortedNodes.forEach(node => this.renderNode(svg, node, options));
            });
          }
        );
      }
    );
    
    return svg.toString();
  }

  /**
   * Add SVG definitions (markers, filters, gradients, fonts)
   */
  private addDefinitions(svg: SVGBuilder, model: RenderModel, options: ExportOptions): void {
    svg.defs(() => {
      // Add marker definitions for edges
      this.addMarkerDefinitions(svg);
      
      // Add filter definitions
      this.addFilterDefinitions(svg);
      
      // Add gradient definitions if needed
      this.addGradientDefinitions(svg, model);
      
      // Add font definitions if embedding fonts
      if (options.embedFonts) {
        this.addFontDefinitions(svg, model);
      }
    });
  }

  /**
   * Add marker definitions for edge arrows
   */
  private addMarkerDefinitions(svg: SVGBuilder): void {
    // Arrow marker
    svg.marker(
      {
        id: 'arrow',
        markerWidth: 10,
        markerHeight: 10,
        refX: 9,
        refY: 3,
        orient: 'auto',
        markerUnits: 'strokeWidth',
      },
      () => {
        svg.path({
          d: 'M0,0 L0,6 L9,3 z',
          fill: 'context-stroke',
        });
      }
    );
    
    // Dot marker
    svg.marker(
      {
        id: 'dot',
        markerWidth: 8,
        markerHeight: 8,
        refX: 4,
        refY: 4,
        markerUnits: 'strokeWidth',
      },
      () => {
        svg.circle({
          cx: 4,
          cy: 4,
          r: 3,
          fill: 'context-stroke',
        });
      }
    );
    
    // Diamond marker
    svg.marker(
      {
        id: 'diamond',
        markerWidth: 10,
        markerHeight: 10,
        refX: 5,
        refY: 5,
        orient: 'auto',
        markerUnits: 'strokeWidth',
      },
      () => {
        svg.path({
          d: 'M0,5 L5,0 L10,5 L5,10 z',
          fill: 'context-stroke',
        });
      }
    );
  }

  /**
   * Add filter definitions
   */
  private addFilterDefinitions(svg: SVGBuilder): void {
    // Drop shadow filter
    svg.filter(
      {
        id: 'drop-shadow',
        x: '-50%',
        y: '-50%',
        width: '200%',
        height: '200%',
      },
      () => {
        svg.raw('<feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.1"/>');
      }
    );
    
    // Soft shadow filter
    svg.filter(
      {
        id: 'soft-shadow',
        x: '-50%',
        y: '-50%',
        width: '200%',
        height: '200%',
      },
      () => {
        svg.raw('<feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.05"/>');
      }
    );
  }

  /**
   * Add gradient definitions
   */
  private addGradientDefinitions(svg: SVGBuilder, model: RenderModel): void {
    // Collect unique gradients from nodes and background
    const gradients = new Map<string, FillSpec>();
    
    // Check background
    if (model.background.fill.type === 'gradient' && model.background.fill.gradient) {
      gradients.set('bg-gradient', model.background.fill);
    }
    
    // Check nodes
    model.nodes.forEach(node => {
      node.shape.fills.forEach((fill, idx) => {
        if (fill.type === 'gradient' && fill.gradient) {
          gradients.set(`gradient-${node.id}-${idx}`, fill);
        }
      });
    });
    
    // Generate gradient definitions
    gradients.forEach((fill, id) => {
      if (fill.gradient) {
        if (fill.gradient.type === 'linear') {
          const dir = fill.gradient.direction || { x1: 0, y1: 0, x2: 0, y2: 1 };
          svg.linearGradient(
            {
              id,
              x1: `${dir.x1 * 100}%`,
              y1: `${dir.y1 * 100}%`,
              x2: `${dir.x2 * 100}%`,
              y2: `${dir.y2 * 100}%`,
            },
            () => {
              fill.gradient!.stops.forEach(stop => {
                svg.stop({
                  offset: `${stop.offset * 100}%`,
                  'stop-color': stop.color,
                });
              });
            }
          );
        } else {
          svg.radialGradient({ id }, () => {
            fill.gradient!.stops.forEach(stop => {
              svg.stop({
                offset: `${stop.offset * 100}%`,
                'stop-color': stop.color,
              });
            });
          });
        }
      }
    });
  }

  /**
   * Add font definitions (placeholder for font embedding)
   */
  private addFontDefinitions(svg: SVGBuilder, model: RenderModel): void {
    // Collect all fonts used in the model
    const fonts = this.fontEmbedder.collectFonts(model);
    
    // Resolve fonts with system fallbacks
    const resolvedFonts = fonts.map(font => 
      this.fontEmbedder.resolveFontWithFallbacks(font)
    );
    
    // Generate font definitions
    const fontDefs = this.fontEmbedder.generateFontDefinitions(resolvedFonts);
    
    if (fontDefs) {
      svg.style(fontDefs);
    }
  }

  /**
   * Render background
   */
  private renderBackground(
    svg: SVGBuilder,
    model: RenderModel,
    options: ExportOptions,
    width: number,
    height: number
  ): void {
    const bgColor = options.backgroundColor || model.background.fill.color;
    
    svg.rect({
      width,
      height,
      fill: bgColor,
    });
  }

  /**
   * Render a node
   */
  private renderNode(svg: SVGBuilder, node: RenderNode, options: ExportOptions): void {
    svg.group(
      {
        class: `node node-${node.type}`,
        'data-id': node.id,
      },
      () => {
        // Render node shape
        this.renderNodeShape(svg, node);
        
        // Render decorations
        node.decorations.forEach(decoration => this.renderDecoration(svg, decoration));
        
        // Render text
        if (node.text) {
          node.text.forEach(text => this.renderText(svg, text, options));
        }
      }
    );
  }

  /**
   * Render node shape
   */
  private renderNodeShape(svg: SVGBuilder, node: RenderNode): void {
    const { bounds, shape, styles } = node;
    
    // Render fills
    shape.fills.forEach(fill => {
      const attrs: Record<string, string | number> = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      };
      
      // Add corner radius for rounded shapes
      if (shape.type === 'rounded-rectangle' && shape.cornerRadius) {
        attrs.rx = shape.cornerRadius;
        attrs.ry = shape.cornerRadius;
      } else if (shape.type === 'pill') {
        attrs.rx = bounds.height / 2;
        attrs.ry = bounds.height / 2;
      }
      
      // Add fill
      if (fill.type === 'solid') {
        attrs.fill = fill.color;
      } else if (fill.gradient) {
        attrs.fill = `url(#gradient-${node.id}-${shape.fills.indexOf(fill)})`;
      }
      
      // Add styles
      Object.entries(styles).forEach(([key, value]) => {
        if (value !== undefined && key !== 'fill') {
          attrs[key] = value;
        }
      });
      
      if (shape.type === 'circle') {
        svg.circle({
          cx: bounds.x + bounds.width / 2,
          cy: bounds.y + bounds.height / 2,
          r: bounds.width / 2,
          ...attrs,
        });
      } else {
        svg.rect(attrs);
      }
    });
    
    // Render borders
    shape.borders.forEach(border => this.renderBorder(svg, bounds, border));
  }

  /**
   * Render border
   */
  private renderBorder(svg: SVGBuilder, bounds: any, border: BorderSpec): void {
    const attrs: Record<string, string | number> = {
      stroke: border.color,
      'stroke-width': border.width,
      fill: 'none',
    };
    
    if (border.style === 'dashed') {
      attrs['stroke-dasharray'] = '5,5';
    } else if (border.style === 'dotted') {
      attrs['stroke-dasharray'] = '2,2';
    }
    
    if (border.side === 'all') {
      svg.rect({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        ...attrs,
      });
    } else {
      // Render individual border sides
      let d = '';
      switch (border.side) {
        case 'top':
          d = `M ${bounds.x} ${bounds.y} L ${bounds.x + bounds.width} ${bounds.y}`;
          break;
        case 'right':
          d = `M ${bounds.x + bounds.width} ${bounds.y} L ${bounds.x + bounds.width} ${bounds.y + bounds.height}`;
          break;
        case 'bottom':
          d = `M ${bounds.x} ${bounds.y + bounds.height} L ${bounds.x + bounds.width} ${bounds.y + bounds.height}`;
          break;
        case 'left':
          d = `M ${bounds.x} ${bounds.y} L ${bounds.x} ${bounds.y + bounds.height}`;
          break;
      }
      svg.path({ d, ...attrs });
    }
  }

  /**
   * Render decoration
   */
  private renderDecoration(svg: SVGBuilder, decoration: Decoration): void {
    const { bounds, styles } = decoration;
    
    const attrs: Record<string, string | number> = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      ...styles,
    };
    
    if (decoration.type === 'color-bar' || decoration.type === 'indicator') {
      // Add rounded corners for indicators
      if (bounds.width < bounds.height) {
        attrs.rx = bounds.width / 2;
      } else {
        attrs.rx = 4;
      }
      svg.rect(attrs);
    }
  }

  /**
   * Render an edge
   */
  private renderEdge(svg: SVGBuilder, edge: RenderEdge, options: ExportOptions): void {
    svg.group(
      {
        class: `edge edge-${edge.type}`,
        'data-id': edge.id,
      },
      () => {
        // Convert path commands to SVG path string
        const pathString = this.pathCommandsToString(edge.path);
        
        const attrs: Record<string, string | number> = {
          d: pathString,
          fill: 'none',
          ...edge.styles,
        };
        
        // Add markers
        edge.markers.forEach(marker => {
          if (marker.position === 'end') {
            attrs['marker-end'] = `url(#${marker.type})`;
          } else if (marker.position === 'start') {
            attrs['marker-start'] = `url(#${marker.type})`;
          }
        });
        
        svg.path(attrs);
        
        // Render label if present
        if (edge.label) {
          this.renderEdgeLabel(svg, edge.label);
        }
      }
    );
  }

  /**
   * Convert path commands to SVG path string
   */
  private pathCommandsToString(commands: PathCommand[]): string {
    return commands
      .map(cmd => {
        switch (cmd.type) {
          case 'M':
            return `M ${cmd.x} ${cmd.y}`;
          case 'L':
            return `L ${cmd.x} ${cmd.y}`;
          case 'C':
            return `C ${cmd.x1} ${cmd.y1}, ${cmd.x2} ${cmd.y2}, ${cmd.x} ${cmd.y}`;
          case 'Q':
            return `Q ${cmd.x1} ${cmd.y1}, ${cmd.x} ${cmd.y}`;
          case 'Z':
            return 'Z';
          default:
            return '';
        }
      })
      .join(' ');
  }

  /**
   * Render edge label
   */
  private renderEdgeLabel(svg: SVGBuilder, label: TextElement): void {
    const { bounds, content, font, color } = label;
    
    // Background for label
    svg.rect({
      x: bounds.x - 6,
      y: bounds.y - 9,
      width: bounds.width + 12,
      height: bounds.height + 6,
      rx: 4,
      fill: '#ffffff',
      stroke: '#e2e8f0',
      'stroke-width': 1,
    });
    
    // Label text
    this.renderText(svg, label, { mode: 'editable' } as ExportOptions);
  }

  /**
   * Render text element
   */
  private renderText(svg: SVGBuilder, text: TextElement, options: ExportOptions): void {
    const { bounds, content, font, color, align, baseline } = text;
    
    // Handle print-safe mode
    if (options.mode === 'print-safe') {
      // Check if we should convert to paths
      if (this.textToPathConverter.isSupported() && shouldConvertTextToPath(text, {})) {
        const textPath = this.textToPathConverter.convertTextToPath(text);
        
        // Render as paths
        textPath.paths.forEach(path => {
          const pathString = this.pathCommandsToString(path);
          svg.path({
            d: pathString,
            fill: color,
          });
        });
        return;
      } else {
        // Use fallback with enhanced attributes
        const fallback = createPrintSafeTextFallback(text);
        if (fallback.useTextElement) {
          // Continue with text element but add extra attributes
          this.renderTextElement(svg, text, fallback.additionalAttributes);
          return;
        }
      }
    }
    
    // Editable mode: render as regular text
    this.renderTextElement(svg, text, {});
  }
  
  /**
   * Render text as SVG text element
   */
  private renderTextElement(
    svg: SVGBuilder,
    text: TextElement,
    additionalAttrs: Record<string, string> = {}
  ): void {
    const { bounds, content, font, color, align, baseline } = text;
    
    // Calculate text anchor based on alignment
    let textAnchor = 'start';
    let x = bounds.x;
    
    if (align === 'center') {
      textAnchor = 'middle';
      x = bounds.x + bounds.width / 2;
    } else if (align === 'right') {
      textAnchor = 'end';
      x = bounds.x + bounds.width;
    }
    
    // Calculate y position based on baseline
    let y = bounds.y;
    let dominantBaseline = 'hanging';
    
    if (baseline === 'middle') {
      y = bounds.y + bounds.height / 2;
      dominantBaseline = 'middle';
    } else if (baseline === 'bottom') {
      y = bounds.y + bounds.height;
      dominantBaseline = 'baseline';
    }
    
    svg.text(
      {
        x,
        y,
        'font-family': font.family.join(', '),
        'font-size': font.size,
        'font-weight': font.weight,
        'font-style': font.style,
        fill: color,
        'text-anchor': textAnchor,
        'dominant-baseline': dominantBaseline,
        ...additionalAttrs,
      },
      content
    );
  }
}

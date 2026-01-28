/**
 * Layout Engine for SVG Exporter
 * 
 * This module implements the core layout engine that transforms React Flow data
 * into a normalized render model with absolute coordinates and resolved styles.
 */

import type { Node, Edge } from 'reactflow';
import type { 
  RenderModel, 
  RenderNode, 
  RenderEdge, 
  RenderBackground,
  BoundingBox, 
  Viewport, 
  ThemeContext,
  LayoutContext
} from './render-model';
import type { ThemeResolver } from './theme-resolver';
import type { TextMeasurer } from './text-measurer';

// ============================================================================
// Layout Engine Interface
// ============================================================================

export interface LayoutEngine {
  /**
   * Compute the complete render model from React Flow data
   */
  computeLayout(
    nodes: Node[], 
    edges: Edge[], 
    viewport: Viewport,
    theme: ThemeContext
  ): RenderModel;
  
  /**
   * Layout a single node
   */
  layoutNode(node: Node, context: LayoutContext): RenderNode;
  
  /**
   * Layout a single edge
   */
  layoutEdge(edge: Edge, nodes: RenderNode[], context: LayoutContext): RenderEdge;
  
  /**
   * Calculate overall bounds for the diagram
   */
  calculateBounds(nodes: RenderNode[], edges: RenderEdge[]): BoundingBox;
}

// ============================================================================
// Node Configuration
// ============================================================================

interface NodeConfig {
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const NODE_CONFIGS: Record<string, NodeConfig> = {
  product: {
    defaultWidth: 240,
    defaultHeight: 72,
    minWidth: 200,
    minHeight: 60,
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
  },
  feature: {
    defaultWidth: 200,
    defaultHeight: 52,
    minWidth: 160,
    minHeight: 44,
    padding: { top: 12, right: 16, bottom: 12, left: 36 },
  },
  component: {
    defaultWidth: 160,
    defaultHeight: 44,
    minWidth: 120,
    minHeight: 36,
    padding: { top: 10, right: 12, bottom: 10, left: 26 },
  },
  textBlock: {
    defaultWidth: 200,
    defaultHeight: 60,
    minWidth: 100,
    minHeight: 40,
    padding: { top: 12, right: 12, bottom: 12, left: 12 },
  },
  group: {
    defaultWidth: 300,
    defaultHeight: 200,
    minWidth: 200,
    minHeight: 150,
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
  },
};

// ============================================================================
// DocMaps Layout Engine Implementation
// ============================================================================

export class DocMapsLayoutEngine implements LayoutEngine {
  constructor(
    private themeResolver: ThemeResolver,
    private textMeasurer: TextMeasurer
  ) {}
  
  computeLayout(
    nodes: Node[], 
    edges: Edge[], 
    viewport: Viewport,
    theme: ThemeContext
  ): RenderModel {
    // Create layout context
    const context: LayoutContext = {
      viewport,
      theme,
      textMeasurement: {
        // Canvas context will be created by text measurer if needed
      },
    };
    
    // Layout all nodes first
    const renderNodes = nodes.map(node => this.layoutNode(node, context));
    
    // Layout all edges
    const renderEdges = edges.map(edge => this.layoutEdge(edge, renderNodes, context));
    
    // Calculate overall bounds
    const bounds = this.calculateBounds(renderNodes, renderEdges);
    
    // Create background
    const background = this.createBackground(bounds, context);
    
    return {
      bounds,
      nodes: renderNodes,
      edges: renderEdges,
      background,
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }
  
  layoutNode(node: Node, context: LayoutContext): RenderNode {
    const nodeType = node.type || 'feature';
    const config = this.getNodeConfig(nodeType);
    
    // Resolve theme and get styles
    const resolvedTheme = this.themeResolver.resolve(context.theme);
    const styles = this.themeResolver.getNodeStyles(nodeType, node.data?.color, node.data?.status);
    const shape = this.themeResolver.getNodeShape(nodeType);
    
    // Layout text elements
    const textElements = this.layoutNodeText(node, config, context);
    
    // Calculate node bounds based on content and configuration
    const bounds = this.calculateNodeBounds(node, textElements, config);
    
    // Create decorations (color bars, indicators, etc.)
    const decorations = this.createNodeDecorations(node, bounds, config, context);
    
    return {
      id: node.id,
      type: nodeType as any,
      bounds,
      shape,
      styles,
      text: textElements,
      decorations,
      zIndex: this.getNodeZIndex(nodeType),
    };
  }
  
  layoutEdge(edge: Edge, nodes: RenderNode[], context: LayoutContext): RenderEdge {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) {
      throw new Error(`Edge ${edge.id} references missing nodes`);
    }
    
    const edgeType = edge.data?.edgeType || edge.type || 'hierarchy';
    const styles = this.themeResolver.getEdgeStyles(edgeType);
    
    // Calculate path
    const path = this.calculateEdgePath(sourceNode, targetNode, edge);
    
    // Create markers
    const markers = this.createEdgeMarkers(edgeType, styles);
    
    // Create label if present
    const label = edge.data?.label || edge.label;
    const textElement = label ? this.createEdgeLabel(label, path, context) : undefined;
    
    // Calculate edge bounds
    const bounds = this.calculateEdgeBounds(path, markers, textElement);
    
    return {
      id: edge.id,
      type: edgeType as any,
      path,
      styles,
      markers,
      label: textElement,
      bounds,
    };
  }
  
  calculateBounds(nodes: RenderNode[], edges: RenderEdge[]): BoundingBox {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    // Include node bounds
    nodes.forEach(node => {
      minX = Math.min(minX, node.bounds.x);
      minY = Math.min(minY, node.bounds.y);
      maxX = Math.max(maxX, node.bounds.x + node.bounds.width);
      maxY = Math.max(maxY, node.bounds.y + node.bounds.height);
    });
    
    // Include edge bounds
    edges.forEach(edge => {
      minX = Math.min(minX, edge.bounds.x);
      minY = Math.min(minY, edge.bounds.y);
      maxX = Math.max(maxX, edge.bounds.x + edge.bounds.width);
      maxY = Math.max(maxY, edge.bounds.y + edge.bounds.height);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  
  private getNodeConfig(nodeType: string): NodeConfig {
    return NODE_CONFIGS[nodeType] || NODE_CONFIGS.feature;
  }
  
  private layoutNodeText(node: Node, config: NodeConfig, context: LayoutContext): any[] {
    const label = node.data?.label || 'Untitled';
    const description = node.data?.description;
    const nodeType = node.type || 'feature';
    
    const resolvedTheme = this.themeResolver.resolve(context.theme);
    const textElements: any[] = [];
    
    // Calculate base text positioning
    const baseX = node.position.x + config.padding.left;
    const baseY = node.position.y + config.padding.top;
    
    switch (nodeType) {
      case 'product':
        return this.layoutProductNodeText(label, description, baseX, baseY, resolvedTheme);
      case 'feature':
        return this.layoutFeatureNodeText(label, baseX, baseY, resolvedTheme);
      case 'component':
        return this.layoutComponentNodeText(label, baseX, baseY, resolvedTheme);
      case 'textBlock':
        return this.layoutTextBlockNodeText(node.data?.content || label, baseX, baseY, resolvedTheme);
      case 'group':
        return this.layoutGroupNodeText(label, baseX, baseY, resolvedTheme);
      default:
        return this.layoutFeatureNodeText(label, baseX, baseY, resolvedTheme);
    }
  }
  
  private layoutProductNodeText(label: string, description: string | undefined, x: number, y: number, theme: any): any[] {
    const textElements: any[] = [];
    
    // Title font
    const titleFont = {
      family: theme.typography.fontFamily,
      size: theme.typography.sizes.base,
      weight: theme.typography.weights.semibold,
      style: 'normal' as const,
    };
    
    // Add title
    const titleBounds = this.textMeasurer.measureTextBounds(label, titleFont);
    textElements.push({
      content: label,
      bounds: { ...titleBounds, x, y },
      font: titleFont,
      color: theme.colors.text.primary,
      align: 'left' as const,
      baseline: 'top' as const,
    });
    
    // Add "Product" subtitle
    const subtitleFont = {
      family: theme.typography.fontFamily,
      size: theme.typography.sizes.sm,
      weight: theme.typography.weights.normal,
      style: 'normal' as const,
    };
    
    const subtitleBounds = this.textMeasurer.measureTextBounds('Product', subtitleFont);
    textElements.push({
      content: 'Product',
      bounds: { ...subtitleBounds, x, y: y + titleBounds.height + 4 },
      font: subtitleFont,
      color: theme.colors.text.muted,
      align: 'left' as const,
      baseline: 'top' as const,
    });
    
    return textElements;
  }
  
  private layoutFeatureNodeText(label: string, x: number, y: number, theme: any): any[] {
    const titleFont = {
      family: theme.typography.fontFamily,
      size: theme.typography.sizes.base,
      weight: theme.typography.weights.medium,
      style: 'normal' as const,
    };
    
    const titleBounds = this.textMeasurer.measureTextBounds(label, titleFont);
    
    return [{
      content: label,
      bounds: { ...titleBounds, x, y: y + 8 }, // Vertically center in node
      font: titleFont,
      color: theme.colors.text.primary,
      align: 'left' as const,
      baseline: 'top' as const,
    }];
  }
  
  private layoutComponentNodeText(label: string, x: number, y: number, theme: any): any[] {
    const titleFont = {
      family: theme.typography.fontFamily,
      size: theme.typography.sizes.sm,
      weight: theme.typography.weights.medium,
      style: 'normal' as const,
    };
    
    const titleBounds = this.textMeasurer.measureTextBounds(label, titleFont);
    
    return [{
      content: label,
      bounds: { ...titleBounds, x, y: y + 6 }, // Vertically center in smaller node
      font: titleFont,
      color: theme.colors.text.primary,
      align: 'left' as const,
      baseline: 'top' as const,
    }];
  }
  
  private layoutTextBlockNodeText(content: string, x: number, y: number, theme: any): any[] {
    const textFont = {
      family: theme.typography.fontFamily,
      size: theme.typography.sizes.sm,
      weight: theme.typography.weights.normal,
      style: 'normal' as const,
    };
    
    // For text blocks, we might need to wrap text
    const maxWidth = 160; // Leave some padding
    const lines = this.textMeasurer.wrapText(content, textFont, maxWidth);
    const lineHeight = this.textMeasurer.getLineHeight(textFont);
    
    return lines.map((line, index) => {
      const lineBounds = this.textMeasurer.measureTextBounds(line, textFont);
      return {
        content: line,
        bounds: { ...lineBounds, x, y: y + (index * lineHeight) },
        font: textFont,
        color: theme.colors.text.primary,
        align: 'left' as const,
        baseline: 'top' as const,
      };
    });
  }
  
  private layoutGroupNodeText(label: string, x: number, y: number, theme: any): any[] {
    const titleFont = {
      family: theme.typography.fontFamily,
      size: theme.typography.sizes.lg,
      weight: theme.typography.weights.semibold,
      style: 'normal' as const,
    };
    
    const titleBounds = this.textMeasurer.measureTextBounds(label, titleFont);
    
    return [{
      content: label,
      bounds: { ...titleBounds, x, y },
      font: titleFont,
      color: theme.colors.text.secondary,
      align: 'left' as const,
      baseline: 'top' as const,
    }];
  }
  
  private calculateNodeBounds(node: Node, textElements: any[], config: NodeConfig): BoundingBox {
    const nodeType = node.type || 'feature';
    
    // Start with the node's position from React Flow
    let width = config.defaultWidth;
    let height = config.defaultHeight;
    
    // Calculate content-based dimensions
    if (textElements.length > 0) {
      const contentWidth = this.calculateContentWidth(textElements, config);
      const contentHeight = this.calculateContentHeight(textElements, config);
      
      // Adjust dimensions based on content
      width = Math.max(width, contentWidth);
      height = Math.max(height, contentHeight);
    }
    
    // Apply node type specific adjustments
    switch (nodeType) {
      case 'product':
        // Products need extra space for color bar and status badges
        width = Math.max(width, 240);
        height = Math.max(height, 72);
        break;
      case 'feature':
        // Features need space for left indicator
        width = Math.max(width, 200);
        height = Math.max(height, 52);
        break;
      case 'component':
        // Components are more compact
        width = Math.max(width, 160);
        height = Math.max(height, 44);
        break;
      case 'textBlock':
        // Text blocks size to content
        width = Math.max(width, 100);
        height = Math.max(height, 40);
        break;
      case 'group':
        // Groups are larger containers
        width = Math.max(width, 300);
        height = Math.max(height, 200);
        break;
    }
    
    // Ensure minimum dimensions
    width = Math.max(width, config.minWidth);
    height = Math.max(height, config.minHeight);
    
    return {
      x: node.position.x,
      y: node.position.y,
      width,
      height,
    };
  }
  
  private calculateContentWidth(textElements: any[], config: NodeConfig): number {
    if (textElements.length === 0) return config.defaultWidth;
    
    const maxTextWidth = Math.max(...textElements.map(t => t.bounds.width));
    return maxTextWidth + config.padding.left + config.padding.right;
  }
  
  private calculateContentHeight(textElements: any[], config: NodeConfig): number {
    if (textElements.length === 0) return config.defaultHeight;
    
    const totalTextHeight = textElements.reduce((sum, t) => sum + t.bounds.height, 0);
    const spacing = Math.max(0, (textElements.length - 1) * 4); // 4px between text elements
    
    return totalTextHeight + spacing + config.padding.top + config.padding.bottom;
  }
  
  private createNodeDecorations(node: Node, bounds: BoundingBox, config: NodeConfig, context: LayoutContext): any[] {
    const decorations: any[] = [];
    const nodeType = node.type || 'feature';
    const color = node.data?.color || this.getDefaultNodeColor(nodeType);
    const resolvedTheme = this.themeResolver.resolve(context.theme);
    
    // Add color indicator based on node type
    switch (nodeType) {
      case 'product':
        // Color bar for product nodes
        decorations.push({
          type: 'color-bar',
          bounds: {
            x: bounds.x + 16,
            y: bounds.y + 16,
            width: 12,
            height: 40,
          },
          styles: {
            fill: color,
          },
        });
        break;
        
      case 'feature':
        // Left border and small indicator for feature nodes
        decorations.push({
          type: 'indicator',
          bounds: {
            x: bounds.x + 16,
            y: bounds.y + 10,
            width: 8,
            height: 32,
          },
          styles: {
            fill: color,
          },
        });
        break;
        
      case 'component':
        // Small indicator for component nodes
        decorations.push({
          type: 'indicator',
          bounds: {
            x: bounds.x + 10,
            y: bounds.y + 10,
            width: 6,
            height: 24,
          },
          styles: {
            fill: color,
          },
        });
        break;
    }
    
    return decorations;
  }
  
  private calculateEdgePath(sourceNode: RenderNode, targetNode: RenderNode, edge: Edge): any[] {
    const edgeType = edge.data?.edgeType || edge.type || 'hierarchy';
    
    // Calculate connection points based on node positions and types
    const connectionPoints = this.calculateConnectionPoints(sourceNode, targetNode, edgeType);
    
    // Generate path based on edge type and geometry
    return this.generateEdgePath(connectionPoints.source, connectionPoints.target, edgeType);
  }
  
  private calculateConnectionPoints(sourceNode: RenderNode, targetNode: RenderNode, edgeType: string) {
    // Default connection points (center bottom to center top)
    let sourcePoint = {
      x: sourceNode.bounds.x + sourceNode.bounds.width / 2,
      y: sourceNode.bounds.y + sourceNode.bounds.height,
    };
    
    let targetPoint = {
      x: targetNode.bounds.x + targetNode.bounds.width / 2,
      y: targetNode.bounds.y,
    };
    
    // Adjust connection points based on relative positions and edge type
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    
    // For horizontal layouts or side connections
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 100) {
      if (dx > 0) {
        // Target is to the right
        sourcePoint = {
          x: sourceNode.bounds.x + sourceNode.bounds.width,
          y: sourceNode.bounds.y + sourceNode.bounds.height / 2,
        };
        targetPoint = {
          x: targetNode.bounds.x,
          y: targetNode.bounds.y + targetNode.bounds.height / 2,
        };
      } else {
        // Target is to the left
        sourcePoint = {
          x: sourceNode.bounds.x,
          y: sourceNode.bounds.y + sourceNode.bounds.height / 2,
        };
        targetPoint = {
          x: targetNode.bounds.x + targetNode.bounds.width,
          y: targetNode.bounds.y + targetNode.bounds.height / 2,
        };
      }
    }
    
    return { source: sourcePoint, target: targetPoint };
  }
  
  private generateEdgePath(source: { x: number; y: number }, target: { x: number; y: number }, edgeType: string): any[] {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    switch (edgeType) {
      case 'hierarchy':
        return this.generateHierarchyPath(source, target);
      case 'dependency':
        return this.generateDependencyPath(source, target);
      case 'integration':
        return this.generateIntegrationPath(source, target);
      case 'alternative':
        return this.generateAlternativePath(source, target);
      case 'extension':
        return this.generateExtensionPath(source, target);
      default:
        return this.generateHierarchyPath(source, target);
    }
  }
  
  private generateHierarchyPath(source: { x: number; y: number }, target: { x: number; y: number }): any[] {
    // Smooth bezier curve for hierarchy edges
    const dy = target.y - source.y;
    const controlOffset = Math.max(40, Math.abs(dy) * 0.4);
    
    return [
      { type: 'M', x: source.x, y: source.y },
      { 
        type: 'C', 
        x1: source.x, 
        y1: source.y + controlOffset, 
        x2: target.x, 
        y2: target.y - controlOffset, 
        x: target.x, 
        y: target.y 
      },
    ];
  }
  
  private generateDependencyPath(source: { x: number; y: number }, target: { x: number; y: number }): any[] {
    // Straighter path for dependencies to show directness
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // More horizontal - use gentle S-curve
      const midX = source.x + dx * 0.5;
      return [
        { type: 'M', x: source.x, y: source.y },
        { 
          type: 'C', 
          x1: midX, 
          y1: source.y, 
          x2: midX, 
          y2: target.y, 
          x: target.x, 
          y: target.y 
        },
      ];
    } else {
      // More vertical - use standard bezier
      return this.generateHierarchyPath(source, target);
    }
  }
  
  private generateIntegrationPath(source: { x: number; y: number }, target: { x: number; y: number }): any[] {
    // Similar to hierarchy but with different control points
    const dy = target.y - source.y;
    const controlOffset = Math.max(30, Math.abs(dy) * 0.3);
    
    return [
      { type: 'M', x: source.x, y: source.y },
      { 
        type: 'C', 
        x1: source.x, 
        y1: source.y + controlOffset, 
        x2: target.x, 
        y2: target.y - controlOffset, 
        x: target.x, 
        y: target.y 
      },
    ];
  }
  
  private generateAlternativePath(source: { x: number; y: number }, target: { x: number; y: number }): any[] {
    // Curved path to show alternative relationship
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const offset = Math.sign(dx) * 50; // Curve to the side
    
    return [
      { type: 'M', x: source.x, y: source.y },
      { 
        type: 'C', 
        x1: source.x + offset, 
        y1: source.y + dy * 0.3, 
        x2: target.x + offset, 
        y2: target.y - dy * 0.3, 
        x: target.x, 
        y: target.y 
      },
    ];
  }
  
  private generateExtensionPath(source: { x: number; y: number }, target: { x: number; y: number }): any[] {
    // Subtle curve for extensions
    const dy = target.y - source.y;
    const controlOffset = Math.max(20, Math.abs(dy) * 0.2);
    
    return [
      { type: 'M', x: source.x, y: source.y },
      { 
        type: 'C', 
        x1: source.x, 
        y1: source.y + controlOffset, 
        x2: target.x, 
        y2: target.y - controlOffset, 
        x: target.x, 
        y: target.y 
      },
    ];
  }
  
  private createEdgeMarkers(edgeType: string, styles: any): any[] {
    const markers: any[] = [];
    
    // Add arrow marker for most edge types
    if (['hierarchy', 'dependency', 'integration', 'extension'].includes(edgeType)) {
      markers.push({
        type: 'arrow',
        position: 'end',
        size: edgeType === 'dependency' ? 8 : 6,
        color: styles.stroke || '#64748b',
      });
    }
    
    // Add special markers for alternative edges
    if (edgeType === 'alternative') {
      markers.push({
        type: 'dot',
        position: 'end',
        size: 4,
        color: styles.stroke || '#3b82f6',
      });
    }
    
    return markers;
  }
  
  private createEdgeLabel(label: string, path: any[], context: LayoutContext): any {
    if (!label || path.length < 2) return undefined;
    
    // Calculate midpoint of the path for label positioning
    const startPoint = path[0];
    let midX = startPoint.x;
    let midY = startPoint.y;
    
    if (path[1]?.type === 'C') {
      const bezier = path[1];
      // Calculate approximate midpoint of bezier curve
      midX = (startPoint.x + bezier.x1 + bezier.x2 + bezier.x) / 4;
      midY = (startPoint.y + bezier.y1 + bezier.y2 + bezier.y) / 4;
    } else if (path[1]?.type === 'L') {
      const line = path[1];
      midX = (startPoint.x + line.x) / 2;
      midY = (startPoint.y + line.y) / 2;
    }
    
    const resolvedTheme = this.themeResolver.resolve(context.theme);
    const font = {
      family: ['ui-monospace', 'monospace'],
      size: resolvedTheme.typography.sizes.xs,
      weight: resolvedTheme.typography.weights.medium,
      style: 'normal' as const,
    };
    
    const bounds = this.textMeasurer.measureTextBounds(label, font);
    
    return {
      content: label,
      bounds: {
        ...bounds,
        x: midX - bounds.width / 2,
        y: midY - bounds.height / 2,
      },
      font,
      color: resolvedTheme.colors.text.secondary,
      align: 'center' as const,
      baseline: 'middle' as const,
    };
  }
  
  private calculateEdgeBounds(path: any[], markers: any[], label?: any): BoundingBox {
    // Calculate bounds from path points
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    path.forEach(command => {
      if ('x' in command && 'y' in command) {
        minX = Math.min(minX, command.x);
        minY = Math.min(minY, command.y);
        maxX = Math.max(maxX, command.x);
        maxY = Math.max(maxY, command.y);
      }
      if ('x1' in command && 'y1' in command) {
        minX = Math.min(minX, command.x1);
        minY = Math.min(minY, command.y1);
        maxX = Math.max(maxX, command.x1);
        maxY = Math.max(maxY, command.y1);
      }
      if ('x2' in command && 'y2' in command) {
        minX = Math.min(minX, command.x2);
        minY = Math.min(minY, command.y2);
        maxX = Math.max(maxX, command.x2);
        maxY = Math.max(maxY, command.y2);
      }
    });
    
    // Include label bounds if present
    if (label) {
      minX = Math.min(minX, label.bounds.x);
      minY = Math.min(minY, label.bounds.y);
      maxX = Math.max(maxX, label.bounds.x + label.bounds.width);
      maxY = Math.max(maxY, label.bounds.y + label.bounds.height);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  
  private createBackground(bounds: BoundingBox, context: LayoutContext): RenderBackground {
    const resolvedTheme = this.themeResolver.resolve(context.theme);
    
    return {
      bounds,
      fill: {
        type: 'solid',
        color: resolvedTheme.colors.surface,
      },
    };
  }
  
  private getNodeZIndex(nodeType: string): number {
    // Define z-index ordering for different node types
    switch (nodeType) {
      case 'group':
        return 1;
      case 'product':
        return 3;
      case 'feature':
        return 2;
      case 'component':
        return 2;
      case 'textBlock':
        return 2;
      default:
        return 2;
    }
  }
  
  private getDefaultNodeColor(nodeType: string): string {
    switch (nodeType) {
      case 'product':
        return '#10b981';
      case 'feature':
        return '#3b82f6';
      case 'component':
        return '#8b5cf6';
      case 'textBlock':
        return '#64748b';
      case 'group':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a layout engine instance with the provided dependencies
 */
export function createLayoutEngine(
  themeResolver: ThemeResolver,
  textMeasurer: TextMeasurer
): LayoutEngine {
  return new DocMapsLayoutEngine(themeResolver, textMeasurer);
}
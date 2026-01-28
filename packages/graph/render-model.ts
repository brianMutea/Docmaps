/**
 * Render Model Type Definitions for SVG Exporter
 * 
 * This module defines the intermediate representation used by the SVG exporter.
 * The render model normalizes visual elements with absolute positioning and styling,
 * providing a clean separation between UI rendering and export logic.
 */

// ============================================================================
// Core Geometric Types
// ============================================================================

/**
 * Represents a bounding box with absolute coordinates
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// Path and Shape Types
// ============================================================================

/**
 * SVG path commands for edge rendering
 */
export type PathCommand = 
  | { type: 'M'; x: number; y: number }  // Move to
  | { type: 'L'; x: number; y: number }  // Line to
  | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }  // Cubic Bezier
  | { type: 'Q'; x1: number; y1: number; x: number; y: number }  // Quadratic Bezier
  | { type: 'Z' };  // Close path

// ============================================================================
// Typography Types
// ============================================================================

/**
 * Font specification with fallbacks
 */
export interface FontSpec {
  family: string[];  // Font families with fallbacks
  size: number;      // Font size in pixels
  weight: number;    // Font weight (100-900)
  style: 'normal' | 'italic';
}

/**
 * Text element with positioning and styling
 */
export interface TextElement {
  content: string;
  bounds: BoundingBox;
  font: FontSpec;
  color: string;
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle' | 'bottom';
}

// ============================================================================
// Styling Types
// ============================================================================

/**
 * Resolved styles with concrete values (no theme tokens)
 */
export interface ResolvedStyles {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  filter?: string;
  [key: string]: string | number | undefined;
}

/**
 * Border specification for node shapes
 */
export interface BorderSpec {
  side: 'top' | 'right' | 'bottom' | 'left' | 'all';
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

/**
 * Fill specification for node shapes
 */
export interface FillSpec {
  type: 'solid' | 'gradient';
  color: string;
  gradient?: {
    type: 'linear' | 'radial';
    stops: Array<{ offset: number; color: string }>;
    direction?: { x1: number; y1: number; x2: number; y2: number };
  };
}

/**
 * Node shape definition
 */
export interface NodeShape {
  type: 'rectangle' | 'rounded-rectangle' | 'pill' | 'circle';
  cornerRadius?: number;
  borders: BorderSpec[];
  fills: FillSpec[];
}

// ============================================================================
// Decoration Types
// ============================================================================

/**
 * Visual decorations for nodes (color bars, indicators, etc.)
 */
export interface Decoration {
  type: 'color-bar' | 'indicator' | 'badge' | 'icon';
  bounds: BoundingBox;
  styles: ResolvedStyles;
  content?: string;
}

// ============================================================================
// Edge Types
// ============================================================================

/**
 * Edge marker (arrows, dots, etc.)
 */
export interface EdgeMarker {
  type: 'arrow' | 'dot' | 'diamond' | 'square';
  position: 'start' | 'end';
  size: number;
  color: string;
}

/**
 * Rendered edge with path and styling
 */
export interface RenderEdge {
  id: string;
  type: 'hierarchy' | 'dependency' | 'integration' | 'alternative' | 'extension';
  path: PathCommand[];
  styles: ResolvedStyles;
  markers: EdgeMarker[];
  label?: TextElement;
  bounds: BoundingBox;  // Bounding box of the entire edge including markers and labels
}

// ============================================================================
// Node Types
// ============================================================================

/**
 * Rendered node with absolute positioning and resolved styles
 */
export interface RenderNode {
  id: string;
  type: 'product' | 'feature' | 'component' | 'textBlock' | 'group';
  bounds: BoundingBox;
  shape: NodeShape;
  styles: ResolvedStyles;
  text?: TextElement[];
  decorations: Decoration[];
  zIndex?: number;  // For layering control
}

// ============================================================================
// Background Types
// ============================================================================

/**
 * Background rendering specification
 */
export interface RenderBackground {
  bounds: BoundingBox;
  fill: FillSpec;
  styles?: ResolvedStyles;
}

// ============================================================================
// Main Render Model
// ============================================================================

/**
 * Complete render model with all visual elements resolved
 */
export interface RenderModel {
  bounds: BoundingBox;           // Overall bounds of the entire diagram
  nodes: RenderNode[];           // All rendered nodes
  edges: RenderEdge[];           // All rendered edges
  background: RenderBackground;  // Background specification
  metadata?: {
    title?: string;
    description?: string;
    createdAt?: string;
    version?: string;
  };
}

// ============================================================================
// Export Configuration Types
// ============================================================================

/**
 * Export options for SVG generation
 */
export interface ExportOptions {
  mode: 'editable' | 'print-safe';  // Text handling mode
  backgroundColor?: string;
  padding?: number;
  embedFonts?: boolean;
  includeMetadata?: boolean;
  optimizeForTool?: 'figma' | 'illustrator' | 'web' | 'generic';
  dimensions?: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Viewport transformation information
 */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Theme resolution context
 */
export interface ThemeContext {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColors: Record<string, string>;
  typography: {
    fontFamily: string[];
    baseFontSize: number;
  };
}

/**
 * Layout computation context
 */
export interface LayoutContext {
  viewport: Viewport;
  theme: ThemeContext;
  textMeasurement: {
    canvas?: HTMLCanvasElement;
    context?: CanvasRenderingContext2D;
  };
}
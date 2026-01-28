/**
 * SVG Exporter - Redesigned Architecture
 * 
 * This is the main entry point for the new SVG export system.
 * It integrates the layout engine, theme resolver, text measurer, and SVG serializer
 * to provide a clean, deterministic SVG export functionality.
 */

import type { Node, Edge } from 'reactflow';
import { createLayoutEngine } from '../layout-engine';
import { createThemeResolver, extractThemeContext } from '../theme-resolver';
import { createTextMeasurer } from '../text-measurer';
import { DocMapsSVGSerializer } from '../svg-serializer';
import type { ExportOptions, Viewport } from '../render-model';

// ============================================================================
// Export Options Interface
// ============================================================================

export interface SVGExportOptions {
  /**
   * Title for the exported SVG (used in metadata and filename)
   */
  title: string;
  
  /**
   * Export mode: 'editable' for text elements, 'print-safe' for paths
   * @default 'editable'
   */
  mode?: 'editable' | 'print-safe';
  
  /**
   * Background color for the SVG
   * @default '#ffffff'
   */
  backgroundColor?: string;
  
  /**
   * Padding around the diagram in pixels
   * @default 40
   */
  padding?: number;
  
  /**
   * Whether to embed fonts in the SVG
   * @default false
   */
  embedFonts?: boolean;
  
  /**
   * Whether to include metadata in the SVG
   * @default true
   */
  includeMetadata?: boolean;
  
  /**
   * Viewport transformation (if not provided, will be calculated from nodes)
   */
  viewport?: Viewport;
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Export React Flow graph to SVG using the redesigned architecture
 * 
 * This function:
 * 1. Creates the necessary dependencies (layout engine, theme resolver, etc.)
 * 2. Computes the layout from React Flow data
 * 3. Serializes the render model to SVG
 * 4. Triggers a download of the SVG file
 * 
 * @param nodes - React Flow nodes
 * @param edges - React Flow edges
 * @param options - Export configuration options
 */
export function exportToSVGRedesign(
  nodes: Node[],
  edges: Edge[],
  options: SVGExportOptions
): void {
  try {
    // Validate inputs
    if (!nodes || nodes.length === 0) {
      throw new Error('No nodes to export');
    }
    
    // Create dependencies
    const themeResolver = createThemeResolver();
    const textMeasurer = createTextMeasurer();
    const layoutEngine = createLayoutEngine(themeResolver, textMeasurer);
    const serializer = new DocMapsSVGSerializer();
    
    // Extract theme context
    const themeContext = extractThemeContext();
    
    // Determine viewport
    const viewport = options.viewport || calculateViewportFromNodes(nodes);
    
    // Compute layout (convert React Flow data to render model)
    const renderModel = layoutEngine.computeLayout(
      nodes,
      edges,
      viewport,
      themeContext
    );
    
    // Add title to metadata
    if (options.title) {
      renderModel.metadata = {
        ...renderModel.metadata,
        title: options.title,
        description: `DocMaps export: ${options.title}`,
      };
    }
    
    // Prepare export options
    const exportOptions: ExportOptions = {
      mode: options.mode || 'editable',
      backgroundColor: options.backgroundColor || '#ffffff',
      padding: options.padding ?? 40,
      embedFonts: options.embedFonts ?? false,
      includeMetadata: options.includeMetadata ?? true,
    };
    
    // Serialize to SVG
    const svgString = serializer.serialize(renderModel, exportOptions);
    
    // Download the SVG file
    downloadSVG(svgString, options.title);
    
  } catch (error) {
    console.error('SVG Export Error:', error);
    throw error;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate viewport from node positions
 * This provides a default viewport when none is specified
 */
function calculateViewportFromNodes(nodes: Node[]): Viewport {
  if (nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }
  
  // Find the bounds of all nodes
  let minX = Infinity;
  let minY = Infinity;
  
  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
  });
  
  // Return viewport that centers the content
  return {
    x: -minX,
    y: -minY,
    zoom: 1,
  };
}

/**
 * Download SVG string as a file
 */
function downloadSVG(svgString: string, title: string): void {
  // Create blob
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Generate filename from title
  const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`;
  link.download = filename;
  link.href = url;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Export Presets
// ============================================================================

/**
 * Preset configurations for common export scenarios
 */
export const EXPORT_PRESETS = {
  /**
   * Default preset - balanced for general use
   */
  default: {
    mode: 'editable' as const,
    padding: 40,
    embedFonts: false,
    includeMetadata: true,
  },
  
  /**
   * Web preset - optimized for web display
   */
  web: {
    mode: 'editable' as const,
    padding: 20,
    embedFonts: false,
    includeMetadata: false,
  },
  
  /**
   * Print preset - optimized for printing and external tools
   */
  print: {
    mode: 'print-safe' as const,
    padding: 60,
    embedFonts: true,
    includeMetadata: true,
  },
  
  /**
   * Presentation preset - optimized for slides
   */
  presentation: {
    mode: 'editable' as const,
    padding: 80,
    embedFonts: false,
    includeMetadata: false,
    backgroundColor: 'transparent',
  },
} as const;

/**
 * Export with a preset configuration
 */
export function exportWithPreset(
  nodes: Node[],
  edges: Edge[],
  title: string,
  preset: keyof typeof EXPORT_PRESETS = 'default'
): void {
  const presetConfig = EXPORT_PRESETS[preset];
  exportToSVGRedesign(nodes, edges, {
    title,
    ...presetConfig,
  });
}

// ============================================================================
// Validation and Diagnostics
// ============================================================================

/**
 * Validate that the export system is properly configured
 * Returns any issues found
 */
export function validateExportSystem(): string[] {
  const issues: string[] = [];
  
  try {
    // Check if canvas is available for text measurement
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      issues.push('Canvas 2D context not available - text measurement will use approximation');
    }
  } catch (error) {
    issues.push('Canvas not available - text measurement will use approximation');
  }
  
  try {
    // Check if we can create the necessary components
    const themeResolver = createThemeResolver();
    const textMeasurer = createTextMeasurer();
    const layoutEngine = createLayoutEngine(themeResolver, textMeasurer);
    const serializer = new DocMapsSVGSerializer();
    
    // All components created successfully
  } catch (error) {
    issues.push(`Failed to initialize export system: ${error}`);
  }
  
  return issues;
}

/**
 * Get diagnostic information about the export system
 */
export function getExportDiagnostics(): {
  canvasAvailable: boolean;
  textMeasurementMode: 'canvas' | 'approximate';
  componentsInitialized: boolean;
  issues: string[];
} {
  const issues = validateExportSystem();
  
  let canvasAvailable = false;
  try {
    const canvas = document.createElement('canvas');
    canvasAvailable = !!canvas.getContext('2d');
  } catch {
    canvasAvailable = false;
  }
  
  return {
    canvasAvailable,
    textMeasurementMode: canvasAvailable ? 'canvas' : 'approximate',
    componentsInitialized: issues.length === 0,
    issues,
  };
}

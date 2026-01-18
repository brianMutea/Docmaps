/**
 * Professional SVG Exporter for DocMaps
 * 
 * Creates pixel-perfect SVG exports that match the rendered canvas exactly.
 * Supports all node types (product, feature, component) with proper styling,
 * edge labels, and accurate arrow markers.
 */

import type { Node, Edge } from 'reactflow';

interface ExportOptions {
  title: string;
  backgroundColor?: string;
  padding?: number;
}

// Node type configurations matching the actual React components
const NODE_CONFIG = {
  product: {
    minWidth: 200,
    maxWidth: 280,
    height: 72,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
    subtitleFontSize: 12,
    colorBarWidth: 12,
    colorBarHeight: 40,
    paddingX: 16,
    paddingY: 12,
    defaultColor: '#10b981',
  },
  feature: {
    minWidth: 160,
    maxWidth: 240,
    height: 52,
    borderRadius: 12,
    leftBorderWidth: 4,
    fontSize: 14,
    fontWeight: '500',
    colorIndicatorWidth: 8,
    colorIndicatorHeight: 32,
    paddingX: 12,
    paddingY: 12,
    defaultColor: '#3b82f6',
  },
  component: {
    minWidth: 120,
    maxWidth: 180,
    height: 44,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '500',
    colorIndicatorWidth: 6,
    colorIndicatorHeight: 24,
    paddingX: 10,
    paddingY: 10,
    defaultColor: '#8b5cf6',
  },
} as const;

// Edge type configurations
const EDGE_CONFIG = {
  hierarchy: { color: '#64748b', strokeWidth: 2, dashArray: '' },
  related: { color: '#3b82f6', strokeWidth: 2, dashArray: '5,5' },
  'depends-on': { color: '#ef4444', strokeWidth: 3, dashArray: '' },
  optional: { color: '#94a3b8', strokeWidth: 2, dashArray: '2,2' },
} as const;

// Status colors
const STATUS_COLORS = {
  beta: '#3b82f6',
  experimental: '#f59e0b',
  deprecated: '#ef4444',
} as const;

/**
 * Measure text width using canvas
 */
function measureText(text: string, fontSize: number, fontWeight: string): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  return ctx.measureText(text).width;
}

/**
 * Calculate node dimensions based on type and content
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  const type = (node.type || 'feature') as 'product' | 'feature' | 'component';
  const label = node.data.label || 'Untitled';
  
  let textWidth: number;
  let totalPadding: number;
  let minWidth: number;
  let maxWidth: number;
  let height: number;
  
  if (type === 'product') {
    const config = NODE_CONFIG.product;
    textWidth = measureText(label, config.fontSize, config.fontWeight);
    totalPadding = config.paddingX * 2 + config.colorBarWidth + 12;
    minWidth = config.minWidth;
    maxWidth = config.maxWidth;
    height = config.height;
  } else if (type === 'feature') {
    const config = NODE_CONFIG.feature;
    textWidth = measureText(label, config.fontSize, config.fontWeight);
    totalPadding = config.paddingX * 2 + config.leftBorderWidth + config.colorIndicatorWidth + 16;
    minWidth = config.minWidth;
    maxWidth = config.maxWidth;
    height = config.height;
  } else {
    const config = NODE_CONFIG.component;
    textWidth = measureText(label, config.fontSize, config.fontWeight);
    totalPadding = config.paddingX * 2 + config.colorIndicatorWidth + 12;
    minWidth = config.minWidth;
    maxWidth = config.maxWidth;
    height = config.height;
  }
  
  const width = Math.min(maxWidth, Math.max(minWidth, textWidth + totalPadding));
  
  return { width, height };
}

/**
 * Create SVG defs (filters, markers, gradients)
 */
function createDefs(svgNS: string, _edges: Edge[]): Element {
  const defs = document.createElementNS(svgNS, 'defs');
  
  // Shadow filters for each node type
  const shadowConfigs = [
    { id: 'shadow-product', dy: 4, blur: 8, opacity: 0.1 },
    { id: 'shadow-feature', dy: 2, blur: 6, opacity: 0.08 },
    { id: 'shadow-component', dy: 1, blur: 4, opacity: 0.06 },
  ];
  
  shadowConfigs.forEach(({ id, dy, blur, opacity }) => {
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const feDropShadow = document.createElementNS(svgNS, 'feDropShadow');
    feDropShadow.setAttribute('dx', '0');
    feDropShadow.setAttribute('dy', String(dy));
    feDropShadow.setAttribute('stdDeviation', String(blur));
    feDropShadow.setAttribute('flood-color', `rgba(0,0,0,${opacity})`);
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);
  });
  
  // Arrow markers for each edge type
  Object.entries(EDGE_CONFIG).forEach(([type, config]) => {
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', `arrow-${type}`);
    marker.setAttribute('markerWidth', '12');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '4');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');
    
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M 0 0 L 12 4 L 0 8 L 3 4 Z');
    path.setAttribute('fill', config.color);
    marker.appendChild(path);
    defs.appendChild(marker);
  });
  
  return defs;
}

/**
 * Draw a product node
 */
function drawProductNode(
  svgNS: string,
  node: Node,
  x: number,
  y: number,
  width: number,
  height: number
): Element {
  const g = document.createElementNS(svgNS, 'g');
  const config = NODE_CONFIG.product;
  const color = node.data.color || config.defaultColor;
  
  // Main card background
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  rect.setAttribute('rx', String(config.borderRadius));
  rect.setAttribute('fill', '#ffffff');
  rect.setAttribute('filter', 'url(#shadow-product)');
  g.appendChild(rect);
  
  // Subtle gradient overlay at top
  const gradientRect = document.createElementNS(svgNS, 'rect');
  gradientRect.setAttribute('x', String(x));
  gradientRect.setAttribute('y', String(y));
  gradientRect.setAttribute('width', String(width));
  gradientRect.setAttribute('height', String(height / 2));
  gradientRect.setAttribute('rx', String(config.borderRadius));
  gradientRect.setAttribute('fill', color);
  gradientRect.setAttribute('opacity', '0.05');
  g.appendChild(gradientRect);
  
  // Color bar on left
  const colorBar = document.createElementNS(svgNS, 'rect');
  colorBar.setAttribute('x', String(x + config.paddingX));
  colorBar.setAttribute('y', String(y + (height - config.colorBarHeight) / 2));
  colorBar.setAttribute('width', String(config.colorBarWidth));
  colorBar.setAttribute('height', String(config.colorBarHeight));
  colorBar.setAttribute('rx', '6');
  colorBar.setAttribute('fill', color);
  g.appendChild(colorBar);
  
  // Label
  const label = document.createElementNS(svgNS, 'text');
  label.setAttribute('x', String(x + config.paddingX + config.colorBarWidth + 12));
  label.setAttribute('y', String(y + height / 2 - 4));
  label.setAttribute('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  label.setAttribute('font-size', String(config.fontSize));
  label.setAttribute('font-weight', config.fontWeight);
  label.setAttribute('fill', '#111827');
  label.setAttribute('dominant-baseline', 'middle');
  label.textContent = node.data.label || 'Untitled';
  g.appendChild(label);
  
  // Subtitle "Product"
  const subtitle = document.createElementNS(svgNS, 'text');
  subtitle.setAttribute('x', String(x + config.paddingX + config.colorBarWidth + 12));
  subtitle.setAttribute('y', String(y + height / 2 + 12));
  subtitle.setAttribute('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  subtitle.setAttribute('font-size', String(config.subtitleFontSize));
  subtitle.setAttribute('font-weight', '400');
  subtitle.setAttribute('fill', '#6b7280');
  subtitle.setAttribute('dominant-baseline', 'middle');
  subtitle.textContent = 'Product';
  g.appendChild(subtitle);
  
  return g;
}

/**
 * Draw a feature node
 */
function drawFeatureNode(
  svgNS: string,
  node: Node,
  x: number,
  y: number,
  width: number,
  height: number
): Element {
  const g = document.createElementNS(svgNS, 'g');
  const config = NODE_CONFIG.feature;
  const color = node.data.color || config.defaultColor;
  
  // Main card background
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  rect.setAttribute('rx', String(config.borderRadius));
  rect.setAttribute('fill', '#ffffff');
  rect.setAttribute('stroke', '#e5e7eb');
  rect.setAttribute('stroke-width', '1');
  rect.setAttribute('filter', 'url(#shadow-feature)');
  g.appendChild(rect);
  
  // Left accent border
  const leftBorder = document.createElementNS(svgNS, 'rect');
  leftBorder.setAttribute('x', String(x));
  leftBorder.setAttribute('y', String(y));
  leftBorder.setAttribute('width', String(config.leftBorderWidth));
  leftBorder.setAttribute('height', String(height));
  leftBorder.setAttribute('fill', color);
  // Clip to match border radius
  const clipPath = document.createElementNS(svgNS, 'clipPath');
  clipPath.setAttribute('id', `clip-${node.id}`);
  const clipRect = document.createElementNS(svgNS, 'rect');
  clipRect.setAttribute('x', String(x));
  clipRect.setAttribute('y', String(y));
  clipRect.setAttribute('width', String(width));
  clipRect.setAttribute('height', String(height));
  clipRect.setAttribute('rx', String(config.borderRadius));
  clipPath.appendChild(clipRect);
  g.appendChild(clipPath);
  leftBorder.setAttribute('clip-path', `url(#clip-${node.id})`);
  g.appendChild(leftBorder);
  
  // Color indicator
  const indicator = document.createElementNS(svgNS, 'rect');
  indicator.setAttribute('x', String(x + config.leftBorderWidth + config.paddingX));
  indicator.setAttribute('y', String(y + (height - config.colorIndicatorHeight) / 2));
  indicator.setAttribute('width', String(config.colorIndicatorWidth));
  indicator.setAttribute('height', String(config.colorIndicatorHeight));
  indicator.setAttribute('rx', '4');
  indicator.setAttribute('fill', color);
  g.appendChild(indicator);
  
  // Label
  const label = document.createElementNS(svgNS, 'text');
  label.setAttribute('x', String(x + config.leftBorderWidth + config.paddingX + config.colorIndicatorWidth + 10));
  label.setAttribute('y', String(y + height / 2));
  label.setAttribute('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  label.setAttribute('font-size', String(config.fontSize));
  label.setAttribute('font-weight', config.fontWeight);
  label.setAttribute('fill', '#111827');
  label.setAttribute('dominant-baseline', 'middle');
  label.textContent = node.data.label || 'Untitled';
  g.appendChild(label);
  
  return g;
}

/**
 * Draw a component node
 */
function drawComponentNode(
  svgNS: string,
  node: Node,
  x: number,
  y: number,
  width: number,
  height: number
): Element {
  const g = document.createElementNS(svgNS, 'g');
  const config = NODE_CONFIG.component;
  const color = node.data.color || config.defaultColor;
  
  // Main card background
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  rect.setAttribute('rx', String(config.borderRadius));
  rect.setAttribute('fill', '#ffffff');
  rect.setAttribute('stroke', '#f3f4f6');
  rect.setAttribute('stroke-width', '1');
  rect.setAttribute('filter', 'url(#shadow-component)');
  g.appendChild(rect);
  
  // Color indicator
  const indicator = document.createElementNS(svgNS, 'rect');
  indicator.setAttribute('x', String(x + config.paddingX));
  indicator.setAttribute('y', String(y + (height - config.colorIndicatorHeight) / 2));
  indicator.setAttribute('width', String(config.colorIndicatorWidth));
  indicator.setAttribute('height', String(config.colorIndicatorHeight));
  indicator.setAttribute('rx', '3');
  indicator.setAttribute('fill', color);
  g.appendChild(indicator);
  
  // Label
  const label = document.createElementNS(svgNS, 'text');
  label.setAttribute('x', String(x + config.paddingX + config.colorIndicatorWidth + 8));
  label.setAttribute('y', String(y + height / 2));
  label.setAttribute('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  label.setAttribute('font-size', String(config.fontSize));
  label.setAttribute('font-weight', config.fontWeight);
  label.setAttribute('fill', '#374151');
  label.setAttribute('dominant-baseline', 'middle');
  label.textContent = node.data.label || 'Untitled';
  g.appendChild(label);
  
  return g;
}

/**
 * Draw status indicator on a node
 */
function drawStatusIndicator(
  svgNS: string,
  node: Node,
  x: number,
  y: number,
  width: number
): Element | null {
  const status = node.data.status;
  if (!status || status === 'stable') return null;
  
  const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (!color) return null;
  
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', String(x + width - 14));
  circle.setAttribute('cy', String(y + 14));
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', color);
  
  return circle;
}

/**
 * Draw an edge with optional label
 */
function drawEdge(
  svgNS: string,
  edge: Edge,
  sourceNode: Node,
  targetNode: Node,
  offsetX: number,
  offsetY: number,
  nodeDimensions: Map<string, { width: number; height: number }>
): Element {
  const g = document.createElementNS(svgNS, 'g');
  
  const sourceDims = nodeDimensions.get(sourceNode.id)!;
  const targetDims = nodeDimensions.get(targetNode.id)!;
  
  // Calculate connection points (bottom center of source, top center of target)
  const sx = sourceNode.position.x + offsetX + sourceDims.width / 2;
  const sy = sourceNode.position.y + offsetY + sourceDims.height;
  const tx = targetNode.position.x + offsetX + targetDims.width / 2;
  const ty = targetNode.position.y + offsetY;
  
  const edgeType = (edge.data?.edgeType || 'hierarchy') as keyof typeof EDGE_CONFIG;
  const config = EDGE_CONFIG[edgeType] || EDGE_CONFIG.hierarchy;
  
  // Calculate bezier curve control points
  const dy = ty - sy;
  const controlOffset = Math.max(40, Math.abs(dy) * 0.4);
  
  // Create smooth bezier path
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', `M ${sx} ${sy} C ${sx} ${sy + controlOffset}, ${tx} ${ty - controlOffset}, ${tx} ${ty}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', config.color);
  path.setAttribute('stroke-width', String(config.strokeWidth));
  if (config.dashArray) {
    path.setAttribute('stroke-dasharray', config.dashArray);
  }
  path.setAttribute('marker-end', `url(#arrow-${edgeType})`);
  g.appendChild(path);
  
  // Draw edge label if present
  const edgeLabel = edge.data?.label || edge.label;
  if (edgeLabel) {
    // Calculate label position (middle of the curve)
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    
    // Background for label
    const labelText = String(edgeLabel);
    const labelWidth = measureText(labelText, 11, '500') + 12;
    const labelHeight = 18;
    
    const labelBg = document.createElementNS(svgNS, 'rect');
    labelBg.setAttribute('x', String(midX - labelWidth / 2));
    labelBg.setAttribute('y', String(midY - labelHeight / 2));
    labelBg.setAttribute('width', String(labelWidth));
    labelBg.setAttribute('height', String(labelHeight));
    labelBg.setAttribute('rx', '4');
    labelBg.setAttribute('fill', '#f8fafc');
    labelBg.setAttribute('stroke', '#e2e8f0');
    labelBg.setAttribute('stroke-width', '1');
    g.appendChild(labelBg);
    
    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', String(midX));
    label.setAttribute('y', String(midY));
    label.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace');
    label.setAttribute('font-size', '11');
    label.setAttribute('font-weight', '500');
    label.setAttribute('fill', '#64748b');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.textContent = labelText;
    g.appendChild(label);
  }
  
  return g;
}

/**
 * Export nodes and edges to SVG
 */
export function exportToSVG(
  nodes: Node[],
  edges: Edge[],
  options: ExportOptions
): void {
  if (nodes.length === 0) {
    throw new Error('No nodes to export');
  }
  
  const { title, backgroundColor = '#f8fafc', padding = 80 } = options;
  const svgNS = 'http://www.w3.org/2000/svg';
  
  // Pre-calculate all node dimensions
  const nodeDimensions = new Map<string, { width: number; height: number }>();
  nodes.forEach(node => {
    nodeDimensions.set(node.id, getNodeDimensions(node));
  });
  
  // Calculate bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    const dims = nodeDimensions.get(node.id)!;
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + dims.width);
    maxY = Math.max(maxY, node.position.y + dims.height);
  });
  
  const svgWidth = maxX - minX + padding * 2;
  const svgHeight = maxY - minY + padding * 2;
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;
  
  // Create SVG element
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', String(svgWidth));
  svg.setAttribute('height', String(svgHeight));
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  
  // Add defs
  svg.appendChild(createDefs(svgNS, edges));
  
  // Background
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', String(svgWidth));
  bg.setAttribute('height', String(svgHeight));
  bg.setAttribute('fill', backgroundColor);
  svg.appendChild(bg);
  
  // Draw edges first (behind nodes)
  const edgesGroup = document.createElementNS(svgNS, 'g');
  edgesGroup.setAttribute('class', 'edges');
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (sourceNode && targetNode) {
      edgesGroup.appendChild(drawEdge(svgNS, edge, sourceNode, targetNode, offsetX, offsetY, nodeDimensions));
    }
  });
  svg.appendChild(edgesGroup);
  
  // Draw nodes
  const nodesGroup = document.createElementNS(svgNS, 'g');
  nodesGroup.setAttribute('class', 'nodes');
  nodes.forEach(node => {
    const dims = nodeDimensions.get(node.id)!;
    const x = node.position.x + offsetX;
    const y = node.position.y + offsetY;
    const type = node.type || 'feature';
    
    let nodeElement: Element;
    switch (type) {
      case 'product':
        nodeElement = drawProductNode(svgNS, node, x, y, dims.width, dims.height);
        break;
      case 'feature':
        nodeElement = drawFeatureNode(svgNS, node, x, y, dims.width, dims.height);
        break;
      case 'component':
      default:
        nodeElement = drawComponentNode(svgNS, node, x, y, dims.width, dims.height);
        break;
    }
    
    // Add status indicator if needed
    const statusIndicator = drawStatusIndicator(svgNS, node, x, y, dims.width);
    if (statusIndicator) {
      nodeElement.appendChild(statusIndicator);
    }
    
    nodesGroup.appendChild(nodeElement);
  });
  svg.appendChild(nodesGroup);
  
  // Serialize and download
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svg);
  svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

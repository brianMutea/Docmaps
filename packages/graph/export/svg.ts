/**
 * Professional SVG Exporter for DocMaps
 * 
 * Creates accurate SVG exports by using React Flow data combined with 
 * computed styles from the actual rendered components.
 */

import type { Node, Edge, ReactFlowInstance } from 'reactflow';

interface ExportOptions {
  title: string;
  backgroundColor?: string;
  padding?: number;
  reactFlowInstance?: ReactFlowInstance;
}

/**
 * Convert CSS color to hex format
 */
function toHex(color: string): string {
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
  
  return '#000000';
}

/**
 * Get node dimensions based on actual DOM element or fallback to defaults
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  // Try to get dimensions from actual DOM element
  const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
  if (nodeElement) {
    const rect = nodeElement.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }
  
  // Fallback to type-based defaults
  const type = node.type || 'feature';
  switch (type) {
    case 'product':
      return { width: 240, height: 72 };
    case 'feature':
      return { width: 200, height: 52 };
    case 'component':
      return { width: 160, height: 44 };
    case 'textBlock':
      return { width: 200, height: 60 };
    case 'group':
      return { width: 300, height: 200 };
    default:
      return { width: 200, height: 52 };
  }
}

/**
 * Get node colors from actual DOM element or fallback to defaults
 */
function getNodeColors(node: Node): { primary: string; background: string; text: string } {
  const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
  
  if (nodeElement) {
    const style = window.getComputedStyle(nodeElement);
    const colorIndicator = nodeElement.querySelector('[style*="background-color"]');
    
    return {
      primary: colorIndicator ? toHex(window.getComputedStyle(colorIndicator).backgroundColor) : node.data.color || '#3b82f6',
      background: toHex(style.backgroundColor),
      text: toHex(style.color)
    };
  }
  
  // Fallback colors based on type
  const type = node.type || 'feature';
  switch (type) {
    case 'product':
      return { primary: node.data.color || '#10b981', background: '#ffffff', text: '#111827' };
    case 'feature':
      return { primary: node.data.color || '#3b82f6', background: '#ffffff', text: '#111827' };
    case 'component':
      return { primary: node.data.color || '#8b5cf6', background: '#ffffff', text: '#374151' };
    default:
      return { primary: '#3b82f6', background: '#ffffff', text: '#111827' };
  }
}

/**
 * Create SVG representation of a product node
 */
function createProductNode(svgNS: string, node: Node, x: number, y: number): Element {
  const { width, height } = getNodeDimensions(node);
  const colors = getNodeColors(node);
  
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', 'product-node');
  
  // Main background
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('x', String(x));
  bg.setAttribute('y', String(y));
  bg.setAttribute('width', String(width));
  bg.setAttribute('height', String(height));
  bg.setAttribute('rx', '12');
  bg.setAttribute('fill', colors.background);
  bg.setAttribute('stroke', '#e5e7eb');
  bg.setAttribute('stroke-width', '1');
  bg.setAttribute('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');
  g.appendChild(bg);
  
  // Color bar
  const colorBar = document.createElementNS(svgNS, 'rect');
  colorBar.setAttribute('x', String(x + 16));
  colorBar.setAttribute('y', String(y + 16));
  colorBar.setAttribute('width', '12');
  colorBar.setAttribute('height', '40');
  colorBar.setAttribute('rx', '6');
  colorBar.setAttribute('fill', colors.primary);
  g.appendChild(colorBar);
  
  // Title
  const title = document.createElementNS(svgNS, 'text');
  title.setAttribute('x', String(x + 40));
  title.setAttribute('y', String(y + 28));
  title.setAttribute('font-family', 'system-ui, sans-serif');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', '600');
  title.setAttribute('fill', colors.text);
  title.setAttribute('dominant-baseline', 'middle');
  title.textContent = node.data.label || 'Untitled';
  g.appendChild(title);
  
  // Subtitle
  const subtitle = document.createElementNS(svgNS, 'text');
  subtitle.setAttribute('x', String(x + 40));
  subtitle.setAttribute('y', String(y + 48));
  subtitle.setAttribute('font-family', 'system-ui, sans-serif');
  subtitle.setAttribute('font-size', '12');
  subtitle.setAttribute('font-weight', '400');
  subtitle.setAttribute('fill', '#6b7280');
  subtitle.setAttribute('dominant-baseline', 'middle');
  subtitle.textContent = 'Product';
  g.appendChild(subtitle);
  
  return g;
}

/**
 * Create SVG representation of a feature node
 */
function createFeatureNode(svgNS: string, node: Node, x: number, y: number): Element {
  const { width, height } = getNodeDimensions(node);
  const colors = getNodeColors(node);
  
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', 'feature-node');
  
  // Main background
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('x', String(x));
  bg.setAttribute('y', String(y));
  bg.setAttribute('width', String(width));
  bg.setAttribute('height', String(height));
  bg.setAttribute('rx', '12');
  bg.setAttribute('fill', colors.background);
  bg.setAttribute('stroke', '#e5e7eb');
  bg.setAttribute('stroke-width', '1');
  bg.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');
  g.appendChild(bg);
  
  // Left border
  const leftBorder = document.createElementNS(svgNS, 'rect');
  leftBorder.setAttribute('x', String(x));
  leftBorder.setAttribute('y', String(y));
  leftBorder.setAttribute('width', '4');
  leftBorder.setAttribute('height', String(height));
  leftBorder.setAttribute('fill', colors.primary);
  leftBorder.setAttribute('rx', '12');
  g.appendChild(leftBorder);
  
  // Color indicator
  const indicator = document.createElementNS(svgNS, 'rect');
  indicator.setAttribute('x', String(x + 16));
  indicator.setAttribute('y', String(y + 10));
  indicator.setAttribute('width', '8');
  indicator.setAttribute('height', '32');
  indicator.setAttribute('rx', '4');
  indicator.setAttribute('fill', colors.primary);
  g.appendChild(indicator);
  
  // Title
  const title = document.createElementNS(svgNS, 'text');
  title.setAttribute('x', String(x + 36));
  title.setAttribute('y', String(y + height / 2));
  title.setAttribute('font-family', 'system-ui, sans-serif');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', '500');
  title.setAttribute('fill', colors.text);
  title.setAttribute('dominant-baseline', 'middle');
  title.textContent = node.data.label || 'Untitled';
  g.appendChild(title);
  
  return g;
}

/**
 * Create SVG representation of a component node
 */
function createComponentNode(svgNS: string, node: Node, x: number, y: number): Element {
  const { width, height } = getNodeDimensions(node);
  const colors = getNodeColors(node);
  
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', 'component-node');
  
  // Main background
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('x', String(x));
  bg.setAttribute('y', String(y));
  bg.setAttribute('width', String(width));
  bg.setAttribute('height', String(height));
  bg.setAttribute('rx', '8');
  bg.setAttribute('fill', colors.background);
  bg.setAttribute('stroke', '#f3f4f6');
  bg.setAttribute('stroke-width', '1');
  bg.setAttribute('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))');
  g.appendChild(bg);
  
  // Color indicator
  const indicator = document.createElementNS(svgNS, 'rect');
  indicator.setAttribute('x', String(x + 10));
  indicator.setAttribute('y', String(y + 10));
  indicator.setAttribute('width', '6');
  indicator.setAttribute('height', '24');
  indicator.setAttribute('rx', '3');
  indicator.setAttribute('fill', colors.primary);
  g.appendChild(indicator);
  
  // Title
  const title = document.createElementNS(svgNS, 'text');
  title.setAttribute('x', String(x + 26));
  title.setAttribute('y', String(y + height / 2));
  title.setAttribute('font-family', 'system-ui, sans-serif');
  title.setAttribute('font-size', '12');
  title.setAttribute('font-weight', '500');
  title.setAttribute('fill', colors.text);
  title.setAttribute('dominant-baseline', 'middle');
  title.textContent = node.data.label || 'Untitled';
  g.appendChild(title);
  
  return g;
}

/**
 * Create SVG representation of an edge
 */
function createEdge(svgNS: string, edge: Edge, sourceNode: Node, targetNode: Node, nodeDimensions: Map<string, { width: number; height: number }>): Element {
  const sourceDims = nodeDimensions.get(sourceNode.id)!;
  const targetDims = nodeDimensions.get(targetNode.id)!;
  
  // Calculate connection points
  const sx = sourceNode.position.x + sourceDims.width / 2;
  const sy = sourceNode.position.y + sourceDims.height;
  const tx = targetNode.position.x + targetDims.width / 2;
  const ty = targetNode.position.y;
  
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', 'edge');
  
  // Determine edge style based on type
  const edgeType = edge.data?.edgeType || edge.type || 'hierarchy';
  let strokeColor = '#64748b';
  let strokeWidth = '2';
  let strokeDasharray = '';
  
  switch (edgeType) {
    case 'dependency':
      strokeColor = '#ef4444';
      strokeWidth = '3';
      break;
    case 'integration':
      strokeColor = '#3b82f6';
      strokeWidth = '2';
      break;
    case 'alternative':
      strokeColor = '#3b82f6';
      strokeWidth = '2';
      strokeDasharray = '5,5';
      break;
    case 'extension':
      strokeColor = '#8b5cf6';
      strokeWidth = '2';
      strokeDasharray = '2,2';
      break;
    default: // hierarchy
      strokeColor = '#64748b';
      strokeWidth = '2';
  }
  
  // Create smooth curve
  const dy = ty - sy;
  const controlOffset = Math.max(40, Math.abs(dy) * 0.4);
  
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', `M ${sx} ${sy} C ${sx} ${sy + controlOffset}, ${tx} ${ty - controlOffset}, ${tx} ${ty}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', strokeColor);
  path.setAttribute('stroke-width', strokeWidth);
  if (strokeDasharray) {
    path.setAttribute('stroke-dasharray', strokeDasharray);
  }
  g.appendChild(path);
  
  // Add label if present
  const label = edge.data?.label || edge.label;
  if (label) {
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    
    // Label background
    const labelBg = document.createElementNS(svgNS, 'rect');
    const labelWidth = String(label).length * 6 + 12;
    labelBg.setAttribute('x', String(midX - labelWidth / 2));
    labelBg.setAttribute('y', String(midY - 9));
    labelBg.setAttribute('width', String(labelWidth));
    labelBg.setAttribute('height', '18');
    labelBg.setAttribute('rx', '4');
    labelBg.setAttribute('fill', '#ffffff');
    labelBg.setAttribute('stroke', '#e2e8f0');
    labelBg.setAttribute('stroke-width', '1');
    g.appendChild(labelBg);
    
    // Label text
    const labelText = document.createElementNS(svgNS, 'text');
    labelText.setAttribute('x', String(midX));
    labelText.setAttribute('y', String(midY));
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('dominant-baseline', 'middle');
    labelText.setAttribute('font-family', 'ui-monospace, monospace');
    labelText.setAttribute('font-size', '11');
    labelText.setAttribute('font-weight', '500');
    labelText.setAttribute('fill', '#64748b');
    labelText.textContent = String(label);
    g.appendChild(labelText);
  }
  
  return g;
}

/**
 * Export React Flow graph to SVG
 * 
 * This function creates a clean SVG representation of the React Flow graph
 * using the node and edge data, enhanced with styling information from the DOM.
 */
export function exportToSVG(
  nodes: Node[],
  edges: Edge[],
  options: ExportOptions
): void {
  const { title, backgroundColor = '#f8fafc', padding = 80, reactFlowInstance } = options;
  
  try {
    if (nodes.length === 0) {
      throw new Error('No nodes to export');
    }
    
    // Get current viewport transform
    let transform = { x: 0, y: 0, zoom: 1 };
    if (reactFlowInstance) {
      transform = reactFlowInstance.getViewport();
    }
    
    // Pre-calculate node dimensions
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
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('width', String(Math.round(svgWidth)));
    svg.setAttribute('height', String(Math.round(svgHeight)));
    svg.setAttribute('viewBox', `0 0 ${Math.round(svgWidth)} ${Math.round(svgHeight)}`);
    
    // Add title and description
    const titleEl = document.createElementNS(svgNS, 'title');
    titleEl.textContent = title;
    svg.appendChild(titleEl);
    
    const desc = document.createElementNS(svgNS, 'desc');
    desc.textContent = `DocMaps export: ${title} - Generated ${new Date().toISOString()}`;
    svg.appendChild(desc);
    
    // Add defs for filters
    const defs = document.createElementNS(svgNS, 'defs');
    
    // Drop shadow filter
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'drop-shadow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const feDropShadow = document.createElementNS(svgNS, 'feDropShadow');
    feDropShadow.setAttribute('dx', '0');
    feDropShadow.setAttribute('dy', '2');
    feDropShadow.setAttribute('stdDeviation', '4');
    feDropShadow.setAttribute('flood-opacity', '0.1');
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);
    svg.appendChild(defs);
    
    // Background
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', String(Math.round(svgWidth)));
    bg.setAttribute('height', String(Math.round(svgHeight)));
    bg.setAttribute('fill', backgroundColor);
    svg.appendChild(bg);
    
    // Create main group with offset
    const mainGroup = document.createElementNS(svgNS, 'g');
    mainGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
    
    // Draw edges first (behind nodes)
    const edgesGroup = document.createElementNS(svgNS, 'g');
    edgesGroup.setAttribute('class', 'edges');
    
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        const edgeElement = createEdge(svgNS, edge, sourceNode, targetNode, nodeDimensions);
        edgesGroup.appendChild(edgeElement);
      }
    });
    
    mainGroup.appendChild(edgesGroup);
    
    // Draw nodes
    const nodesGroup = document.createElementNS(svgNS, 'g');
    nodesGroup.setAttribute('class', 'nodes');
    
    nodes.forEach(node => {
      const x = node.position.x;
      const y = node.position.y;
      const type = node.type || 'feature';
      
      let nodeElement: Element;
      switch (type) {
        case 'product':
          nodeElement = createProductNode(svgNS, node, x, y);
          break;
        case 'feature':
          nodeElement = createFeatureNode(svgNS, node, x, y);
          break;
        case 'component':
          nodeElement = createComponentNode(svgNS, node, x, y);
          break;
        default:
          nodeElement = createFeatureNode(svgNS, node, x, y);
          break;
      }
      
      nodesGroup.appendChild(nodeElement);
    });
    
    mainGroup.appendChild(nodesGroup);
    svg.appendChild(mainGroup);
    
    // Serialize and download
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('SVG Export Error:', error);
    throw error;
  }
}

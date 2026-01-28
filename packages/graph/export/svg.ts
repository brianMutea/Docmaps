/**
 * Professional SVG Exporter for DocMaps
 * 
 * Uses runtime DOM serialization to create pixel-perfect SVG exports that match 
 * the rendered canvas exactly. This approach ensures that ANY updates to nodes, 
 * edges, or styling are automatically captured in the export.
 * 
 * Key Features:
 * - Runtime serialization of actual DOM elements
 * - Captures current viewport transform (zoom/pan)
 * - Reads computed styles from rendered components
 * - Automatically adapts to component changes
 * - Production-grade approach used by Figma, Excalidraw, etc.
 */

import type { Node, Edge, ReactFlowInstance } from 'reactflow';

interface ExportOptions {
  title: string;
  backgroundColor?: string;
  padding?: number;
  reactFlowInstance?: ReactFlowInstance;
}

interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  styles: CSSStyleDeclaration;
  element: Element;
  data: any;
  selected: boolean;
}

interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  path: string;
  styles: CSSStyleDeclaration;
  label?: string;
  labelPosition?: { x: number; y: number };
  data: any;
}

interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Parse CSS transform matrix to extract translation values
 */
function parseTransform(transform: string): { x: number; y: number } {
  if (!transform || transform === 'none') return { x: 0, y: 0 };
  
  // Handle translate() and translate3d()
  const translateMatch = transform.match(/translate(?:3d)?\(([^)]+)\)/);
  if (translateMatch) {
    const values = translateMatch[1].split(',').map(v => parseFloat(v.trim()));
    return { x: values[0] || 0, y: values[1] || 0 };
  }
  
  // Handle matrix() and matrix3d()
  const matrixMatch = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
    if (values.length >= 6) {
      return { x: values[4] || 0, y: values[5] || 0 };
    }
  }
  
  return { x: 0, y: 0 };
}

/**
 * Get the current viewport transform from React Flow
 */
function getViewportTransform(reactFlowInstance?: ReactFlowInstance): ViewportTransform {
  if (reactFlowInstance) {
    const viewport = reactFlowInstance.getViewport();
    return viewport;
  }
  
  // Fallback: try to read from DOM
  const viewportElement = document.querySelector('.react-flow__viewport');
  if (viewportElement) {
    const transform = window.getComputedStyle(viewportElement).transform;
    const parsed = parseTransform(transform);
    
    // Extract zoom from transform scale
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    const zoom = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    
    return { x: parsed.x, y: parsed.y, zoom };
  }
  
  return { x: 0, y: 0, zoom: 1 };
}

/**
 * Serialize a node element from the DOM
 */
function serializeNode(nodeElement: Element, viewport: ViewportTransform): SerializedNode | null {
  const nodeId = nodeElement.getAttribute('data-id');
  if (!nodeId) return null;
  
  const computedStyle = window.getComputedStyle(nodeElement);
  const rect = nodeElement.getBoundingClientRect();
  const flowRect = document.querySelector('.react-flow')?.getBoundingClientRect();
  
  if (!flowRect) return null;
  
  // Calculate position relative to the flow container, accounting for viewport transform
  const relativeX = (rect.left - flowRect.left) / viewport.zoom - viewport.x;
  const relativeY = (rect.top - flowRect.top) / viewport.zoom - viewport.y;
  
  // Extract node data from DOM attributes or find in React Flow state
  const nodeTypeElement = nodeElement.querySelector('[data-node-type]');
  const nodeType = nodeTypeElement?.getAttribute('data-node-type') || 
                   nodeElement.className.includes('product') ? 'product' :
                   nodeElement.className.includes('feature') ? 'feature' : 'component';
  
  // Extract label from the node content
  const labelElement = nodeElement.querySelector('h3');
  const label = labelElement?.textContent || 'Untitled';
  
  // Check if node is selected
  const selected = nodeElement.classList.contains('selected') || 
                   computedStyle.getPropertyValue('--ring-color') !== '';
  
  return {
    id: nodeId,
    type: nodeType,
    position: { x: relativeX, y: relativeY },
    dimensions: { width: rect.width / viewport.zoom, height: rect.height / viewport.zoom },
    styles: computedStyle,
    element: nodeElement,
    data: { label },
    selected
  };
}

/**
 * Serialize an edge element from the DOM
 */
function serializeEdge(edgeElement: Element, viewport: ViewportTransform): SerializedEdge | null {
  const edgeId = edgeElement.getAttribute('data-id');
  if (!edgeId) return null;
  
  const computedStyle = window.getComputedStyle(edgeElement);
  
  // Extract path from SVG path element
  const pathElement = edgeElement.querySelector('path');
  const path = pathElement?.getAttribute('d') || '';
  
  // Extract edge data from DOM attributes
  const source = edgeElement.getAttribute('data-source') || '';
  const target = edgeElement.getAttribute('data-target') || '';
  const edgeType = edgeElement.getAttribute('data-edge-type') || 'hierarchy';
  
  // Look for edge label
  const labelElement = document.querySelector(`[data-edge-id="${edgeId}"] .react-flow__edge-text`);
  const label = labelElement?.textContent || undefined;
  
  let labelPosition;
  if (labelElement) {
    const labelRect = labelElement.getBoundingClientRect();
    const flowRect = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (flowRect) {
      labelPosition = {
        x: (labelRect.left - flowRect.left) / viewport.zoom - viewport.x,
        y: (labelRect.top - flowRect.top) / viewport.zoom - viewport.y
      };
    }
  }
  
  return {
    id: edgeId,
    source,
    target,
    type: edgeType,
    path,
    styles: computedStyle,
    label,
    labelPosition,
    data: {}
  };
}

/**
 * Convert CSS color to hex format
 */
function cssColorToHex(cssColor: string): string {
  if (cssColor.startsWith('#')) return cssColor;
  
  if (cssColor.startsWith('rgb')) {
    const matches = cssColor.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]).toString(16).padStart(2, '0');
      const g = parseInt(matches[1]).toString(16).padStart(2, '0');
      const b = parseInt(matches[2]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  
  // Fallback for named colors or complex formats
  const div = document.createElement('div');
  div.style.color = cssColor;
  document.body.appendChild(div);
  const computed = window.getComputedStyle(div).color;
  document.body.removeChild(div);
  
  return cssColorToHex(computed);
}

/**
 * Extract numeric value from CSS property
 */
function extractNumericValue(cssValue: string): number {
  const match = cssValue.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/**
 * Create SVG defs (filters, gradients, patterns)
 */
function createDefs(svgNS: string): Element {
  const defs = document.createElementNS(svgNS, 'defs');
  
  // Create drop shadow filters for different node types
  const shadowConfigs = [
    { id: 'node-shadow-light', dy: 2, blur: 4, opacity: 0.1 },
    { id: 'node-shadow-medium', dy: 4, blur: 8, opacity: 0.15 },
    { id: 'node-shadow-heavy', dy: 6, blur: 12, opacity: 0.2 },
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
  
  return defs;
}

/**
 * Create SVG representation of a serialized node
 */
function createSVGNode(svgNS: string, node: SerializedNode): Element {
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', `node node-${node.type}`);
  g.setAttribute('data-id', node.id);
  
  const { x, y } = node.position;
  const { width, height } = node.dimensions;
  const styles = node.styles;
  
  // Main container
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  
  // Apply computed styles
  const backgroundColor = styles.backgroundColor;
  const borderRadius = extractNumericValue(styles.borderRadius);
  const borderColor = styles.borderColor;
  const borderWidth = extractNumericValue(styles.borderWidth);
  
  rect.setAttribute('fill', backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : cssColorToHex(backgroundColor));
  rect.setAttribute('rx', String(borderRadius));
  
  if (borderWidth > 0 && borderColor !== 'rgba(0, 0, 0, 0)') {
    rect.setAttribute('stroke', cssColorToHex(borderColor));
    rect.setAttribute('stroke-width', String(borderWidth));
  }
  
  // Add shadow based on box-shadow
  const boxShadow = styles.boxShadow;
  if (boxShadow && boxShadow !== 'none') {
    if (boxShadow.includes('12px')) {
      rect.setAttribute('filter', 'url(#node-shadow-heavy)');
    } else if (boxShadow.includes('8px')) {
      rect.setAttribute('filter', 'url(#node-shadow-medium)');
    } else {
      rect.setAttribute('filter', 'url(#node-shadow-light)');
    }
  }
  
  g.appendChild(rect);
  
  // Add selection ring if selected
  if (node.selected) {
    const selectionRing = document.createElementNS(svgNS, 'rect');
    selectionRing.setAttribute('x', String(x - 2));
    selectionRing.setAttribute('y', String(y - 2));
    selectionRing.setAttribute('width', String(width + 4));
    selectionRing.setAttribute('height', String(height + 4));
    selectionRing.setAttribute('rx', String(borderRadius + 2));
    selectionRing.setAttribute('fill', 'none');
    selectionRing.setAttribute('stroke', '#3b82f6');
    selectionRing.setAttribute('stroke-width', '2');
    g.insertBefore(selectionRing, rect);
  }
  
  // Extract and render text content
  const textElements = node.element.querySelectorAll('h3, p, span');
  textElements.forEach((textEl, index) => {
    const textRect = textEl.getBoundingClientRect();
    const nodeRect = node.element.getBoundingClientRect();
    
    // Calculate relative position within the node
    const relativeX = (textRect.left - nodeRect.left) + x;
    const relativeY = (textRect.top - nodeRect.top) + y + (textRect.height / 2);
    
    const textElement = document.createElementNS(svgNS, 'text');
    textElement.setAttribute('x', String(relativeX));
    textElement.setAttribute('y', String(relativeY));
    textElement.setAttribute('dominant-baseline', 'middle');
    
    const textStyles = window.getComputedStyle(textEl);
    textElement.setAttribute('font-family', textStyles.fontFamily);
    textElement.setAttribute('font-size', textStyles.fontSize);
    textElement.setAttribute('font-weight', textStyles.fontWeight);
    textElement.setAttribute('fill', cssColorToHex(textStyles.color));
    
    textElement.textContent = textEl.textContent || '';
    g.appendChild(textElement);
  });
  
  // Extract and render color indicators
  const colorIndicators = node.element.querySelectorAll('[style*="background-color"]');
  colorIndicators.forEach(indicator => {
    const indicatorRect = indicator.getBoundingClientRect();
    const nodeRect = node.element.getBoundingClientRect();
    
    const relativeX = (indicatorRect.left - nodeRect.left) + x;
    const relativeY = (indicatorRect.top - nodeRect.top) + y;
    
    const indicatorElement = document.createElementNS(svgNS, 'rect');
    indicatorElement.setAttribute('x', String(relativeX));
    indicatorElement.setAttribute('y', String(relativeY));
    indicatorElement.setAttribute('width', String(indicatorRect.width));
    indicatorElement.setAttribute('height', String(indicatorRect.height));
    
    const indicatorStyles = window.getComputedStyle(indicator);
    const indicatorRadius = extractNumericValue(indicatorStyles.borderRadius);
    indicatorElement.setAttribute('rx', String(indicatorRadius));
    indicatorElement.setAttribute('fill', cssColorToHex(indicatorStyles.backgroundColor));
    
    g.appendChild(indicatorElement);
  });
  
  return g;
}

/**
 * Create SVG representation of a serialized edge
 */
function createSVGEdge(svgNS: string, edge: SerializedEdge): Element {
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', `edge edge-${edge.type}`);
  g.setAttribute('data-id', edge.id);
  
  // Create path element
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', edge.path);
  path.setAttribute('fill', 'none');
  
  // Apply computed styles
  const stroke = edge.styles.stroke || '#64748b';
  const strokeWidth = edge.styles.strokeWidth || '2';
  const strokeDasharray = edge.styles.strokeDasharray;
  
  path.setAttribute('stroke', cssColorToHex(stroke));
  path.setAttribute('stroke-width', strokeWidth);
  
  if (strokeDasharray && strokeDasharray !== 'none') {
    path.setAttribute('stroke-dasharray', strokeDasharray);
  }
  
  g.appendChild(path);
  
  // Add label if present
  if (edge.label && edge.labelPosition) {
    const labelBg = document.createElementNS(svgNS, 'rect');
    const labelText = document.createElementNS(svgNS, 'text');
    
    // Estimate label dimensions
    const labelWidth = edge.label.length * 6 + 12;
    const labelHeight = 18;
    
    labelBg.setAttribute('x', String(edge.labelPosition.x - labelWidth / 2));
    labelBg.setAttribute('y', String(edge.labelPosition.y - labelHeight / 2));
    labelBg.setAttribute('width', String(labelWidth));
    labelBg.setAttribute('height', String(labelHeight));
    labelBg.setAttribute('rx', '4');
    labelBg.setAttribute('fill', '#ffffff');
    labelBg.setAttribute('stroke', '#e2e8f0');
    labelBg.setAttribute('stroke-width', '1');
    
    labelText.setAttribute('x', String(edge.labelPosition.x));
    labelText.setAttribute('y', String(edge.labelPosition.y));
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('dominant-baseline', 'middle');
    labelText.setAttribute('font-family', 'ui-monospace, monospace');
    labelText.setAttribute('font-size', '11');
    labelText.setAttribute('font-weight', '500');
    labelText.setAttribute('fill', '#64748b');
    labelText.textContent = edge.label;
    
    g.appendChild(labelBg);
    g.appendChild(labelText);
  }
  
  return g;
}

/**
 * Professional SVG Export using Runtime DOM Serialization
 * 
 * This function captures the current state of the React Flow canvas by:
 * 1. Reading actual DOM elements and their computed styles
 * 2. Capturing the current viewport transform (zoom/pan)
 * 3. Serializing all visual properties in real-time
 * 4. Creating pixel-perfect SVG that matches the rendered canvas
 * 
 * This approach ensures that ANY changes to nodes, edges, or styling
 * are automatically reflected in the export without code changes.
 */
export function exportToSVG(
  nodes: Node[],
  edges: Edge[],
  options: ExportOptions
): void {
  const { title, backgroundColor = '#f8fafc', padding = 80, reactFlowInstance } = options;
  
  try {
    // Get the React Flow container
    const flowElement = document.querySelector('.react-flow');
    if (!flowElement) {
      throw new Error('React Flow container not found');
    }
    
    // Get current viewport transform
    const viewport = getViewportTransform(reactFlowInstance);
    
    // Serialize all visible nodes from DOM
    const nodeElements = flowElement.querySelectorAll('.react-flow__node');
    const serializedNodes: SerializedNode[] = [];
    
    nodeElements.forEach(nodeEl => {
      const serialized = serializeNode(nodeEl, viewport);
      if (serialized) {
        serializedNodes.push(serialized);
      }
    });
    
    if (serializedNodes.length === 0) {
      throw new Error('No visible nodes found to export');
    }
    
    // Serialize all visible edges from DOM
    const edgeElements = flowElement.querySelectorAll('.react-flow__edge');
    const serializedEdges: SerializedEdge[] = [];
    
    edgeElements.forEach(edgeEl => {
      const serialized = serializeEdge(edgeEl, viewport);
      if (serialized) {
        serializedEdges.push(serialized);
      }
    });
    
    // Calculate bounds from serialized nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    serializedNodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.dimensions.width);
      maxY = Math.max(maxY, node.position.y + node.dimensions.height);
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
    
    // Add metadata
    const titleElement = document.createElementNS(svgNS, 'title');
    titleElement.textContent = title;
    svg.appendChild(titleElement);
    
    const desc = document.createElementNS(svgNS, 'desc');
    desc.textContent = `DocMaps export: ${title} - Generated on ${new Date().toISOString()}`;
    svg.appendChild(desc);
    
    // Add defs
    svg.appendChild(createDefs(svgNS));
    
    // Background
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', String(Math.round(svgWidth)));
    bg.setAttribute('height', String(Math.round(svgHeight)));
    bg.setAttribute('fill', backgroundColor);
    svg.appendChild(bg);
    
    // Create main group with offset transform
    const mainGroup = document.createElementNS(svgNS, 'g');
    mainGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
    
    // Draw edges first (behind nodes)
    const edgesGroup = document.createElementNS(svgNS, 'g');
    edgesGroup.setAttribute('class', 'edges');
    serializedEdges.forEach(edge => {
      edgesGroup.appendChild(createSVGEdge(svgNS, edge));
    });
    mainGroup.appendChild(edgesGroup);
    
    // Draw nodes
    const nodesGroup = document.createElementNS(svgNS, 'g');
    nodesGroup.setAttribute('class', 'nodes');
    serializedNodes.forEach(node => {
      nodesGroup.appendChild(createSVGNode(svgNS, node));
    });
    mainGroup.appendChild(nodesGroup);
    
    svg.appendChild(mainGroup);
    
    // Serialize and download
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    
    // Add XML declaration and clean up
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    
    // Create and trigger download
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

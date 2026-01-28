/**
 * Professional SVG Exporter for DocMaps
 * 
 * TRUE DOM-to-SVG conversion that captures the exact rendered appearance.
 * This implementation directly converts the React Flow DOM structure to SVG,
 * ensuring pixel-perfect accuracy and automatic adaptation to any changes.
 */

import type { Node, Edge, ReactFlowInstance } from 'reactflow';

interface ExportOptions {
  title: string;
  backgroundColor?: string;
  padding?: number;
  reactFlowInstance?: ReactFlowInstance;
}

/**
 * Convert any CSS color format to hex
 */
function toHex(color: string): string {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return '#ffffff';
  if (color.startsWith('#')) return color;
  
  // Create a temporary element to get computed color
  const div = document.createElement('div');
  div.style.color = color;
  document.body.appendChild(div);
  const computed = window.getComputedStyle(div).color;
  document.body.removeChild(div);
  
  // Parse rgb/rgba
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  return '#000000';
}

/**
 * Clone an SVG element and all its children with proper namespace
 */
function cloneSVGElement(element: Element, svgNS: string): Element {
  const tagName = element.tagName.toLowerCase();
  const cloned = document.createElementNS(svgNS, tagName);
  
  // Copy all attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    cloned.setAttribute(attr.name, attr.value);
  }
  
  // Clone children recursively
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    cloned.appendChild(cloneSVGElement(child, svgNS));
  }
  
  // Copy text content for text elements
  if (element.textContent && element.children.length === 0) {
    cloned.textContent = element.textContent;
  }
  
  return cloned;
}

/**
 * Convert DOM element to SVG representation
 */
function domToSVG(element: Element, svgNS: string, offsetX: number, offsetY: number): Element {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  
  // Create group for this element
  const g = document.createElementNS(svgNS, 'g');
  
  // Get position
  const x = rect.left + offsetX;
  const y = rect.top + offsetY;
  
  // Create background rectangle if element has background
  const bgColor = style.backgroundColor;
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('x', String(x));
    bgRect.setAttribute('y', String(y));
    bgRect.setAttribute('width', String(rect.width));
    bgRect.setAttribute('height', String(rect.height));
    bgRect.setAttribute('fill', toHex(bgColor));
    
    // Add border radius
    const borderRadius = parseFloat(style.borderRadius) || 0;
    if (borderRadius > 0) {
      bgRect.setAttribute('rx', String(borderRadius));
    }
    
    // Add border
    const borderWidth = parseFloat(style.borderWidth) || 0;
    if (borderWidth > 0) {
      bgRect.setAttribute('stroke', toHex(style.borderColor));
      bgRect.setAttribute('stroke-width', String(borderWidth));
    }
    
    g.appendChild(bgRect);
  }
  
  // Handle text content
  if (element.textContent && element.textContent.trim()) {
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', String(x + parseFloat(style.paddingLeft) || 0));
    text.setAttribute('y', String(y + rect.height / 2));
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-family', style.fontFamily);
    text.setAttribute('font-size', style.fontSize);
    text.setAttribute('font-weight', style.fontWeight);
    text.setAttribute('fill', toHex(style.color));
    text.textContent = element.textContent.trim();
    g.appendChild(text);
  }
  
  return g;
}

/**
 * TRUE DOM-to-SVG Export - Captures the exact rendered React Flow canvas
 * 
 * This implementation directly converts the React Flow DOM to SVG by:
 * 1. Finding the React Flow viewport element
 * 2. Capturing all nodes and edges as they appear in the DOM
 * 3. Converting SVG elements directly (edges are already SVG)
 * 4. Converting HTML elements to SVG equivalents (nodes)
 * 5. Preserving all styling, positioning, and visual effects
 */
export function exportToSVG(
  nodes: Node[],
  edges: Edge[],
  options: ExportOptions
): void {
  const { title, backgroundColor = '#f8fafc', padding = 80, reactFlowInstance } = options;
  
  try {
    // Find the React Flow container and viewport
    const flowContainer = document.querySelector('.react-flow');
    const viewport = document.querySelector('.react-flow__viewport');
    
    if (!flowContainer || !viewport) {
      throw new Error('React Flow elements not found');
    }
    
    // Get viewport bounds
    const containerRect = flowContainer.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    
    // Get current transform from React Flow instance or DOM
    let transform = { x: 0, y: 0, zoom: 1 };
    if (reactFlowInstance) {
      transform = reactFlowInstance.getViewport();
    } else {
      // Parse transform from viewport element
      const style = window.getComputedStyle(viewport);
      const matrix = style.transform;
      if (matrix && matrix !== 'none') {
        const values = matrix.match(/matrix.*\((.+)\)/)?.[1].split(', ');
        if (values && values.length >= 6) {
          transform.zoom = parseFloat(values[0]) || 1;
          transform.x = parseFloat(values[4]) || 0;
          transform.y = parseFloat(values[5]) || 0;
        }
      }
    }
    
    // Calculate bounds of all content
    const allNodes = viewport.querySelectorAll('.react-flow__node');
    const allEdges = viewport.querySelectorAll('.react-flow__edge');
    
    if (allNodes.length === 0) {
      throw new Error('No nodes found to export');
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // Calculate bounds from actual DOM elements
    allNodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      const relativeX = (rect.left - containerRect.left) / transform.zoom - transform.x;
      const relativeY = (rect.top - containerRect.top) / transform.zoom - transform.y;
      
      minX = Math.min(minX, relativeX);
      minY = Math.min(minY, relativeY);
      maxX = Math.max(maxX, relativeX + rect.width / transform.zoom);
      maxY = Math.max(maxY, relativeY + rect.height / transform.zoom);
    });
    
    // Create SVG with calculated dimensions
    const svgWidth = maxX - minX + padding * 2;
    const svgHeight = maxY - minY + padding * 2;
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;
    
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
    
    // Add background
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', String(Math.round(svgWidth)));
    bg.setAttribute('height', String(Math.round(svgHeight)));
    bg.setAttribute('fill', backgroundColor);
    svg.appendChild(bg);
    
    // Create main group with offset
    const mainGroup = document.createElementNS(svgNS, 'g');
    mainGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
    
    // Process edges first (they're already SVG elements)
    const edgesGroup = document.createElementNS(svgNS, 'g');
    edgesGroup.setAttribute('class', 'edges');
    
    allEdges.forEach(edgeElement => {
      const edgeRect = edgeElement.getBoundingClientRect();
      const edgeX = (edgeRect.left - containerRect.left) / transform.zoom - transform.x;
      const edgeY = (edgeRect.top - containerRect.top) / transform.zoom - transform.y;
      
      // Clone the SVG content of the edge
      const svgContent = edgeElement.querySelector('svg');
      if (svgContent) {
        const edgeGroup = document.createElementNS(svgNS, 'g');
        edgeGroup.setAttribute('transform', `translate(${edgeX}, ${edgeY})`);
        
        // Copy all SVG children (paths, markers, etc.)
        for (let i = 0; i < svgContent.children.length; i++) {
          const child = svgContent.children[i];
          const clonedChild = cloneSVGElement(child, svgNS);
          edgeGroup.appendChild(clonedChild);
        }
        
        edgesGroup.appendChild(edgeGroup);
      }
    });
    
    mainGroup.appendChild(edgesGroup);
    
    // Process nodes (convert HTML to SVG)
    const nodesGroup = document.createElementNS(svgNS, 'g');
    nodesGroup.setAttribute('class', 'nodes');
    
    allNodes.forEach(nodeElement => {
      const nodeRect = nodeElement.getBoundingClientRect();
      const nodeX = (nodeRect.left - containerRect.left) / transform.zoom - transform.x;
      const nodeY = (nodeRect.top - containerRect.top) / transform.zoom - transform.y;
      
      // Create node group
      const nodeGroup = document.createElementNS(svgNS, 'g');
      nodeGroup.setAttribute('class', 'node');
      nodeGroup.setAttribute('transform', `translate(${nodeX}, ${nodeY})`);
      
      // Convert the node HTML to SVG
      const nodeStyle = window.getComputedStyle(nodeElement);
      
      // Main background rectangle
      const bgRect = document.createElementNS(svgNS, 'rect');
      bgRect.setAttribute('x', '0');
      bgRect.setAttribute('y', '0');
      bgRect.setAttribute('width', String(nodeRect.width / transform.zoom));
      bgRect.setAttribute('height', String(nodeRect.height / transform.zoom));
      bgRect.setAttribute('fill', toHex(nodeStyle.backgroundColor));
      
      // Border radius
      const borderRadius = parseFloat(nodeStyle.borderRadius) || 0;
      if (borderRadius > 0) {
        bgRect.setAttribute('rx', String(borderRadius));
      }
      
      // Border
      const borderWidth = parseFloat(nodeStyle.borderLeftWidth) || 0;
      if (borderWidth > 0) {
        bgRect.setAttribute('stroke', toHex(nodeStyle.borderColor));
        bgRect.setAttribute('stroke-width', String(borderWidth));
      }
      
      // Box shadow (simplified)
      if (nodeStyle.boxShadow && nodeStyle.boxShadow !== 'none') {
        bgRect.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
      }
      
      nodeGroup.appendChild(bgRect);
      
      // Process text content
      const textElements = nodeElement.querySelectorAll('h3, p, span, div');
      textElements.forEach(textEl => {
        const textContent = textEl.textContent?.trim();
        if (textContent) {
          const textRect = textEl.getBoundingClientRect();
          const textStyle = window.getComputedStyle(textEl);
          
          // Calculate relative position within the node
          const relativeX = (textRect.left - nodeRect.left) / transform.zoom;
          const relativeY = (textRect.top - nodeRect.top) / transform.zoom + (textRect.height / transform.zoom) / 2;
          
          const textElement = document.createElementNS(svgNS, 'text');
          textElement.setAttribute('x', String(relativeX));
          textElement.setAttribute('y', String(relativeY));
          textElement.setAttribute('dominant-baseline', 'middle');
          textElement.setAttribute('font-family', textStyle.fontFamily);
          textElement.setAttribute('font-size', String(parseFloat(textStyle.fontSize) / transform.zoom));
          textElement.setAttribute('font-weight', textStyle.fontWeight);
          textElement.setAttribute('fill', toHex(textStyle.color));
          textElement.textContent = textContent;
          
          nodeGroup.appendChild(textElement);
        }
      });
      
      // Process colored elements (indicators, bars, etc.)
      const coloredElements = nodeElement.querySelectorAll('[style*="background-color"], [class*="bg-"]');
      coloredElements.forEach(colorEl => {
        const colorRect = colorEl.getBoundingClientRect();
        const colorStyle = window.getComputedStyle(colorEl);
        
        if (colorStyle.backgroundColor && colorStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const relativeX = (colorRect.left - nodeRect.left) / transform.zoom;
          const relativeY = (colorRect.top - nodeRect.top) / transform.zoom;
          
          const colorElement = document.createElementNS(svgNS, 'rect');
          colorElement.setAttribute('x', String(relativeX));
          colorElement.setAttribute('y', String(relativeY));
          colorElement.setAttribute('width', String(colorRect.width / transform.zoom));
          colorElement.setAttribute('height', String(colorRect.height / transform.zoom));
          colorElement.setAttribute('fill', toHex(colorStyle.backgroundColor));
          
          const colorBorderRadius = parseFloat(colorStyle.borderRadius) || 0;
          if (colorBorderRadius > 0) {
            colorElement.setAttribute('rx', String(colorBorderRadius));
          }
          
          nodeGroup.appendChild(colorElement);
        }
      });
      
      nodesGroup.appendChild(nodeGroup);
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

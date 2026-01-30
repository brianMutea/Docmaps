/**
 * Alignment utilities for node positioning
 */

import type { Node } from 'reactflow';

export type AlignmentType = 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical';

/**
 * Get bounding box for a set of nodes
 */
function getBoundingBox(nodes: Node[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, centerX: 0, centerY: 0 };
  }

  // Assume standard node dimensions (can be customized per node type)
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 80;

  const minX = Math.min(...nodes.map(n => n.position.x));
  const maxX = Math.max(...nodes.map(n => n.position.x + NODE_WIDTH));
  const minY = Math.min(...nodes.map(n => n.position.y));
  const maxY = Math.max(...nodes.map(n => n.position.y + NODE_HEIGHT));

  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Align nodes to the left
 */
export function alignLeft(nodes: Node[]): Node[] {
  if (nodes.length < 2) return nodes;

  const bbox = getBoundingBox(nodes);
  const alignX = bbox.minX;

  return nodes.map(node => ({
    ...node,
    position: {
      ...node.position,
      x: alignX,
    },
  }));
}

/**
 * Align nodes to the right
 */
export function alignRight(nodes: Node[]): Node[] {
  if (nodes.length < 2) return nodes;

  const NODE_WIDTH = 200;
  const bbox = getBoundingBox(nodes);
  const alignX = bbox.maxX - NODE_WIDTH;

  return nodes.map(node => ({
    ...node,
    position: {
      ...node.position,
      x: alignX,
    },
  }));
}

/**
 * Align nodes to the top
 */
export function alignTop(nodes: Node[]): Node[] {
  if (nodes.length < 2) return nodes;

  const bbox = getBoundingBox(nodes);
  const alignY = bbox.minY;

  return nodes.map(node => ({
    ...node,
    position: {
      ...node.position,
      y: alignY,
    },
  }));
}

/**
 * Align nodes to the bottom
 */
export function alignBottom(nodes: Node[]): Node[] {
  if (nodes.length < 2) return nodes;

  const NODE_HEIGHT = 80;
  const bbox = getBoundingBox(nodes);
  const alignY = bbox.maxY - NODE_HEIGHT;

  return nodes.map(node => ({
    ...node,
    position: {
      ...node.position,
      y: alignY,
    },
  }));
}

/**
 * Align nodes to horizontal center
 */
export function alignCenterHorizontal(nodes: Node[]): Node[] {
  if (nodes.length < 2) return nodes;

  const NODE_WIDTH = 200;
  const bbox = getBoundingBox(nodes);
  const centerX = bbox.centerX - NODE_WIDTH / 2;

  return nodes.map(node => ({
    ...node,
    position: {
      ...node.position,
      x: centerX,
    },
  }));
}

/**
 * Align nodes to vertical center
 */
export function alignCenterVertical(nodes: Node[]): Node[] {
  if (nodes.length < 2) return nodes;

  const NODE_HEIGHT = 80;
  const bbox = getBoundingBox(nodes);
  const centerY = bbox.centerY - NODE_HEIGHT / 2;

  return nodes.map(node => ({
    ...node,
    position: {
      ...node.position,
      y: centerY,
    },
  }));
}

/**
 * Apply alignment to nodes
 */
export function applyAlignment(nodes: Node[], type: AlignmentType): Node[] {
  switch (type) {
    case 'left':
      return alignLeft(nodes);
    case 'right':
      return alignRight(nodes);
    case 'top':
      return alignTop(nodes);
    case 'bottom':
      return alignBottom(nodes);
    case 'center-horizontal':
      return alignCenterHorizontal(nodes);
    case 'center-vertical':
      return alignCenterVertical(nodes);
    default:
      return nodes;
  }
}

/**
 * Distribute nodes horizontally with even spacing
 */
export function distributeHorizontally(nodes: Node[]): Node[] {
  if (nodes.length < 3) return nodes;
  
  // Sort nodes by x position
  const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
  
  const firstX = sortedNodes[0].position.x;
  const lastX = sortedNodes[sortedNodes.length - 1].position.x;
  const totalWidth = lastX - firstX;
  const spacing = totalWidth / (sortedNodes.length - 1);

  return sortedNodes.map((node, index) => ({
    ...node,
    position: {
      ...node.position,
      x: firstX + (spacing * index),
    },
  }));
}

/**
 * Distribute nodes vertically with even spacing
 */
export function distributeVertically(nodes: Node[]): Node[] {
  if (nodes.length < 3) return nodes;
  
  // Sort nodes by y position
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
  
  const firstY = sortedNodes[0].position.y;
  const lastY = sortedNodes[sortedNodes.length - 1].position.y;
  const totalHeight = lastY - firstY;
  const spacing = totalHeight / (sortedNodes.length - 1);

  return sortedNodes.map((node, index) => ({
    ...node,
    position: {
      ...node.position,
      y: firstY + (spacing * index),
    },
  }));
}

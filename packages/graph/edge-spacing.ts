/**
 * Edge spacing utilities for handling multiple edges between the same nodes
 */

import { Edge } from 'reactflow';

export interface EdgeSpacingConfig {
  /** Base spacing between parallel edges in pixels */
  baseSpacing: number;
  /** Maximum number of edges to space (beyond this, edges will overlap) */
  maxEdges: number;
}

export const DEFAULT_EDGE_SPACING: EdgeSpacingConfig = {
  baseSpacing: 20,
  maxEdges: 5,
};

/**
 * Groups edges by their source-target pair
 */
export function groupEdgesByConnection(edges: Edge[]): Map<string, Edge[]> {
  const groups = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    // Create a unique key for each source-target pair
    // Sort to handle bidirectional edges differently
    const key = `${edge.source}->${edge.target}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(edge);
  });

  return groups;
}

/**
 * Calculate the offset for a specific edge in a group of parallel edges
 * Returns the perpendicular offset in pixels
 */
export function calculateEdgeOffset(
  edgeId: string,
  edgeGroup: Edge[],
  config: EdgeSpacingConfig = DEFAULT_EDGE_SPACING
): number {
  if (edgeGroup.length <= 1) {
    return 0; // No offset needed for single edges
  }

  // Find the index of this edge in the group
  const index = edgeGroup.findIndex((e) => e.id === edgeId);
  if (index === -1) {
    return 0;
  }

  // Limit the number of edges we space
  const effectiveCount = Math.min(edgeGroup.length, config.maxEdges);
  
  // Calculate offset so edges are centered around the direct path
  // For odd numbers: middle edge has offset 0
  // For even numbers: edges are evenly distributed
  const middleIndex = (effectiveCount - 1) / 2;
  const offset = (index - middleIndex) * config.baseSpacing;

  return offset;
}

/**
 * Get the offset for a specific edge considering all edges in the graph
 */
export function getEdgeOffset(
  edgeId: string,
  allEdges: Edge[],
  config?: EdgeSpacingConfig
): number {
  const edge = allEdges.find((e) => e.id === edgeId);
  if (!edge) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[EdgeSpacing] Edge ${edgeId} not found in edges array`);
    }
    return 0;
  }

  const groups = groupEdgesByConnection(allEdges);
  const key = `${edge.source}->${edge.target}`;
  const group = groups.get(key) || [];

  if (process.env.NODE_ENV === 'development' && group.length > 1) {
    console.log(`[EdgeSpacing] Group "${key}" has ${group.length} edges:`, 
      group.map(e => ({ id: e.id, type: e.type, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }))
    );
  }

  return calculateEdgeOffset(edgeId, group, config);
}

/**
 * Apply offset to edge path coordinates
 * This calculates the perpendicular offset based on the edge direction
 */
export function applyOffsetToCoordinates(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  offset: number
): { sourceX: number; sourceY: number; targetX: number; targetY: number } {
  if (offset === 0) {
    return { sourceX, sourceY, targetX, targetY };
  }

  // Calculate the perpendicular direction
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return { sourceX, sourceY, targetX, targetY };
  }

  // Perpendicular vector (rotated 90 degrees)
  const perpX = -dy / length;
  const perpY = dx / length;

  // Apply offset
  return {
    sourceX: sourceX + perpX * offset,
    sourceY: sourceY + perpY * offset,
    targetX: targetX + perpX * offset,
    targetY: targetY + perpY * offset,
  };
}

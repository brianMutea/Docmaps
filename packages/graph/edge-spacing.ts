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

  // DEBUG: Log all edges being grouped
  console.log('[EdgeSpacing] groupEdgesByConnection called with', edges.length, 'edges');

  edges.forEach((edge) => {
    // Create a unique key for each source-target pair
    // Sort to handle bidirectional edges differently
    const key = `${edge.source}->${edge.target}`;
    
    console.log('[EdgeSpacing] Processing edge:', {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      key,
    });
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(edge);
  });

  console.log('[EdgeSpacing] Created', groups.size, 'groups:', 
    Array.from(groups.entries()).map(([key, edges]) => ({ key, count: edges.length }))
  );

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
  console.log('[EdgeSpacing] calculateEdgeOffset for', edgeId, 'in group of', edgeGroup.length);
  
  if (edgeGroup.length <= 1) {
    console.log('[EdgeSpacing] Single edge, returning 0');
    return 0; // No offset needed for single edges
  }

  // Find the index of this edge in the group
  const index = edgeGroup.findIndex((e) => e.id === edgeId);
  if (index === -1) {
    console.log('[EdgeSpacing] Edge not found in group, returning 0');
    return 0;
  }

  // Limit the number of edges we space
  const effectiveCount = Math.min(edgeGroup.length, config.maxEdges);
  
  // Calculate offset so edges are centered around the direct path
  // For odd numbers: middle edge has offset 0
  // For even numbers: edges are evenly distributed
  const middleIndex = (effectiveCount - 1) / 2;
  const offset = (index - middleIndex) * config.baseSpacing;

  console.log('[EdgeSpacing] Calculated offset:', {
    index,
    effectiveCount,
    middleIndex,
    offset,
    baseSpacing: config.baseSpacing,
  });

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
  console.log('[EdgeSpacing] getEdgeOffset called for edge:', edgeId, 'with', allEdges.length, 'total edges');
  
  const edge = allEdges.find((e) => e.id === edgeId);
  if (!edge) {
    console.warn(`[EdgeSpacing] Edge ${edgeId} not found in edges array`);
    return 0;
  }

  console.log('[EdgeSpacing] Found edge:', {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type,
  });

  const groups = groupEdgesByConnection(allEdges);
  const key = `${edge.source}->${edge.target}`;
  const group = groups.get(key) || [];

  console.log('[EdgeSpacing] Group for key', key, 'has', group.length, 'edges');
  if (group.length > 1) {
    console.log('[EdgeSpacing] Multiple edges in group:', 
      group.map(e => ({ id: e.id, type: e.type, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }))
    );
  }

  const offset = calculateEdgeOffset(edgeId, group, config);
  console.log('[EdgeSpacing] Final offset for', edgeId, ':', offset);
  
  return offset;
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

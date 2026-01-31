/**
 * Edge spacing utilities for handling multiple edges between the same nodes
 */

import { Edge, Position } from 'reactflow';

export interface EdgeSpacingConfig {
  /** Base spacing between parallel edges in pixels */
  baseSpacing: number;
  /** Maximum number of edges to space (beyond this, edges will overlap) */
  maxEdges: number;
}

export const DEFAULT_EDGE_SPACING: EdgeSpacingConfig = {
  baseSpacing: 12,
  maxEdges: 8,
};

/**
 * Groups edges by their source-target pair AND handle positions
 * This ensures edges connecting to the same handle are grouped together
 */
export function groupEdgesByConnection(edges: Edge[]): Map<string, Edge[]> {
  const groups = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    // Create a unique key including handle positions
    // This groups edges that share the same source/target handles
    const sourceHandle = edge.sourceHandle || 'default';
    const targetHandle = edge.targetHandle || 'default';
    const key = `${edge.source}:${sourceHandle}->${edge.target}:${targetHandle}`;
    
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
    return 0;
  }

  const groups = groupEdgesByConnection(allEdges);
  const sourceHandle = edge.sourceHandle || 'default';
  const targetHandle = edge.targetHandle || 'default';
  const key = `${edge.source}:${sourceHandle}->${edge.target}:${targetHandle}`;
  const group = groups.get(key) || [];

  return calculateEdgeOffset(edgeId, group, config);
}

/**
 * Apply offset to edge path coordinates based on handle positions
 * This applies the offset perpendicular to the handle direction for cleaner separation
 */
export function applyOffsetToCoordinates(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  offset: number,
  sourcePosition?: Position,
  targetPosition?: Position
): { sourceX: number; sourceY: number; targetX: number; targetY: number } {
  if (offset === 0) {
    return { sourceX, sourceY, targetX, targetY };
  }

  // Apply offset based on handle positions
  // For horizontal handles (left/right), offset vertically
  // For vertical handles (top/bottom), offset horizontally
  let adjustedSourceX = sourceX;
  let adjustedSourceY = sourceY;
  let adjustedTargetX = targetX;
  let adjustedTargetY = targetY;

  // Apply source offset
  if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
    adjustedSourceY += offset;
  } else if (sourcePosition === Position.Top || sourcePosition === Position.Bottom) {
    adjustedSourceX += offset;
  }

  // Apply target offset
  if (targetPosition === Position.Left || targetPosition === Position.Right) {
    adjustedTargetY += offset;
  } else if (targetPosition === Position.Top || targetPosition === Position.Bottom) {
    adjustedTargetX += offset;
  }

  return {
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  };
}

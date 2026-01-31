'use client';

import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useStore } from 'reactflow';
import { getEdgeStyle, EdgeType } from '@docmaps/graph/edge-types';
import { getEdgeOffset, applyOffsetToCoordinates } from '@docmaps/graph/edge-spacing';

export function HierarchyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  label,
  data,
}: EdgeProps) {
  // Get all edges from the store to calculate spacing
  const edges = useStore((state) => state.edges);
  
  console.log('[HierarchyEdge] Rendering edge:', id, 'with', edges.length, 'total edges in store');
  
  // Calculate offset for this edge
  const offset = getEdgeOffset(id, edges);
  
  console.log('[HierarchyEdge] Offset result for', id, ':', offset);
  
  // Apply offset to coordinates
  const adjustedCoords = applyOffsetToCoordinates(
    sourceX,
    sourceY,
    targetX,
    targetY,
    offset
  );

  console.log('[HierarchyEdge] Coordinates:', {
    original: { sourceX, sourceY, targetX, targetY },
    adjusted: adjustedCoords,
    offset,
  });

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: adjustedCoords.sourceX,
    sourceY: adjustedCoords.sourceY,
    sourcePosition,
    targetX: adjustedCoords.targetX,
    targetY: adjustedCoords.targetY,
    targetPosition,
  });

  const edgeStyle = getEdgeStyle(EdgeType.HIERARCHY);
  const displayLabel = label || data?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{ ...edgeStyle, ...style }}
      />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-700 rounded shadow-sm"
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

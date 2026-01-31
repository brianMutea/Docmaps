'use client';

import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useStore } from 'reactflow';
import { getEdgeOffset, applyOffsetToCoordinates } from '@docmaps/graph/edge-spacing';

export function ExtensionEdge({
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
  
  // Calculate offset for this edge
  const offset = getEdgeOffset(id, edges);
  
  // Apply offset to coordinates
  const adjustedCoords = applyOffsetToCoordinates(
    sourceX,
    sourceY,
    targetX,
    targetY,
    offset
  );

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: adjustedCoords.sourceX,
    sourceY: adjustedCoords.sourceY,
    sourcePosition,
    targetX: adjustedCoords.targetX,
    targetY: adjustedCoords.targetY,
    targetPosition,
  });

  const displayLabel = label || data?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
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

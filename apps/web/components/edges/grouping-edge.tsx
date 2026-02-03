'use client';

import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useStore, Node } from 'reactflow';
import { getEdgeStyle, EdgeType } from '@docmaps/graph/edge-types';
import { getEdgeOffset, applyOffsetToCoordinates } from '@docmaps/graph/edge-spacing';
import { getFloatingEdgeParams } from '@docmaps/graph/floating-edge-utils';

export function GroupingEdge({
  id,
  source,
  target,
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
  // Get all edges and nodes from the store
  const edges = useStore((state) => state.edges);
  const nodes = useStore((state) => state.nodeInternals);
  
  // Check if this edge should use floating mode
  const useFloating = data?.floating ?? false;
  
  let finalSourceX = sourceX;
  let finalSourceY = sourceY;
  let finalTargetX = targetX;
  let finalTargetY = targetY;
  let finalSourcePos = sourcePosition;
  let finalTargetPos = targetPosition;
  
  if (useFloating && nodes) {
    const sourceNode = Array.from(nodes.values()).find((n: Node) => n.id === source);
    const targetNode = Array.from(nodes.values()).find((n: Node) => n.id === target);
    
    if (sourceNode && targetNode) {
      const params = getFloatingEdgeParams(sourceNode, targetNode);
      finalSourceX = params.sx;
      finalSourceY = params.sy;
      finalTargetX = params.tx;
      finalTargetY = params.ty;
      finalSourcePos = params.sourcePos;
      finalTargetPos = params.targetPos;
    }
  }
  
  // Calculate offset for this edge
  const offset = getEdgeOffset(id, edges);
  
  // Apply offset to coordinates
  const adjustedCoords = applyOffsetToCoordinates(
    finalSourceX,
    finalSourceY,
    finalTargetX,
    finalTargetY,
    offset
  );

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: adjustedCoords.sourceX,
    sourceY: adjustedCoords.sourceY,
    sourcePosition: finalSourcePos,
    targetX: adjustedCoords.targetX,
    targetY: adjustedCoords.targetY,
    targetPosition: finalTargetPos,
  });

  const edgeStyle = getEdgeStyle(EdgeType.GROUPING);
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

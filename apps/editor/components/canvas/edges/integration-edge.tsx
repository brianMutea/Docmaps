'use client';

import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { getEdgeStyle, EdgeType } from '@docmaps/graph/edge-types';

export function IntegrationEdge({
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
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = getEdgeStyle(EdgeType.INTEGRATION);

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      markerStart={markerStart}
      style={{ ...edgeStyle, ...style }}
    />
  );
}

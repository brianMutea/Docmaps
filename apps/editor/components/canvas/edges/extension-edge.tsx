'use client';

import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { getEdgeStyle, EdgeType } from '@docmaps/graph/edge-types';

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
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = getEdgeStyle(EdgeType.EXTENSION);

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{ ...edgeStyle, ...style }}
    />
  );
}

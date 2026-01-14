'use client';

import { memo, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from 'reactflow';
import { ArrowLeftRight } from 'lucide-react';

export const ReversibleEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleReverse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            source: edge.target,
            target: edge.source,
            sourceHandle: edge.targetHandle,
            targetHandle: edge.sourceHandle,
          };
        }
        return edge;
      })
    );
  }, [id, setEdges]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : (style?.strokeWidth || 2),
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              onClick={handleReverse}
              className="flex items-center justify-center w-7 h-7 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-150 group"
              title="Reverse edge direction"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

ReversibleEdge.displayName = 'ReversibleEdge';

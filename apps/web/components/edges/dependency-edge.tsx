'use client';

import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';

export function DependencyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const displayLabel = label || data?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
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

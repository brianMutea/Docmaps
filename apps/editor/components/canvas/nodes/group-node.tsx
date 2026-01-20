'use client';

import { memo } from 'react';
import { type NodeProps, NodeResizer } from 'reactflow';

interface GroupNodeData {
  label: string;
  description?: string;
  color?: string;
}

export const GroupNode = memo(({ data, selected }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';
  const borderColor = selected ? '#3b82f6' : color;

  return (
    <>
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineClassName="!border-2"
        handleClassName="!w-3 !h-3 !border-2"
      />
      
      <div
        className="relative w-full h-full rounded-lg border-2 transition-all duration-200"
        style={{ 
          backgroundColor: 'transparent',
          borderColor: borderColor,
        }}
      >
        {/* Simple label at top */}
        <div className="absolute -top-3 left-4 px-2 bg-white z-10">
          <span className="text-sm font-medium text-gray-700">
            {data.label}
          </span>
        </div>
      </div>
    </>
  );
});

GroupNode.displayName = 'GroupNode';

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
    <div className="relative w-full h-full">
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineClassName="!border-2"
        handleClassName="!w-3 !h-3 !border-2"
      />
      
      {/* Label positioned above the container */}
      <div className="absolute -top-6 left-0 z-10 bg-white px-1">
        <span className="text-sm font-medium text-gray-700">
          {data.label}
        </span>
      </div>
      
      {/* Simple rectangular border container */}
      <div
        className="w-full h-full border-2 border-solid"
        style={{ 
          backgroundColor: 'transparent',
          borderColor: borderColor,
        }}
      />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

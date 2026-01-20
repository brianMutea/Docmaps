'use client';

import { memo } from 'react';
import { type NodeProps } from 'reactflow';

interface GroupNodeData {
  label: string;
  description?: string;
  color?: string;
}

export const GroupNode = memo(({ data }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';

  return (
    <div className="relative w-full h-full">
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
          borderColor: color,
        }}
      />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

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
    <div
      className="relative w-full h-full rounded-lg border-2 transition-all duration-200"
      style={{ 
        backgroundColor: 'transparent',
        borderColor: color,
      }}
    >
      {/* Simple label at top */}
      <div className="absolute -top-3 left-4 px-2 bg-white z-10">
        <span className="text-sm font-medium text-gray-700">
          {data.label}
        </span>
      </div>
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

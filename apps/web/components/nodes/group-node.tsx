'use client';

import { memo } from 'react';
import { type NodeProps } from 'reactflow';

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
      {/* Label header - positioned at the top with proper spacing */}
      <div 
        className="absolute -top-8 left-2 right-2 z-50"
        style={{ pointerEvents: 'none' }}
      >
        <h3 
          className="font-semibold text-gray-900 text-sm leading-tight truncate bg-white px-2 py-1 rounded shadow-sm border border-gray-200"
          style={{ pointerEvents: 'none' }}
        >
          {data.label}
        </h3>
      </div>
      
      {/* Container box with visible dashed border */}
      <div
        className={`w-full h-full rounded-xl border-2 border-dashed transition-all duration-200 ${
          selected ? 'bg-blue-50/20' : 'bg-gray-50/30'
        }`}
        style={{ 
          borderColor: borderColor,
          cursor: 'pointer',
        }}
      />
    </>
  );
});

GroupNode.displayName = 'GroupNode';

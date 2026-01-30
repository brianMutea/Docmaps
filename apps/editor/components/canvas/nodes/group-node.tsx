'use client';

import { memo } from 'react';
import { type NodeProps, NodeResizer } from 'reactflow';
import { Ungroup } from 'lucide-react';

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
      {/* Resizer - show when selected */}
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineClassName="!border-2"
        handleClassName="!w-3 !h-3 !border-2 !bg-white"
      />
      
      {/* Label header - positioned at the top with proper spacing */}
      <div 
        className="absolute -top-8 left-2 right-2 flex items-center justify-between gap-2 z-50"
        style={{ pointerEvents: 'none' }}
      >
        <h3 
          className="font-semibold text-gray-900 text-sm leading-tight truncate bg-white px-2 py-1 rounded shadow-sm border border-gray-200"
          style={{ pointerEvents: 'none' }}
        >
          {data.label}
        </h3>
        
        {/* Ungroup button - only show when selected */}
        {selected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const event = new CustomEvent('ungroupNodes', { 
                bubbles: true 
              });
              e.currentTarget.dispatchEvent(event);
            }}
            className="flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors bg-white border border-gray-200 shadow-sm"
            style={{ pointerEvents: 'auto' }}
            title="Ungroup nodes"
          >
            <Ungroup className="h-3.5 w-3.5 text-red-600" />
          </button>
        )}
      </div>
      
      {/* Container box with visible dashed border */}
      <div
        className={`w-full h-full rounded-xl border-2 border-dashed transition-all duration-200 ${
          selected ? 'bg-blue-50/20' : 'bg-gray-50/30'
        }`}
        style={{ 
          borderColor: borderColor,
          pointerEvents: 'all',
          cursor: 'move',
        }}
      />
    </>
  );
});

GroupNode.displayName = 'GroupNode';

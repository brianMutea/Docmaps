'use client';

import { memo } from 'react';
import { type NodeProps, NodeResizer } from 'reactflow';
import { ChevronDown, ChevronRight, Ungroup } from 'lucide-react';

interface GroupNodeData {
  label: string;
  description?: string;
  color?: string;
  collapsed?: boolean;
  childCount?: number;
}

export const GroupNode = memo(({ data, selected }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';
  const isCollapsed = data.collapsed || false;
  const childCount = data.childCount || 0;
  const borderColor = selected ? '#3b82f6' : color;

  return (
    <>
      {/* Resizer - always show when selected, even when collapsed */}
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={isCollapsed ? 220 : 300}
        minHeight={isCollapsed ? 60 : 200}
        lineClassName="!border-2"
        handleClassName="!w-3 !h-3 !border-2 !bg-white"
      />
      
      {/* Label header - positioned OUTSIDE the container at the top */}
      <div 
        className="absolute -top-10 left-0 right-0 flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 z-50 pointer-events-auto"
        style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            const event = new CustomEvent('toggleGroupCollapse', { 
              detail: { collapsed: !isCollapsed },
              bubbles: true 
            });
            e.currentTarget.dispatchEvent(event);
          }}
          className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded transition-colors"
          title={isCollapsed ? 'Expand group' : 'Collapse group'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>
        
        <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate flex-1">
          {data.label}
        </h3>
        
        {childCount > 0 && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {childCount}
          </span>
        )}
        
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
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
            title="Ungroup nodes"
          >
            <Ungroup className="h-3.5 w-3.5 text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Single container box */}
      <div
        className={`w-full h-full rounded-xl border-2 border-dashed transition-all duration-200 ${
          selected ? 'bg-blue-50/30' : 'bg-gray-50/20'
        }`}
        style={{ 
          borderColor: borderColor,
          pointerEvents: 'all',
        }}
      />
    </>
  );
});

GroupNode.displayName = 'GroupNode';

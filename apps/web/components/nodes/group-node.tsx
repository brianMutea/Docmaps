'use client';

import { memo } from 'react';
import { type NodeProps } from 'reactflow';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface GroupNodeData {
  label: string;
  description?: string;
  color?: string;
  collapsed?: boolean;
  childCount?: number;
}

export const GroupNode = memo(({ data }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';
  const isCollapsed = data.collapsed || false;
  const childCount = data.childCount || 0;

  return (
    <div
      className="relative w-full h-full border-2 rounded-lg transition-all duration-200"
      style={{ 
        minWidth: isCollapsed ? '220px' : undefined, 
        minHeight: isCollapsed ? '60px' : undefined,
        backgroundColor: 'transparent',
        borderColor: color,
      }}
    >
      {/* Label floating at top-left */}
      <div 
        className="absolute -top-3 left-4 flex items-center gap-2 px-2 py-1 bg-white z-10"
      >
        <div className="flex-shrink-0">
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
          )}
        </div>
        
        <div
          className="w-1 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {data.label}
        </h3>
        
        {isCollapsed && childCount > 0 && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium ml-1">
            {childCount}
          </span>
        )}
      </div>
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

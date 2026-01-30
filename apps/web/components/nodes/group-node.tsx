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
    <>
      {/* Label header - positioned OUTSIDE the container at the top */}
      <div 
        className="absolute -top-10 left-0 right-0 flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 z-50"
        style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
      >
        <div className="flex-shrink-0">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate flex-1">
          {data.label}
        </h3>
        
        {childCount > 0 && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {childCount}
          </span>
        )}
      </div>
      
      {/* Single container box */}
      <div
        className="w-full h-full rounded-xl border-2 border-dashed bg-gray-50/20 transition-all duration-200"
        style={{ 
          borderColor: color,
        }}
      />
    </>
  );
});

GroupNode.displayName = 'GroupNode';

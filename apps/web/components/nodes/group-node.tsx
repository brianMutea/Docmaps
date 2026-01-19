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

// Helper to strip HTML tags from description
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

export const GroupNode = memo(({ data }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';
  const cleanDescription = data.description ? stripHtml(data.description) : '';
  const isCollapsed = data.collapsed || false;
  const childCount = data.childCount || 0;

  return (
    <div
      className={`group relative rounded-xl transition-all duration-200 ${
        isCollapsed 
          ? 'bg-white border-2 border-solid shadow-md' 
          : 'bg-transparent border-2 border-dashed border-gray-400'
      }`}
      style={{ 
        minWidth: isCollapsed ? '220px' : '300px', 
        minHeight: isCollapsed ? 'auto' : '200px',
        borderColor: color,
      }}
    >
      {/* Label positioned at top-left corner */}
      <div 
        className={`absolute ${isCollapsed ? 'top-0 left-0 right-0' : '-top-6 left-0'} flex items-center gap-2 px-2 py-1`}
      >
        <div className="flex-shrink-0">
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
          )}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
          {data.label}
        </h3>
        {isCollapsed && childCount > 0 && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {childCount}
          </span>
        )}
      </div>
      
      {/* Description for collapsed state */}
      {isCollapsed && cleanDescription && (
        <div className="px-3 py-2 pt-8">
          <p className="text-xs text-gray-500 line-clamp-2">
            {cleanDescription}
          </p>
        </div>
      )}
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

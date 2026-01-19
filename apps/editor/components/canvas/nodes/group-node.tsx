'use client';

import { memo, useMemo } from 'react';
import { Handle, type NodeProps } from 'reactflow';
import { getHandlesForNodeType } from '@docmaps/graph/handle-config';
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

export const GroupNode = memo(({ data, selected }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';
  const cleanDescription = data.description ? stripHtml(data.description) : '';
  const isCollapsed = data.collapsed || false;
  const childCount = data.childCount || 0;

  const handles = useMemo(() => getHandlesForNodeType('product'), []);

  return (
    <div
      className={`group relative rounded-xl backdrop-blur-sm border-2 transition-all duration-200 ${
        isCollapsed 
          ? 'bg-white border-solid shadow-md' 
          : 'bg-gray-50/50 border-dashed'
      } ${
        selected 
          ? 'border-blue-500 shadow-lg shadow-blue-100' 
          : isCollapsed
            ? 'border-gray-300 hover:border-gray-400'
            : 'border-gray-300 hover:border-gray-400'
      }`}
      style={{ 
        minWidth: isCollapsed ? '220px' : '300px', 
        minHeight: isCollapsed ? 'auto' : '200px',
        borderColor: selected ? undefined : color,
      }}
    >
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white group-hover:!bg-blue-400 transition-colors"
          style={handle.style}
        />
      ))}
      
      <div 
        className={`${isCollapsed ? 'relative' : 'absolute top-3 left-3 right-3'} px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-200`}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Toggle will be handled by parent component
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
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate flex-1">
            {data.label}
          </h3>
          {isCollapsed && childCount > 0 && (
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              {childCount}
            </span>
          )}
        </div>
        {!isCollapsed && cleanDescription && (
          <p className="text-xs text-gray-500 mt-1.5 ml-6 line-clamp-2">
            {cleanDescription}
          </p>
        )}
      </div>
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

'use client';

import { memo, useMemo } from 'react';
import { Handle, type NodeProps, NodeResizer } from 'reactflow';
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
    <>
      {/* Resizer - only show when not collapsed and selected */}
      {!isCollapsed && (
        <NodeResizer
          color={selected ? '#3b82f6' : color}
          isVisible={selected}
          minWidth={300}
          minHeight={200}
          lineClassName="!border-2"
          handleClassName="!w-3 !h-3 !border-2"
        />
      )}
      
      <div
        className={`group relative w-full h-full rounded-xl transition-all duration-200 ${
          isCollapsed 
            ? 'bg-white/95 border-2 border-solid shadow-md' 
            : 'bg-transparent border-2 border-dashed'
        } ${
          selected 
            ? 'border-blue-500' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={{ 
          minWidth: isCollapsed ? '220px' : undefined, 
          minHeight: isCollapsed ? 'auto' : undefined,
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
        
        {/* Label header - clean design without background box */}
        <div 
          className={`${
            isCollapsed ? 'relative' : 'absolute top-4 left-4 right-4'
          } flex items-center gap-2.5 px-3 py-2`}
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
            className="flex-shrink-0 p-0.5 hover:bg-white/80 rounded transition-colors"
            title={isCollapsed ? 'Expand group' : 'Collapse group'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
              {data.label}
            </h3>
          </div>
          
          {isCollapsed && childCount > 0 && (
            <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
              {childCount}
            </span>
          )}
        </div>
        
        {!isCollapsed && cleanDescription && (
          <p className="absolute top-14 left-4 right-4 text-xs text-gray-600 line-clamp-2 px-3">
            {cleanDescription}
          </p>
        )}
      </div>
    </>
  );
});

GroupNode.displayName = 'GroupNode';

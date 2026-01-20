'use client';

import { memo } from 'react';
import { type NodeProps, NodeResizer } from 'reactflow';
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

  // Convert hex color to RGB for opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 107, g: 112, b: 128 }; // default gray
  };

  const rgb = hexToRgb(color);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
  const borderColor = selected ? '#3b82f6' : color;

  return (
    <>
      {/* Resizer - only show when not collapsed and selected */}
      {!isCollapsed && (
        <NodeResizer
          color={borderColor}
          isVisible={selected}
          minWidth={300}
          minHeight={200}
          lineClassName="!border-2"
          handleClassName="!w-3 !h-3 !border-2"
        />
      )}
      
      <div
        className={`group relative w-full h-full rounded-2xl transition-all duration-200 ${
          isCollapsed 
            ? 'border-2 border-solid shadow-md' 
            : 'border-2 border-solid'
        }`}
        style={{ 
          minWidth: isCollapsed ? '220px' : undefined, 
          minHeight: isCollapsed ? 'auto' : undefined,
          backgroundColor: isCollapsed ? 'rgba(255, 255, 255, 0.95)' : bgColor,
          borderColor: borderColor,
        }}
      >
        {/* Label header */}
        <div 
          className={`${
            isCollapsed ? 'relative' : 'absolute top-4 left-4 right-4'
          } flex items-center gap-2.5 px-3 py-2 z-10`}
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
            className="flex-shrink-0 p-0.5 hover:bg-white/60 rounded transition-colors"
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
          <p className="absolute top-14 left-4 right-4 text-xs text-gray-600 line-clamp-2 px-3 z-10">
            {cleanDescription}
          </p>
        )}
      </div>
    </>
  );
});

GroupNode.displayName = 'GroupNode';

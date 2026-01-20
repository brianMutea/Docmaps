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

export const GroupNode = memo(({ data }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';
  const cleanDescription = data.description ? stripHtml(data.description) : '';
  const isCollapsed = data.collapsed || false;
  const childCount = data.childCount || 0;

  const handles = useMemo(() => getHandlesForNodeType('product'), []);

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

  return (
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
        borderColor: color,
      }}
    >
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white"
          style={handle.style}
        />
      ))}
      
      {/* Label header */}
      <div 
        className={`${
          isCollapsed ? 'relative' : 'absolute top-4 left-4 right-4'
        } flex items-center gap-2.5 px-3 py-2 z-10`}
      >
        <div className="flex-shrink-0">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </div>
        
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
  );
});

GroupNode.displayName = 'GroupNode';

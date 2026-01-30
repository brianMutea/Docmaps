'use client';

import { memo, useCallback } from 'react';
import { type NodeProps, useReactFlow } from 'reactflow';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface GroupNodeData {
  label: string;
  description?: string;
  color?: string;
  collapsed?: boolean;
  childCount?: number;
}

export const GroupNode = memo(({ data, id }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';
  const isCollapsed = data.collapsed || false;
  const childCount = data.childCount || 0;
  const { setNodes } = useReactFlow();

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    setNodes((nodes) => {
      const groupNode = nodes.find(n => n.id === id);
      if (!groupNode) return nodes;

      const childNodeIds = groupNode.data.childNodeIds || [];
      const newCollapsed = !isCollapsed;
      
      // Store original positions when collapsing
      const childPositions: Record<string, { x: number; y: number }> = {};
      if (!isCollapsed && !groupNode.data.childPositions) {
        nodes.forEach(node => {
          if (childNodeIds.includes(node.id)) {
            childPositions[node.id] = { ...node.position };
          }
        });
      }

      return nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              collapsed: newCollapsed,
              childPositions: !isCollapsed ? childPositions : node.data.childPositions,
            },
            style: {
              ...node.style,
              width: newCollapsed ? 220 : (node.data.originalWidth || 400),
              height: newCollapsed ? 60 : (node.data.originalHeight || 300),
            },
          };
        }
        
        if (childNodeIds.includes(node.id)) {
          const storedPositions = groupNode.data.childPositions || {};
          return {
            ...node,
            hidden: newCollapsed,
            position: !newCollapsed && storedPositions[node.id] 
              ? storedPositions[node.id] 
              : node.position,
          };
        }
        
        return node;
      });
    });
  }, [id, isCollapsed, setNodes]);

  return (
    <>
      {/* Label header - positioned OUTSIDE the container at the top */}
      <div 
        className="absolute -top-10 left-0 right-0 flex items-center gap-2 px-2 py-1.5 z-50"
        style={{ pointerEvents: 'none' }}
      >
        <button
          onClick={handleToggle}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors bg-white border border-gray-200 shadow-sm"
          style={{ pointerEvents: 'auto' }}
          title={isCollapsed ? 'Expand group' : 'Collapse group'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
          )}
        </button>
        
        <h3 
          className="font-semibold text-gray-900 text-sm leading-tight truncate flex-1"
          style={{ pointerEvents: 'none' }}
        >
          {data.label}
        </h3>
        
        {childCount > 0 && (
          <span 
            className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
            style={{ pointerEvents: 'none' }}
          >
            {childCount}
          </span>
        )}
      </div>
      
      {/* Single container box - transparent border */}
      <div
        className="w-full h-full rounded-xl border-2 border-dashed bg-transparent transition-all duration-200"
        style={{ 
          borderColor: 'transparent',
        }}
      />
    </>
  );
});

GroupNode.displayName = 'GroupNode';

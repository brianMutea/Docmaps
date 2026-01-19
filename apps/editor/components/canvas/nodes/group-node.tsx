'use client';

import { memo, useMemo } from 'react';
import { Handle, type NodeProps } from 'reactflow';
import { getHandlesForNodeType } from '@docmaps/graph/handle-config';

interface GroupNodeData {
  label: string;
  description?: string;
  color?: string;
}

export const GroupNode = memo(({ data, selected }: NodeProps<GroupNodeData>) => {
  const color = data.color || '#6b7280';

  const handles = useMemo(() => getHandlesForNodeType('product'), []);

  return (
    <div
      className={`group relative rounded-xl bg-gray-50/80 backdrop-blur-sm border-2 border-dashed transition-all duration-200 ${
        selected 
          ? 'border-blue-500 shadow-lg shadow-blue-100' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      style={{ 
        minWidth: '300px', 
        minHeight: '200px',
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
        className="absolute top-3 left-3 right-3 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {data.label}
          </h3>
        </div>
        {data.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

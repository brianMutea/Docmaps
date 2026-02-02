'use client';

import { memo, useMemo } from 'react';
import { Handle, type NodeProps } from 'reactflow';
import { getHandlesForNodeType } from '@docmaps/graph/handle-config';

interface ComponentNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
}

const STATUS_CONFIG = {
  beta: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  deprecated: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  experimental: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
} as const;

export const ComponentNode = memo(({ data, selected }: NodeProps<ComponentNodeData>) => {
  const color = data.color || '#8b5cf6';
  // Only show status if it's NOT stable
  const statusConfig = data.status && data.status !== 'stable' ? STATUS_CONFIG[data.status as keyof typeof STATUS_CONFIG] : null;

  const gradientStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)`,
  }), [color]);

  const handles = useMemo(() => getHandlesForNodeType('component'), []);

  return (
    <div
      className={`group relative rounded-xl bg-white shadow-md transition-all duration-200 hover:shadow-lg ${
        selected 
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-blue-100' 
          : ''
      }`}
      style={{ minWidth: '200px', maxWidth: '260px', width: 'fit-content' }}
    >
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white group-hover:!bg-violet-400 transition-colors"
          style={handle.style}
        />
      ))}
      
      <div className="p-4 rounded-xl" style={gradientStyle}>
        <div className="flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm leading-tight whitespace-nowrap">
              {data.label}
            </h3>
            
            {/* Status - only shown when NOT stable */}
            {statusConfig && (
              <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                {data.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';

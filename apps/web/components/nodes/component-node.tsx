'use client';

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { getHandlesForNodeType } from '@docmaps/graph/handle-config';

interface ComponentNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
}

const STATUS_CONFIG = {
  beta: { dot: 'bg-blue-500', title: 'Beta' },
  deprecated: { dot: 'bg-red-500', title: 'Deprecated' },
  experimental: { dot: 'bg-amber-500', title: 'Experimental' },
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
      className={`group relative rounded-lg bg-white shadow-sm border border-gray-100 transition-all duration-200 ${
        selected 
          ? 'ring-2 ring-blue-500 ring-offset-1 shadow-blue-50' 
          : 'cursor-pointer hover:shadow-md'
      }`}
      style={{ minWidth: '160px', maxWidth: '200px', width: 'fit-content' }}
    >
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className="!w-2 !h-2 !bg-gray-300 !border-2 !border-white transition-colors"
          style={handle.style}
        />
      ))}
      
      <div className="p-3 rounded-lg" style={gradientStyle}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-gray-900 text-sm leading-tight whitespace-nowrap flex-1">
                {data.label}
              </h3>
              {/* Status Dot - only shown when NOT stable */}
              {statusConfig && (
                <span 
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusConfig.dot}`}
                  title={statusConfig.title}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';

'use client';

import { memo } from 'react';
import { type NodeProps } from 'reactflow';

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
  const statusConfig = data.status && data.status !== 'stable' ? STATUS_CONFIG[data.status as keyof typeof STATUS_CONFIG] : null;

  return (
    <div
      className={`group relative rounded-lg bg-white shadow-sm border border-gray-100 transition-all duration-200 ${
        selected 
          ? 'ring-2 ring-blue-500 ring-offset-1 shadow-blue-50' 
          : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
      }`}
      style={{ minWidth: '120px', maxWidth: '160px' }}
    >
      <div className="p-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-gray-900 text-xs leading-tight truncate flex-1">
                {data.label}
              </h3>
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

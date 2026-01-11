'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Wrench } from 'lucide-react';

interface ComponentNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
}

const STATUS_CONFIG = {
  stable: { dot: 'bg-emerald-500' },
  beta: { dot: 'bg-blue-500' },
  deprecated: { dot: 'bg-red-500' },
  experimental: { dot: 'bg-amber-500' },
} as const;

export const ComponentNode = memo(({ data, selected }: NodeProps<ComponentNodeData>) => {
  const color = data.color || '#8b5cf6';
  const statusConfig = data.status ? STATUS_CONFIG[data.status] : null;

  return (
    <div
      className={`group relative rounded-lg bg-white shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md ${
        selected 
          ? 'ring-2 ring-blue-500 ring-offset-1 shadow-blue-50' 
          : 'hover:-translate-y-0.5'
      }`}
      style={{ minWidth: '140px', maxWidth: '180px' }}
    >
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-2 !h-2 !bg-gray-300 !border-2 !border-white group-hover:!bg-violet-400 transition-colors" 
      />
      
      <div className="p-2.5">
        <div className="flex items-center gap-2">
          {/* Icon Container */}
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {data.icon ? (
              <span className="text-xs">{data.icon}</span>
            ) : (
              <Wrench className="h-3 w-3" />
            )}
          </div>
          
          {/* Title & Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-gray-900 text-xs leading-tight truncate flex-1">
                {data.label}
              </h3>
              {/* Status Dot */}
              {statusConfig && (
                <span 
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusConfig.dot}`}
                  title={data.status}
                />
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Component</p>
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-2 !h-2 !bg-gray-300 !border-2 !border-white group-hover:!bg-violet-400 transition-colors" 
      />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';

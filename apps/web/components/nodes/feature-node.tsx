'use client';

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';

interface FeatureNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
}

const STATUS_CONFIG = {
  stable: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  beta: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  deprecated: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  experimental: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
} as const;

export const FeatureNode = memo(({ data, selected }: NodeProps<FeatureNodeData>) => {
  const color = data.color || '#3b82f6';
  const statusConfig = data.status ? STATUS_CONFIG[data.status] : null;

  // Generate accent border style
  const accentStyle = useMemo(() => ({
    borderLeftColor: color,
  }), [color]);

  return (
    <div
      className={`group relative rounded-xl bg-white shadow-md border-l-4 transition-all duration-200 ${
        selected 
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-blue-100' 
          : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
      }`}
      style={{ ...accentStyle, minWidth: '180px', maxWidth: '240px' }}
    >
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors" 
      />
      
      <div className="p-3">
        <div className="flex items-center gap-2.5">
          {/* Icon Container */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {data.icon ? (
              <span className="text-sm">{data.icon}</span>
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </div>
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm leading-tight truncate">
              {data.label}
            </h3>
            
            {/* Status Indicator */}
            {statusConfig && (
              <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                {data.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors" 
      />
    </div>
  );
});

FeatureNode.displayName = 'FeatureNode';

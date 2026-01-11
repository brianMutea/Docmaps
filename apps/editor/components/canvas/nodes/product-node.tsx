'use client';

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Box } from 'lucide-react';

interface ProductNodeData {
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

export const ProductNode = memo(({ data, selected }: NodeProps<ProductNodeData>) => {
  const color = data.color || '#10b981';
  const statusConfig = data.status ? STATUS_CONFIG[data.status] : null;

  // Generate lighter shade for gradient
  const gradientStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  }), [color]);

  return (
    <div
      className={`group relative rounded-xl bg-white shadow-lg transition-all duration-200 hover:shadow-xl ${
        selected 
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-blue-100' 
          : 'hover:-translate-y-0.5'
      }`}
      style={{ minWidth: '220px', maxWidth: '280px' }}
    >
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white group-hover:!bg-blue-400 transition-colors" 
      />
      
      {/* Gradient Header */}
      <div 
        className="px-4 py-3 rounded-t-xl border-b border-gray-100"
        style={gradientStyle}
      >
        <div className="flex items-center gap-3">
          {/* Icon Container */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {data.icon ? (
              <span className="text-lg">{data.icon}</span>
            ) : (
              <Box className="h-5 w-5" />
            )}
          </div>
          
          {/* Title & Status */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {data.label}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Product</p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      {statusConfig && (
        <div className="px-4 py-2 border-t border-gray-50">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {data.status}
          </span>
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white group-hover:!bg-blue-400 transition-colors" 
      />
    </div>
  );
});

ProductNode.displayName = 'ProductNode';

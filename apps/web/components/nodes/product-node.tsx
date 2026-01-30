'use client';

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { getHandlesForNodeType } from '@docmaps/graph/handle-config';

interface ProductNodeData {
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

export const ProductNode = memo(({ data, selected }: NodeProps<ProductNodeData>) => {
  const color = data.color || '#10b981';
  // Only show status if it's NOT stable
  const statusConfig = data.status && data.status !== 'stable' ? STATUS_CONFIG[data.status as keyof typeof STATUS_CONFIG] : null;

  const gradientStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${color}25 0%, ${color}10 100%)`,
  }), [color]);

  const handles = useMemo(() => getHandlesForNodeType('product'), []);

  return (
    <div
      className={`group relative rounded-xl bg-white shadow-lg transition-all duration-200 ${
        selected 
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-blue-100' 
          : 'cursor-pointer hover:shadow-xl'
      }`}
      style={{ minWidth: '240px', maxWidth: '300px' }}
    >
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className="!w-3 !h-3 !bg-gray-300 !border-2 !border-white transition-colors"
          style={handle.style}
        />
      ))}
      
      <div 
        className="px-5 py-4 rounded-t-xl border-b border-gray-100"
        style={gradientStyle}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight whitespace-nowrap overflow-visible">
              {data.label}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Product</p>
          </div>
        </div>
      </div>

      {/* Status Badge - only shown when NOT stable */}
      {statusConfig && (
        <div className="px-5 py-2.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {data.status}
          </span>
        </div>
      )}
    </div>
  );
});

ProductNode.displayName = 'ProductNode';

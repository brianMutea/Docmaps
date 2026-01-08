'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Box } from 'lucide-react';

interface ProductNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
}

export const ProductNode = memo(({ data, selected }: NodeProps<ProductNodeData>) => {
  const color = data.color || '#10b981';
  const statusColors = {
    stable: 'bg-green-100 text-green-800',
    beta: 'bg-blue-100 text-blue-800',
    deprecated: 'bg-red-100 text-red-800',
    experimental: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div
      className={`rounded-lg bg-white shadow-md transition-all ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{ borderLeft: `4px solid ${color}`, minWidth: '200px' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            <Box className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {data.label}
            </h3>
            {data.status && (
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  statusColors[data.status]
                }`}
              >
                {data.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
});

ProductNode.displayName = 'ProductNode';

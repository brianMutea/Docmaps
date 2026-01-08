'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';

interface FeatureNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
}

export const FeatureNode = memo(({ data, selected }: NodeProps<FeatureNodeData>) => {
  const color = data.color || '#3b82f6';
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
      style={{ borderLeft: `4px solid ${color}`, minWidth: '170px' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className="p-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {data.label}
            </h3>
            {data.status && (
              <span
                className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-xs font-medium ${
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

FeatureNode.displayName = 'FeatureNode';

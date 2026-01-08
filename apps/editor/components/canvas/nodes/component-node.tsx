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

export const ComponentNode = memo(({ data, selected }: NodeProps<ComponentNodeData>) => {
  const color = data.color || '#8b5cf6';

  return (
    <div
      className={`rounded-lg bg-white shadow-sm transition-all ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{ borderLeft: `3px solid ${color}`, minWidth: '130px' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className="p-2">
        <div className="flex items-center gap-1.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            <Wrench className="h-3 w-3" />
          </div>
          <h3 className="font-medium text-gray-900 text-xs leading-tight flex-1">
            {data.label}
          </h3>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';

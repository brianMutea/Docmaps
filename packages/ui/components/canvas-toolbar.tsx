'use client';

import { Box, Zap, Wrench, Layout, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

type NodeType = 'product' | 'feature' | 'component';
type LayoutDirection = 'TB' | 'LR';

interface CanvasToolbarProps {
  onAddNode: (type: NodeType) => void;
  onAutoLayout: (direction: LayoutDirection) => void;
  disabled?: boolean;
  className?: string;
}

const NODE_BUTTONS = [
  {
    type: 'product' as NodeType,
    label: 'Product Node',
    icon: Box,
    colors: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
  },
  {
    type: 'feature' as NodeType,
    label: 'Feature Node',
    icon: Zap,
    colors: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  },
  {
    type: 'component' as NodeType,
    label: 'Component Node',
    icon: Wrench,
    colors: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
  },
] as const;

const LAYOUT_BUTTONS = [
  {
    direction: 'TB' as LayoutDirection,
    label: 'Auto Layout (Vertical)',
    icon: Layout,
  },
  {
    direction: 'LR' as LayoutDirection,
    label: 'Auto Layout (Horizontal)',
    icon: LayoutGrid,
  },
] as const;

export function CanvasToolbar({
  onAddNode,
  onAutoLayout,
  disabled = false,
  className,
}: CanvasToolbarProps) {
  return (
    <div className={cn('w-64 border-r border-gray-200 bg-white p-4 space-y-6 overflow-y-auto', className)}>
      {/* Add Nodes Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Nodes</h3>
        <div className="space-y-2">
          {NODE_BUTTONS.map(({ type, label, icon: Icon, colors }) => (
            <button
              key={type}
              onClick={() => onAddNode(type)}
              disabled={disabled}
              className={cn(
                'w-full flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                colors,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200" />

      {/* Layout Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Layout</h3>
        <div className="space-y-2">
          {LAYOUT_BUTTONS.map(({ direction, label, icon: Icon }) => (
            <button
              key={direction}
              onClick={() => onAutoLayout(direction)}
              disabled={disabled}
              className={cn(
                'w-full flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Box, Zap, Wrench, Layout, LayoutGrid, Grid3x3, Map } from 'lucide-react';

interface LeftSidebarProps {
  onAddNode: (type: 'product' | 'feature' | 'component') => void;
  onAutoLayout: (direction: 'TB' | 'LR') => void;
  showGrid: boolean;
  showMiniMap: boolean;
  onToggleGrid: () => void;
  onToggleMiniMap: () => void;
}

export function LeftSidebar({
  onAddNode,
  onAutoLayout,
  showGrid,
  showMiniMap,
  onToggleGrid,
  onToggleMiniMap,
}: LeftSidebarProps) {
  return (
    <div className="w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto">
      {/* Add Nodes Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Nodes</h3>
        <div className="space-y-2">
          <button
            onClick={() => onAddNode('product')}
            className="w-full flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            <Box className="h-4 w-4" />
            Product Node
          </button>
          <button
            onClick={() => onAddNode('feature')}
            className="w-full flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Feature Node
          </button>
          <button
            onClick={() => onAddNode('component')}
            className="w-full flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <Wrench className="h-4 w-4" />
            Component Node
          </button>
        </div>
      </div>

      {/* Layout Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Layout</h3>
        <div className="space-y-2">
          <button
            onClick={() => onAutoLayout('TB')}
            className="w-full flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Layout className="h-4 w-4" />
            Auto Layout (Vertical)
          </button>
          <button
            onClick={() => onAutoLayout('LR')}
            className="w-full flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LayoutGrid className="h-4 w-4" />
            Auto Layout (Horizontal)
          </button>
        </div>
      </div>

      {/* View Options Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">View Options</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={onToggleGrid}
              className="rounded border-gray-300"
            />
            <Grid3x3 className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Show Grid</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showMiniMap}
              onChange={onToggleMiniMap}
              className="rounded border-gray-300"
            />
            <Map className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Show Mini Map</span>
          </label>
        </div>
      </div>

      {/* Keyboard Shortcuts Section */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Keyboard Shortcuts</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Save</span>
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">⌘/Ctrl + S</kbd>
          </div>
          <div className="flex justify-between">
            <span>Delete selected</span>
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">Delete</kbd>
          </div>
          <div className="flex justify-between">
            <span>Deselect</span>
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

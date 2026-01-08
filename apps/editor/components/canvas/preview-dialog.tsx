'use client';

import { useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X } from 'lucide-react';
import { ProductNode } from './nodes/product-node';
import { FeatureNode } from './nodes/feature-node';
import { ComponentNode } from './nodes/component-node';

interface PreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  title: string;
}

const nodeTypes: NodeTypes = {
  product: ProductNode,
  feature: FeatureNode,
  component: ComponentNode,
};

export function PreviewDialog({ isOpen, onClose, nodes, edges, title }: PreviewDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Preview: {title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-hidden">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              fitView
              fitViewOptions={{ maxZoom: 1.0, minZoom: 1.0 }}
            >
              <Background />
              <Controls showInteractive={false} />
              <MiniMap />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">
            This is a preview of how your map will appear to viewers. Nodes cannot be moved or edited in this view.
          </p>
        </div>
      </div>
    </div>
  );
}

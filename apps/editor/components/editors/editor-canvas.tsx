'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface EditorCanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  edgeTypes?: EdgeTypes;
  showGrid: boolean;
  showMiniMap: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
}

// Center line component - renders as a fixed overlay at screen center
function CenterLine() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        width: '1px',
        height: '100%',
        background: 'repeating-linear-gradient(to bottom, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 8px)',
        opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}

export function EditorCanvas({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  showGrid,
  showMiniMap,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
}: EditorCanvasProps) {
  // Fit view when the canvas initializes
  const onInit = useCallback((instance: ReactFlowInstance) => {
    // Small delay to ensure nodes are rendered before fitting
    setTimeout(() => {
      instance.fitView({ padding: 0.2, duration: 200 });
    }, 100);
  }, []);

  return (
    <div className="flex-1 relative">
      <CenterLine />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
      >
        {showGrid && <Background />}
        <Controls />
        {showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
}

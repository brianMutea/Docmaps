'use client';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface EditorCanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  showGrid: boolean;
  showMiniMap: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
}

export function EditorCanvas({
  nodes,
  edges,
  nodeTypes,
  showGrid,
  showMiniMap,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
}: EditorCanvasProps) {
  return (
    <div className="flex-1">
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
        fitView
        fitViewOptions={{ maxZoom: 1.0, minZoom: 0.5 }}
      >
        {showGrid && <Background />}
        <Controls />
        {showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
}

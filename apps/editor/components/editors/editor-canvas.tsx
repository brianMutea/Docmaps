'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  useReactFlow,
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

// Center line component that renders in flow coordinates
function CenterLine() {
  const { getViewport, screenToFlowPosition } = useReactFlow();
  const [centerX, setCenterX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCenterLine = useCallback(() => {
    const container = document.querySelector('.react-flow');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const screenCenterX = rect.width / 2;
    const flowPos = screenToFlowPosition({ x: screenCenterX, y: 0 });
    setCenterX(flowPos.x);
  }, [screenToFlowPosition]);

  useEffect(() => {
    // Initial calculation after mount
    const timer = setTimeout(updateCenterLine, 100);
    
    // Update on viewport changes
    const handleMove = () => updateCenterLine();
    window.addEventListener('resize', handleMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleMove);
    };
  }, [updateCenterLine]);

  // Update center line on viewport change
  useEffect(() => {
    const interval = setInterval(updateCenterLine, 50);
    return () => clearInterval(interval);
  }, [updateCenterLine]);

  if (centerX === null) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <line
        x1={centerX}
        y1={-10000}
        x2={centerX}
        y2={10000}
        stroke="#94a3b8"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />
    </svg>
  );
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
    <div className="flex-1 relative">
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
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
      >
        {showGrid && <Background />}
        <Controls />
        {showMiniMap && <MiniMap />}
        <CenterLine />
      </ReactFlow>
    </div>
  );
}

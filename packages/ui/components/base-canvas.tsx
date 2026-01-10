'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  MarkerType,
  type Connection,
  type NodeTypes,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvas } from '../contexts/canvas-context';

interface BaseCanvasProps {
  nodeTypes: NodeTypes;
  showGrid?: boolean;
  showMiniMap?: boolean;
  interactive?: boolean;
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
  onPaneClick?: () => void;
  className?: string;
}

export function BaseCanvas({
  nodeTypes,
  showGrid = true,
  showMiniMap = true,
  interactive = true,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  className,
}: BaseCanvasProps) {
  const {
    nodes,
    edges,
    setEdges,
    setSelectedNode,
    setSelectedEdge,
    onNodesChange,
    onEdgesChange,
  } = useCanvas();

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!interactive) return;

      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        type: 'default',
        data: { edgeType: 'hierarchy' },
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [interactive, setEdges]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setSelectedEdge(null);
      onNodeClick?.(node);
    },
    [setSelectedNode, setSelectedEdge, onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
      onEdgeClick?.(edge);
    },
    [setSelectedEdge, setSelectedNode, onEdgeClick]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    onPaneClick?.();
  }, [setSelectedNode, setSelectedEdge, onPaneClick]);

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      if (!interactive) return;
      onNodesChange(changes);
    },
    [interactive, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      if (!interactive) return;
      onEdgesChange(changes);
    },
    [interactive, onEdgesChange]
  );

  return (
    <div className={className}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
        fitView
        fitViewOptions={{ maxZoom: 1.0, minZoom: 0.5 }}
      >
        {showGrid && <Background />}
        <Controls showInteractive={interactive} />
        {showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
}

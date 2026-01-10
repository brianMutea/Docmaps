'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNodesState, useEdgesState, type Node, type Edge } from 'reactflow';
import type { SourceType, CanvasContextValue } from '../contexts/canvas-context';

interface UseCanvasStateProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  sourceType: SourceType;
  sourceId: string;
}

interface UseCanvasStateReturn extends Omit<CanvasContextValue, 'setNodes' | 'setEdges'> {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export function useCanvasState({
  initialNodes,
  initialEdges,
  sourceType,
  sourceId,
}: UseCanvasStateProps): UseCanvasStateReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNodeState] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdgeState] = useState<Edge | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Selection handlers that clear the other selection
  const setSelectedNode = useCallback((node: Node | null) => {
    setSelectedNodeState(node);
    if (node) setSelectedEdgeState(null);
  }, []);

  const setSelectedEdge = useCallback((edge: Edge | null) => {
    setSelectedEdgeState(edge);
    if (edge) setSelectedNodeState(null);
  }, []);

  // Track changes when nodes or edges change
  useEffect(() => {
    setHasChanges(true);
  }, [nodes, edges]);

  // Reset state when source changes
  useEffect(() => {
    setHasChanges(false);
    setSelectedNodeState(null);
    setSelectedEdgeState(null);
  }, [sourceId]);

  return {
    // Source identification
    sourceType,
    sourceId,

    // Canvas state
    nodes,
    edges,
    setNodes,
    setEdges,

    // Selection state
    selectedNode,
    selectedEdge,
    setSelectedNode,
    setSelectedEdge,

    // Change tracking
    hasChanges,
    setHasChanges,

    // React Flow handlers
    onNodesChange,
    onEdgesChange,
  };
}

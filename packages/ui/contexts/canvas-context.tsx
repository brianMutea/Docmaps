'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Node, Edge } from 'reactflow';

export type SourceType = 'map' | 'view';

export interface CanvasContextValue {
  // Data source identification
  sourceType: SourceType;
  sourceId: string;

  // Canvas state
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;

  // Selection state
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  setSelectedNode: (node: Node | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;

  // Change tracking
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;

  // React Flow change handlers
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}

interface CanvasProviderProps {
  children: ReactNode;
  value: CanvasContextValue;
}

export function CanvasProvider({ children, value }: CanvasProviderProps) {
  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

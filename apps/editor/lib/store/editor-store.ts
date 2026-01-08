import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';

interface EditorState {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  saving: boolean;
  hasChanges: boolean;
  setSelectedNode: (node: Node | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  setSaving: (saving: boolean) => void;
  setHasChanges: (hasChanges: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedNode: null,
  selectedEdge: null,
  saving: false,
  hasChanges: false,
  setSelectedNode: (node) => set({ selectedNode: node, selectedEdge: null }),
  setSelectedEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),
  setSaving: (saving) => set({ saving }),
  setHasChanges: (hasChanges) => set({ hasChanges }),
}));

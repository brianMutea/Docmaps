import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';

interface EditorState {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  saving: boolean;
  hasChanges: boolean;
  leftSidebarOpen: boolean;
  setSelectedNode: (node: Node | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  setSaving: (saving: boolean) => void;
  setHasChanges: (hasChanges: boolean) => void;
  setLeftSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedNode: null,
  selectedEdge: null,
  saving: false,
  hasChanges: false,
  leftSidebarOpen: false, // Closed by default for mobile-first approach
  setSelectedNode: (node) => set({ selectedNode: node, selectedEdge: null }),
  setSelectedEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),
  setSaving: (saving) => set({ saving }),
  setHasChanges: (hasChanges) => set({ hasChanges }),
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
}));

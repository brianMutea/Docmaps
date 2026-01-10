'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createClient } from '@/lib/supabase';
import { applyLayout } from '@/lib/layout';
import { toast } from '@/lib/utils/toast';
import { analytics } from '@/lib/analytics';
import type { Map as MapType, ProductView } from '@docmaps/database';
import { ConfirmDialog, ViewSelector } from '@docmaps/ui';
import { LeftSidebar } from '../canvas/left-sidebar';
import { RightPanel } from '../canvas/right-panel';
import { EditorTopBar } from '../canvas/editor-top-bar';
import { ProductNode } from '../canvas/nodes/product-node';
import { FeatureNode } from '../canvas/nodes/feature-node';
import { ComponentNode } from '../canvas/nodes/component-node';
import { EditorCanvas } from './editor-canvas';

interface MultiViewEditorProps {
  map: MapType;
  views: ProductView[];
}

function MultiViewEditorContent({ map, views }: MultiViewEditorProps) {
  const router = useRouter();
  const reactFlowInstance = useReactFlow();
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [deleteNodeDialog, setDeleteNodeDialog] = useState(false);
  const [deleteEdgeDialog, setDeleteEdgeDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedNode, setSelectedNodeState] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdgeState] = useState<Edge | null>(null);

  const activeView = views[activeViewIndex];
  
  // Use React Flow's state hooks for the active view
  const [nodes, setNodes, onNodesChange] = useNodesState(activeView.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeView.edges as Edge[]);


  // Selection handlers
  const setSelectedNode = useCallback((node: Node | null) => {
    setSelectedNodeState(node);
    if (node) setSelectedEdgeState(null);
  }, []);

  const setSelectedEdge = useCallback((edge: Edge | null) => {
    setSelectedEdgeState(edge);
    if (edge) setSelectedNodeState(null);
  }, []);

  // Register custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      product: ProductNode,
      feature: FeatureNode,
      component: ComponentNode,
    }),
    []
  );

  // Get edge style based on edge type
  const getEdgeStyle = useCallback((edgeType: string) => {
    const baseStyle = { strokeWidth: 2 };
    const markerEnd = { type: MarkerType.ArrowClosed };

    switch (edgeType) {
      case 'hierarchy':
        return {
          style: { ...baseStyle, stroke: '#64748b' },
          markerEnd: { ...markerEnd, color: '#64748b' },
        };
      case 'related':
        return {
          style: { ...baseStyle, stroke: '#3b82f6', strokeDasharray: '5,5' },
          markerEnd: { ...markerEnd, color: '#3b82f6' },
        };
      case 'depends-on':
        return {
          style: { strokeWidth: 3, stroke: '#ef4444' },
          markerEnd: { ...markerEnd, color: '#ef4444' },
        };
      case 'optional':
        return {
          style: { ...baseStyle, stroke: '#94a3b8', strokeDasharray: '2,2' },
          markerEnd: { ...markerEnd, color: '#94a3b8' },
        };
      default:
        return {
          style: { ...baseStyle, stroke: '#64748b' },
          markerEnd: { ...markerEnd, color: '#64748b' },
        };
    }
  }, []);

  // Apply edge styles to all edges
  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const edgeType = edge.data?.edgeType || 'hierarchy';
      const { style, markerEnd } = getEdgeStyle(edgeType);
      return {
        ...edge,
        style: { ...edge.style, ...style },
        markerEnd: markerEnd,
      };
    });
  }, [edges, getEdgeStyle]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [nodes, edges]);

  // Save current view
  const saveCurrentView = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('product_views')
        // @ts-ignore - Supabase type inference issue with JSONB columns
        .update({
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeView.id);

      if (error) throw error;

      setHasChanges(false);
      toast.success('Saved');
      analytics.trackMapSaved(map.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save: ${message}`);
    } finally {
      setSaving(false);
    }
  }, [nodes, edges, activeView.id, map.id]);

  // Handle view change - save current view before switching
  const handleViewChange = useCallback(async (viewId: string) => {
    const newIndex = views.findIndex(v => v.id === viewId);
    if (newIndex === -1 || newIndex === activeViewIndex) return;

    // Save current view if there are changes
    if (hasChanges) {
      await saveCurrentView();
    }

    // Switch to new view
    setActiveViewIndex(newIndex);
    const newView = views[newIndex];
    setNodes(newView.nodes as Node[]);
    setEdges(newView.edges as Edge[]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setHasChanges(false);
  }, [views, activeViewIndex, hasChanges, saveCurrentView, setNodes, setEdges, setSelectedNode, setSelectedEdge]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasChanges) return;

    const interval = setInterval(() => {
      if (hasChanges) {
        saveCurrentView();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasChanges, saveCurrentView]);


  // Handle publish/draft toggle
  const handleTogglePublish = useCallback(
    async (newStatus: 'draft' | 'published') => {
      try {
        const supabase = createClient();
        
        const { error } = await supabase
          .from('maps')
          // @ts-ignore - Supabase type inference issue
          .update({
            status: newStatus,
            published_at: newStatus === 'published' ? new Date().toISOString() : null,
          })
          .eq('id', map.id);

        if (error) throw error;

        map.status = newStatus;
        if (newStatus === 'published') {
          map.published_at = new Date().toISOString();
          toast.success('Published - Your map is now public');
          analytics.trackMapPublished(map.id);
        } else {
          map.published_at = null;
          toast.success('Unpublished - Your map is now private');
        }
        
        router.refresh();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to update status: ${message}`);
      }
    },
    [map, router]
  );

  // Handle connections
  const onConnect = useCallback(
    (connection: Connection) => {
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
    [setEdges]
  );

  // Add node
  const handleAddNode = useCallback(
    (type: 'product' | 'feature' | 'component') => {
      const colors = {
        product: '#10b981',
        feature: '#3b82f6',
        component: '#8b5cf6',
      };

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position: { x: 250, y: 100 },
        data: {
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          description: '',
          icon: '',
          color: colors[type],
          tags: [],
          status: 'stable',
        },
      };

      setNodes((nds) => [...nds, newNode]);
      analytics.trackNodeAdded(type);
    },
    [setNodes]
  );

  // Delete selected node
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    setDeleteNodeDialog(true);
  }, [selectedNode]);

  const confirmDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges, setSelectedNode]);

  // Update selected node
  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...updates },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Update selected edge
  const handleUpdateEdge = useCallback(
    (edgeId: string, updates: Record<string, unknown>) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              ...updates,
              data: { ...edge.data, ...updates },
            };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  // Delete selected edge
  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdge) return;
    setDeleteEdgeDialog(true);
  }, [selectedEdge]);

  const confirmDeleteEdge = useCallback(() => {
    if (!selectedEdge) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
    setSelectedEdge(null);
  }, [selectedEdge, setEdges, setSelectedEdge]);

  // Auto-layout
  const handleAutoLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const layoutedNodes = applyLayout(nodes, edges, direction);
      setNodes(layoutedNodes);
      analytics.trackAutoLayout(direction);
    },
    [nodes, edges, setNodes]
  );


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentView();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        if (selectedNode) {
          e.preventDefault();
          handleDeleteNode();
        } else if (selectedEdge) {
          e.preventDefault();
          handleDeleteEdge();
        }
      }
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentView, handleDeleteNode, handleDeleteEdge, selectedNode, selectedEdge, setSelectedNode, setSelectedEdge]);

  // Format views for ViewSelector
  const viewSelectorItems = useMemo(() => 
    views.map(v => ({ id: v.id, title: v.title, slug: v.slug })),
    [views]
  );

  return (
    <div className="flex h-screen flex-col">
      <EditorTopBar
        map={map}
        currentView={activeView}
        saving={saving}
        hasChanges={hasChanges}
        onSave={saveCurrentView}
        onTogglePublish={handleTogglePublish}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* View Selector Sidebar */}
        <ViewSelector
          views={viewSelectorItems}
          activeViewId={activeView.id}
          onViewChange={handleViewChange}
          title="Views"
        />

        <LeftSidebar
          onAddNode={handleAddNode}
          onAutoLayout={handleAutoLayout}
          showGrid={showGrid}
          showMiniMap={showMiniMap}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
        />

        <EditorCanvas
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          showGrid={showGrid}
          showMiniMap={showMiniMap}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_e, node) => setSelectedNode(node)}
          onEdgeClick={(_e, edge) => setSelectedEdge(edge)}
          onPaneClick={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
        />

        <RightPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={handleUpdateNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
        />
      </div>

      <ConfirmDialog
        open={deleteNodeDialog}
        onOpenChange={setDeleteNodeDialog}
        title="Delete Node"
        description="Are you sure you want to delete this node? All connected edges will also be removed."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteNode}
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteEdgeDialog}
        onOpenChange={setDeleteEdgeDialog}
        title="Delete Edge"
        description="Are you sure you want to delete this edge?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteEdge}
        variant="destructive"
      />
    </div>
  );
}

export function MultiViewEditor({ map, views }: MultiViewEditorProps) {
  return (
    <ReactFlowProvider>
      <MultiViewEditorContent map={map} views={views} />
    </ReactFlowProvider>
  );
}

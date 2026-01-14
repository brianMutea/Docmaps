'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  addEdge,
  getNodesBounds,
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
import type { Map as MapType } from '@docmaps/database';
import { ConfirmDialog, CanvasProvider, useCanvasState } from '@docmaps/ui';
import { LeftSidebar } from '../canvas/left-sidebar';
import { RightPanel } from '../canvas/right-panel';
import { TopBar } from '../canvas/top-bar';
import { ProductNode } from '../canvas/nodes/product-node';
import { FeatureNode } from '../canvas/nodes/feature-node';
import { ComponentNode } from '../canvas/nodes/component-node';
import { EditorCanvas } from './editor-canvas';

interface SingleViewEditorProps {
  map: MapType;
}

function SingleViewEditorContent({ map }: SingleViewEditorProps) {
  const reactFlowInstance = useReactFlow();
  const router = useRouter();
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [deleteNodeDialog, setDeleteNodeDialog] = useState(false);
  const [deleteEdgeDialog, setDeleteEdgeDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Use shared canvas state hook
  const canvasState = useCanvasState({
    initialNodes: map.nodes as Node[],
    initialEdges: map.edges as Edge[],
    sourceType: 'map',
    sourceId: map.id,
  });

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNode,
    selectedEdge,
    setSelectedNode,
    setSelectedEdge,
    hasChanges,
    setHasChanges,
    onNodesChange,
    onEdgesChange,
  } = canvasState;


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

  // Handle save
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      // Strip selection state from nodes before saving
      const cleanNodes = nodes.map(({ selected, dragging, ...node }) => node);
      const cleanEdges = edges.map(({ selected, ...edge }) => edge);
      
      const { error } = await supabase
        .from('maps')
        // @ts-ignore - Supabase type inference issue with JSONB columns
        .update({
          nodes: JSON.parse(JSON.stringify(cleanNodes)),
          edges: JSON.parse(JSON.stringify(cleanEdges)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', map.id);

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
  }, [nodes, edges, map.id, setHasChanges]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasChanges) return;

    const interval = setInterval(() => {
      if (hasChanges) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasChanges, handleSave]);


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

  // Add node at the center of the current viewport
  const handleAddNode = useCallback(
    (type: 'product' | 'feature' | 'component') => {
      const colors = {
        product: '#10b981',
        feature: '#3b82f6',
        component: '#8b5cf6',
      };

      // Get the center of the current viewport
      const viewport = reactFlowInstance.getViewport();
      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      
      let centerX = 250;
      let centerY = 100;
      
      if (reactFlowBounds) {
        // Calculate the center of the viewport in flow coordinates
        const centerScreenX = reactFlowBounds.width / 2;
        const centerScreenY = reactFlowBounds.height / 2;
        
        // Convert screen coordinates to flow coordinates
        centerX = (centerScreenX - viewport.x) / viewport.zoom;
        centerY = (centerScreenY - viewport.y) / viewport.zoom;
      }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position: { x: centerX, y: centerY },
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
    [setNodes, reactFlowInstance]
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
        handleSave();
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
  }, [handleSave, handleDeleteNode, handleDeleteEdge, selectedNode, selectedEdge, setSelectedNode, setSelectedEdge]);

  // Handle export to SVG
  const handleExport = useCallback(async () => {
    try {
      if (!reactFlowInstance) {
        throw new Error('React Flow instance not ready');
      }

      const nodesBounds = getNodesBounds(nodes);
      const padding = 40;
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;
      const offsetX = nodesBounds.x - padding;
      const offsetY = nodesBounds.y - padding;

      const svgNS = 'http://www.w3.org/2000/svg';
      const svgElement = document.createElementNS(svgNS, 'svg');
      svgElement.setAttribute('width', width.toString());
      svgElement.setAttribute('height', height.toString());
      svgElement.setAttribute('viewBox', `${offsetX} ${offsetY} ${width} ${height}`);
      svgElement.setAttribute('xmlns', svgNS);
      
      const background = document.createElementNS(svgNS, 'rect');
      background.setAttribute('x', offsetX.toString());
      background.setAttribute('y', offsetY.toString());
      background.setAttribute('width', width.toString());
      background.setAttribute('height', height.toString());
      background.setAttribute('fill', '#ffffff');
      svgElement.appendChild(background);

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);
      svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svgString}`;
      
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${map.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Map exported as SVG successfully');
      analytics.trackMapExported(map.id, 'svg');
    } catch (error) {
      console.error('Error exporting map:', error);
      toast.error('Failed to export map');
    }
  }, [nodes, map.title, map.id, reactFlowInstance]);

  return (
    <CanvasProvider value={canvasState}>
      <div className="flex h-screen flex-col">
        <TopBar
          map={map}
          saving={saving}
          hasChanges={hasChanges}
          nodes={nodes}
          edges={styledEdges}
          onSave={handleSave}
          onTogglePublish={handleTogglePublish}
          onExport={handleExport}
        />

        <div className="flex flex-1 overflow-hidden relative">
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
    </CanvasProvider>
  );
}

export function SingleViewEditor({ map }: SingleViewEditorProps) {
  return (
    <ReactFlowProvider>
      <SingleViewEditorContent map={map} />
    </ReactFlowProvider>
  );
}

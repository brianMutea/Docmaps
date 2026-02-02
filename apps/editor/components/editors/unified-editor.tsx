'use client';

/**
 * UnifiedEditor - Single editor component for both single-view and multi-view maps
 * 
 * This component handles editing for all map types:
 * - Single-view maps (view_type: 'single') - saves directly to maps table
 * - Multi-view maps (view_type: 'multi') - saves to product_views table
 * 
 * The Views panel is conditionally shown based on whether views are provided.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  applyNodeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createClient } from '@docmaps/auth';
import { applyLayout } from '@docmaps/graph';
import { EdgeType, getEdgeStyle } from '@docmaps/graph/edge-types';
import { validateConnection } from '@docmaps/graph/handle-validator';
import { copyNodesToClipboard, pasteNodesFromClipboard } from '@docmaps/graph/clipboard';
import { 
  createHistoryManager, 
  pushHistory, 
  undo as undoHistory, 
  redo as redoHistory,
  canUndo,
  canRedo,
  type HistoryManager 
} from '@docmaps/graph/history';
import { 
  applyAlignment, 
  distributeHorizontally, 
  distributeVertically,
  type AlignmentType 
} from '@docmaps/graph/alignment';
import { ungroupAll, validateGroupOperation, moveGroupWithChildren, constrainNodeToGroup, isNodeInGroup, ensureChildrenWithinGroup } from '@docmaps/graph/grouping';
import { toast } from '@/lib/utils/toast';
import { analytics } from '@docmaps/analytics';
import type { Map as MapType, ProductView } from '@docmaps/database';
import { ConfirmDialog } from '@docmaps/ui';
import { LeftSidebar } from '../canvas/left-sidebar';
import { RightPanel } from '../canvas/right-panel';
import { EditorTopBar } from '../canvas/editor-top-bar';
import { ViewManagementPanel } from '../canvas/view-management-panel';
import { ProductNode } from '../canvas/nodes/product-node';
import { FeatureNode } from '../canvas/nodes/feature-node';
import { ComponentNode } from '../canvas/nodes/component-node';
import { TextBlockNode } from '../canvas/nodes/text-block-node';
import { GroupNode } from '../canvas/nodes/group-node';
import { 
  HierarchyEdge, 
  DependencyEdge, 
  AlternativeEdge, 
  IntegrationEdge, 
  ExtensionEdge 
} from '../canvas/edges';
import { EditorCanvas } from './editor-canvas';

interface UnifiedEditorProps {
  map: MapType;
  initialViews?: ProductView[];
}

function UnifiedEditorContent({ map, initialViews }: UnifiedEditorProps) {
  const reactFlowInstance = useReactFlow();
  const router = useRouter();
  
  // Determine if this is a multi-view map based on map type, not view count
  const isMultiView = map.view_type === 'multi';
  
  // Views state (only used for multi-view) - deep clone to prevent reference sharing
  const [views, setViews] = useState<ProductView[]>(() => 
    initialViews ? JSON.parse(JSON.stringify(initialViews)) : []
  );
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  
  // UI state
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [deleteNodeDialog, setDeleteNodeDialog] = useState(false);
  const [deleteEdgeDialog, setDeleteEdgeDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedNode, setSelectedNodeState] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdgeState] = useState<Edge | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  // Get active view for multi-view mode
  const activeView = isMultiView ? views[activeViewIndex] : null;
  
  // Initialize nodes/edges based on mode - ALWAYS deep clone to prevent reference issues
  const getInitialNodes = (): Node[] => {
    if (isMultiView && initialViews && initialViews.length > 0 && initialViews[0]?.nodes) {
      // Use initialViews directly for first render to avoid stale closure
      return JSON.parse(JSON.stringify(initialViews[0].nodes));
    }
    // For single-view maps or multi-view maps with no views yet, use map nodes
    return JSON.parse(JSON.stringify(map.nodes || []));
  };
  
  const getInitialEdges = (): Edge[] => {
    if (isMultiView && initialViews && initialViews.length > 0 && initialViews[0]?.edges) {
      // Use initialViews directly for first render to avoid stale closure
      return JSON.parse(JSON.stringify(initialViews[0].edges));
    }
    // For single-view maps or multi-view maps with no views yet, use map edges
    return JSON.parse(JSON.stringify(map.edges || []));
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  // Custom nodes change handler to handle group movement
  const handleNodesChange = useCallback((changes: any[]) => {
    // Process changes and handle group movements
    setNodes((currentNodes) => {
      let updatedNodes = [...currentNodes];
      
      // Track group movements
      const groupMoves = new Map<string, { oldPos: { x: number; y: number }; newPos: { x: number; y: number } }>();
      
      changes.forEach(change => {
        if (change.type === 'position' && change.dragging) {
          const node = updatedNodes.find(n => n.id === change.id);
          
          if (node?.type === 'group') {
            // Track group movement
            groupMoves.set(change.id, {
              oldPos: { x: node.position.x, y: node.position.y },
              newPos: { x: change.position.x, y: change.position.y }
            });
          } else if (node && isNodeInGroup(updatedNodes, change.id)) {
            // Constrain child nodes to their parent group
            const constrainedPosition = constrainNodeToGroup(updatedNodes, change.id, change.position);
            change.position = constrainedPosition;
          }
        }
      });
      
      // Apply standard changes first
      updatedNodes = applyNodeChanges(changes, updatedNodes) as Node[];
      
      // Then handle group movements - move all children with the group
      if (groupMoves.size > 0) {
        groupMoves.forEach(({ oldPos, newPos }, groupId) => {
          const deltaX = newPos.x - oldPos.x;
          const deltaY = newPos.y - oldPos.y;
          
          const groupNode = updatedNodes.find(n => n.id === groupId);
          if (groupNode) {
            const childNodeIds = groupNode.data.childNodeIds || [];
            
            // Move all child nodes by the same delta
            updatedNodes = updatedNodes.map(node => {
              if (childNodeIds.includes(node.id)) {
                return {
                  ...node,
                  position: {
                    x: node.position.x + deltaX,
                    y: node.position.y + deltaY,
                  },
                };
              }
              return node;
            });
          }
        });
      }
      
      return updatedNodes;
    });
  }, [setNodes]);

  // History management for undo/redo
  const [historyManager, setHistoryManager] = useState<HistoryManager>(() => 
    createHistoryManager(getInitialNodes(), getInitialEdges())
  );
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  // Track if this is the initial mount to prevent false hasChanges on load
  const isInitialMount = useRef(true);

  // Fit view when active view changes (for multi-view)
  useEffect(() => {
    if (isMultiView && reactFlowInstance) {
      // Small delay to ensure nodes are rendered
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeViewIndex, isMultiView, reactFlowInstance]);

  // Selection handlers
  const setSelectedNode = useCallback((node: Node | null) => {
    setSelectedNodeState(node);
    if (node) {
      setSelectedEdgeState(null);
      setSelectedNodes([]);
    }
  }, []);

  const setSelectedEdge = useCallback((edge: Edge | null) => {
    setSelectedEdgeState(edge);
    if (edge) {
      setSelectedNodeState(null);
      setSelectedNodes([]);
    }
  }, []);

  // Register custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      product: ProductNode,
      feature: FeatureNode,
      component: ComponentNode,
      textBlock: TextBlockNode,
      group: GroupNode,
    }),
    []
  );

  // Register custom edge types
  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      [EdgeType.HIERARCHY]: HierarchyEdge,
      [EdgeType.DEPENDENCY]: DependencyEdge,
      [EdgeType.ALTERNATIVE]: AlternativeEdge,
      [EdgeType.INTEGRATION]: IntegrationEdge,
      [EdgeType.EXTENSION]: ExtensionEdge,
    }),
    []
  );

  // Apply edge styles to all edges based on edge type
  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const edgeType = (edge.data?.edgeType || EdgeType.HIERARCHY) as EdgeType;
      const edgeStyle = getEdgeStyle(edgeType);
      const direction = edge.data?.direction || 'one-way';
      
      return {
        ...edge,
        type: edgeType,
        style: { ...edge.style, ...edgeStyle },
      };
    });
  }, [edges]);

  // Track changes - skip initial mount to prevent false positives
  // Debounce history push to avoid too many history entries
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Skip history push if this is an undo/redo action
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
      return;
    }
    
    setHasChanges(true);
    
    // Debounce history push by 500ms
    const timeoutId = setTimeout(() => {
      setHistoryManager(prev => pushHistory(prev, nodes, edges));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, isUndoRedoAction]);

  // Handle multi-select via selection change
  useEffect(() => {
    const selected = nodes.filter(node => node.selected);
    if (selected.length > 1) {
      setSelectedNodes(selected);
      setSelectedNodeState(null);
      setSelectedEdgeState(null);
    } else if (selected.length === 0) {
      setSelectedNodes([]);
    }
  }, [nodes]);

  // Save handler - works for both single and multi-view
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      // Deep clone and strip selection state from nodes before saving
      const cleanNodes = JSON.parse(JSON.stringify(
        nodes.map(({ selected, dragging, ...node }) => node)
      ));
      const cleanEdges = JSON.parse(JSON.stringify(
        edges.map(({ selected, ...edge }) => edge)
      ));
      
      if (isMultiView && activeView) {
        // Save to product_views table
        const { error } = await supabase
          .from('product_views')
          // @ts-ignore - Supabase type inference issue with JSONB columns
          .update({
            nodes: cleanNodes,
            edges: cleanEdges,
            updated_at: new Date().toISOString(),
          })
          .eq('id', activeView.id);

        if (error) throw error;

        // Update local views state with deep cloned data
        setViews(prev => prev.map(v => 
          v.id === activeView.id 
            ? { ...v, nodes: cleanNodes, edges: cleanEdges }
            : v
        ));
      } else {
        // Save to maps table
        const { error } = await supabase
          .from('maps')
          // @ts-ignore - Supabase type inference issue with JSONB columns
          .update({
            nodes: cleanNodes,
            edges: cleanEdges,
            updated_at: new Date().toISOString(),
          })
          .eq('id', map.id);

        if (error) throw error;
      }

      setHasChanges(false);
      toast.success('Saved');
      analytics.trackMapSaved(map.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save: ${message}`);
    } finally {
      setSaving(false);
    }
  }, [nodes, edges, isMultiView, activeView, map.id]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasChanges) return;
    if (isMultiView && !activeView) return;

    const interval = setInterval(() => {
      if (hasChanges) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasChanges, handleSave, isMultiView, activeView]);


  // Handle view change (multi-view only)
  const handleViewChange = useCallback(async (viewId: string) => {
    if (!isMultiView) return;
    
    const newIndex = views.findIndex(v => v.id === viewId);
    if (newIndex === -1 || newIndex === activeViewIndex) return;

    // Deep clone current canvas state before saving
    const cleanNodes = JSON.parse(JSON.stringify(
      nodes.map(({ selected, dragging, ...node }) => node)
    ));
    const cleanEdges = JSON.parse(JSON.stringify(
      edges.map(({ selected, ...edge }) => edge)
    ));
    
    // Create a completely new views array with the current view updated
    const updatedViews = views.map((v, idx) => {
      if (idx === activeViewIndex) {
        return { 
          ...v, 
          nodes: cleanNodes, 
          edges: cleanEdges 
        };
      }
      // Deep clone other views to prevent any reference sharing
      return JSON.parse(JSON.stringify(v));
    });
    
    setViews(updatedViews);

    // Save current view to database if there are changes
    if (hasChanges && activeView) {
      setSaving(true);
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('product_views')
          // @ts-ignore - Supabase type inference issue with JSONB columns
          .update({
            nodes: cleanNodes,
            edges: cleanEdges,
            updated_at: new Date().toISOString(),
          })
          .eq('id', activeView.id);

        if (error) throw error;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to save: ${message}`);
      } finally {
        setSaving(false);
      }
    }

    // Switch to new view - get fresh data from the updated views array
    setActiveViewIndex(newIndex);
    const newView = updatedViews[newIndex];
    // Deep clone the new view's data to ensure complete isolation
    setNodes(JSON.parse(JSON.stringify(newView.nodes || [])) as Node[]);
    setEdges(JSON.parse(JSON.stringify(newView.edges || [])) as Edge[]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setHasChanges(false);
  }, [isMultiView, views, activeViewIndex, hasChanges, activeView, nodes, edges, setNodes, setEdges, setSelectedNode, setSelectedEdge]);

  // View management handlers (multi-view only)
  const handleAddView = useCallback(async (title: string, slug: string) => {
    if (!isMultiView) return;
    
    if (hasChanges && activeView) {
      await handleSave();
    }

    const supabase = createClient();
    const newOrderIndex = views.length;

    const { data, error } = await supabase
      .from('product_views')
      // @ts-ignore - Supabase type inference issue
      .insert({
        map_id: map.id,
        title,
        slug,
        order_index: newOrderIndex,
        nodes: [],
        edges: [],
      })
      .select()
      .single();

    if (error) throw error;

    const newView = data as ProductView;
    setViews(prev => [...prev, newView]);
    
    setActiveViewIndex(views.length);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setHasChanges(false);
    
    toast.success('View added');
  }, [isMultiView, map.id, views.length, hasChanges, activeView, handleSave, setNodes, setEdges, setSelectedNode, setSelectedEdge]);

  const handleUpdateView = useCallback(async (viewId: string, title: string, slug: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('product_views')
      // @ts-ignore - Supabase type inference issue
      .update({ title, slug, updated_at: new Date().toISOString() })
      .eq('id', viewId);

    if (error) throw error;

    setViews(prev => prev.map(v => 
      v.id === viewId ? { ...v, title, slug } : v
    ));
    
    toast.success('View updated');
  }, []);

  const handleDeleteView = useCallback(async (viewId: string) => {
    if (views.length <= 1) {
      toast.error('Cannot delete the last view');
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('product_views')
      .delete()
      .eq('id', viewId);

    if (error) throw error;

    const deletedIndex = views.findIndex(v => v.id === viewId);
    const newViews = views.filter(v => v.id !== viewId);
    
    let newActiveIndex = activeViewIndex;
    if (deletedIndex <= activeViewIndex) {
      newActiveIndex = Math.max(0, activeViewIndex - 1);
    }
    if (newActiveIndex >= newViews.length) {
      newActiveIndex = newViews.length - 1;
    }

    setViews(newViews);
    setActiveViewIndex(newActiveIndex);
    
    const newActiveView = newViews[newActiveIndex];
    if (newActiveView) {
      setNodes(JSON.parse(JSON.stringify(newActiveView.nodes)) as Node[]);
      setEdges(JSON.parse(JSON.stringify(newActiveView.edges)) as Edge[]);
    }
    
    setSelectedNode(null);
    setSelectedEdge(null);
    setHasChanges(false);
    
    toast.success('View deleted');
  }, [views, activeViewIndex, setNodes, setEdges, setSelectedNode, setSelectedEdge]);

  const handleReorderViews = useCallback(async (viewId: string, direction: 'up' | 'down') => {
    const currentIndex = views.findIndex(v => v.id === viewId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= views.length) return;

    const supabase = createClient();
    const reorderedViews = [...views];
    [reorderedViews[currentIndex], reorderedViews[newIndex]] = [reorderedViews[newIndex], reorderedViews[currentIndex]];

    const updates = reorderedViews.map((v, idx) => ({
      id: v.id,
      order_index: idx,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('product_views')
        // @ts-ignore - Supabase type inference issue
        .update({ order_index: update.order_index })
        .eq('id', update.id);
      
      if (error) throw error;
    }

    setViews(reorderedViews);
    
    if (activeViewIndex === currentIndex) {
      setActiveViewIndex(newIndex);
    } else if (activeViewIndex === newIndex) {
      setActiveViewIndex(currentIndex);
    }
  }, [views, activeViewIndex]);

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
      // Default to hierarchy edge type for new connections
      const defaultEdgeType = EdgeType.HIERARCHY;
      const validation = validateConnection(connection, nodes, edges, defaultEdgeType);
      
      if (!validation.isValid) {
        toast.error(validation.reason || 'Invalid connection');
        return;
      }

      const edgeStyle = getEdgeStyle(defaultEdgeType);
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        type: defaultEdgeType,
        data: { 
          edgeType: defaultEdgeType,
          direction: 'one-way',
        },
        style: edgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeStyle.stroke,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, edges, setEdges]
  );

  // Add node at the center of the current viewport
  const handleAddNode = useCallback(
    (type: 'product' | 'feature' | 'component' | 'textBlock' | 'group') => {
      const colors = {
        product: '#10b981',
        feature: '#3b82f6',
        component: '#8b5cf6',
        textBlock: '#f59e0b',
        group: '#6b7280',
      };

      const viewport = reactFlowInstance.getViewport();
      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      
      let centerX = 250;
      let centerY = 100;
      
      if (reactFlowBounds) {
        const centerScreenX = reactFlowBounds.width / 2;
        const centerScreenY = reactFlowBounds.height / 2;
        centerX = (centerScreenX - viewport.x) / viewport.zoom;
        centerY = (centerScreenY - viewport.y) / viewport.zoom;
      }

      // Text Block nodes have different data structure
      if (type === 'textBlock') {
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type,
          position: { x: centerX, y: centerY },
          data: {
            label: 'Text Block',
            content: '',
            color: colors[type],
          },
        };
        setNodes((nds) => [...nds, newNode]);
        analytics.trackNodeAdded(type);
        return;
      }

      // Group nodes have simpler data structure
      if (type === 'group') {
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type,
          position: { x: centerX, y: centerY },
          data: {
            label: 'New Group',
            description: '',
            color: colors[type],
          },
          style: {
            width: 300,
            height: 200,
          },
        };
        setNodes((nds) => [...nds, newNode]);
        analytics.trackNodeAdded(type);
        return;
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

  // Delete selected node(s)
  const handleDeleteNode = useCallback(() => {
    if (selectedNodes.length > 1) {
      // Bulk delete
      setDeleteNodeDialog(true);
    } else if (selectedNode) {
      // Single delete
      setDeleteNodeDialog(true);
    }
  }, [selectedNode, selectedNodes]);

  // Create group from selected nodes
  const handleCreateGroup = useCallback(() => {
    if (selectedNodes.length < 2) {
      toast.error('Select at least 2 nodes to create a group');
      return;
    }

    // Validate group creation
    const selectedNodeIds = selectedNodes.map(n => n.id);
    const validation = validateGroupOperation(nodes, 'create', selectedNodeIds);
    if (!validation.isValid) {
      toast.error(validation.reason || 'Cannot create group');
      return;
    }

    // Calculate bounding box of selected nodes
    const padding = 40;
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodes.forEach(node => {
      const nodeWidth = (node.width || 200);
      const nodeHeight = (node.height || 100);
      
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    // Create group node
    const groupNode: Node = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { 
        x: minX - padding, 
        y: minY - padding 
      },
      data: {
        label: 'New Group',
        description: '',
        color: '#6b7280',
        collapsed: false,
        childCount: selectedNodeIds.length,
        childNodeIds: selectedNodeIds,
      },
      style: {
        width: maxX - minX + (padding * 2),
        height: maxY - minY + (padding * 2),
        zIndex: -1,
      },
    };

    // Add group node and deselect all nodes
    setNodes((nds) => [
      ...nds.map(n => ({ ...n, selected: false })),
      groupNode,
    ]);
    
    setSelectedNodes([]);
    setSelectedNode(null);
    
    toast.success('Group created');
    analytics.trackNodeAdded('group');
  }, [selectedNodes, nodes, setNodes, setSelectedNode]);

  // Ungroup - remove group and show all children
  const handleUngroup = useCallback((groupId: string) => {
    try {
      const updatedNodes = ungroupAll(nodes, groupId);
      setNodes(updatedNodes);
      setSelectedNode(null);
      toast.success('Group removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to ungroup';
      toast.error(message);
    }
  }, [nodes, setNodes, setSelectedNode]);

  // Listen for ungroup events from group nodes
  useEffect(() => {
    const handleUngroupEvent = (e: Event) => {
      const target = e.target as HTMLElement;
      const nodeElement = target.closest('[data-id]');
      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-id');
        if (nodeId) {
          handleUngroup(nodeId);
        }
      }
    };

    document.addEventListener('ungroupNodes', handleUngroupEvent);
    
    return () => {
      document.removeEventListener('ungroupNodes', handleUngroupEvent);
    };
  }, [handleUngroup]);

  const confirmDeleteNode = useCallback(() => {
    if (selectedNodes.length > 1) {
      // Delete multiple nodes
      const nodeIds = selectedNodes.map(n => n.id);
      setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
      setEdges((eds) =>
        eds.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target))
      );
      setSelectedNodes([]);
    } else if (selectedNode) {
      // Delete single node
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
    }
  }, [selectedNode, selectedNodes, setNodes, setEdges, setSelectedNode]);

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
            // Separate edge-level properties from data properties
            const { markerStart, markerEnd, label, ...dataUpdates } = updates;
            
            const updatedEdge = {
              ...edge,
              data: { ...edge.data, ...dataUpdates },
            };

            // Handle edge-level properties
            if ('label' in updates) {
              updatedEdge.label = label as string;
            }
            if ('markerStart' in updates) {
              updatedEdge.markerStart = markerStart as typeof edge.markerStart;
            }
            if ('markerEnd' in updates) {
              updatedEdge.markerEnd = markerEnd as typeof edge.markerEnd;
            }

            return updatedEdge;
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

  // Auto-layout with fitView
  const handleAutoLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const layoutedNodes = applyLayout(nodes, edges, direction);
      setNodes(layoutedNodes);
      analytics.trackAutoLayout(direction);
      
      // Fit view after layout to keep nodes visible
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
      }, 50);
    },
    [nodes, edges, setNodes, reactFlowInstance]
  );

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (!canUndo(historyManager)) {
      toast.error('Nothing to undo');
      return;
    }

    const result = undoHistory(historyManager);
    if (result.state) {
      setIsUndoRedoAction(true);
      setHistoryManager(result.manager);
      setNodes(result.state.nodes);
      setEdges(result.state.edges);
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedNodes([]);
      toast.success('Undo');
    }
  }, [historyManager, setNodes, setEdges, setSelectedNode, setSelectedEdge]);

  const handleRedo = useCallback(() => {
    if (!canRedo(historyManager)) {
      toast.error('Nothing to redo');
      return;
    }

    const result = redoHistory(historyManager);
    if (result.state) {
      setIsUndoRedoAction(true);
      setHistoryManager(result.manager);
      setNodes(result.state.nodes);
      setEdges(result.state.edges);
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedNodes([]);
      toast.success('Redo');
    }
  }, [historyManager, setNodes, setEdges, setSelectedNode, setSelectedEdge]);

  // Alignment handlers - preserve selection state
  const handleAlign = useCallback((type: AlignmentType) => {
    if (selectedNodes.length < 2) {
      toast.error('Select at least 2 nodes to align');
      return;
    }

    const alignedNodes = applyAlignment(selectedNodes, type);
    const nodeIdMap = new Map(alignedNodes.map(n => [n.id, { ...n, selected: true }]));

    setNodes(nds => nds.map(n => nodeIdMap.get(n.id) || n));
    toast.success('Aligned');
  }, [selectedNodes, setNodes]);

  const handleDistribute = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedNodes.length < 3) {
      toast.error('Select at least 3 nodes to distribute');
      return;
    }

    const distributedNodes = direction === 'horizontal' 
      ? distributeHorizontally(selectedNodes)
      : distributeVertically(selectedNodes);
    
    const nodeIdMap = new Map(distributedNodes.map(n => [n.id, { ...n, selected: true }]));

    setNodes(nds => nds.map(n => nodeIdMap.get(n.id) || n));
    toast.success('Distributed');
  }, [selectedNodes, setNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');

      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && !isTyping) {
        e.preventDefault();
        handleUndo();
      }
      
      // Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z' && !isTyping) {
        e.preventDefault();
        handleRedo();
      }
      
      // Copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !isTyping) {
        const nodesToCopy = selectedNodes.length > 0 ? selectedNodes : (selectedNode ? [selectedNode] : []);
        if (nodesToCopy.length > 0) {
          e.preventDefault();
          copyNodesToClipboard(nodesToCopy, edges);
          toast.success(`Copied ${nodesToCopy.length} node${nodesToCopy.length > 1 ? 's' : ''}`);
        }
      }
      
      // Paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && !isTyping) {
        e.preventDefault();
        const result = pasteNodesFromClipboard(nodes, edges);
        if (result.nodes.length > nodes.length) {
          setNodes(result.nodes);
          setEdges(result.edges);
          const pastedCount = result.nodes.length - nodes.length;
          toast.success(`Pasted ${pastedCount} node${pastedCount > 1 ? 's' : ''}`);
        }
      }
      
      // Duplicate (Cmd/Ctrl+D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && !isTyping) {
        const nodesToDuplicate = selectedNodes.length > 0 ? selectedNodes : (selectedNode ? [selectedNode] : []);
        if (nodesToDuplicate.length > 0) {
          e.preventDefault();
          copyNodesToClipboard(nodesToDuplicate, edges);
          const result = pasteNodesFromClipboard(nodes, edges);
          setNodes(result.nodes);
          setEdges(result.edges);
          const duplicatedCount = result.nodes.length - nodes.length;
          toast.success(`Duplicated ${duplicatedCount} node${duplicatedCount > 1 ? 's' : ''}`);
        }
      }
      
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        if (selectedNodes.length > 1) {
          e.preventDefault();
          handleDeleteNode();
        } else if (selectedNode) {
          e.preventDefault();
          handleDeleteNode();
        } else if (selectedEdge) {
          e.preventDefault();
          handleDeleteEdge();
        }
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdge(null);
        setSelectedNodes([]);
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
      }
      
      // G key to create group from selected nodes
      if (e.key === 'g' && !isTyping && !e.metaKey && !e.ctrlKey) {
        if (selectedNodes.length >= 2) {
          e.preventDefault();
          handleCreateGroup();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, handleDeleteNode, handleDeleteEdge, handleCreateGroup, selectedNode, selectedNodes, selectedEdge, nodes, edges, setNodes, setEdges, setSelectedNode, setSelectedEdge]);

  // Handle empty views state for multi-view
  if (isMultiView && views.length === 0) {
    return (
      <div className="flex h-screen flex-col">
        <EditorTopBar
          map={map}
          saving={false}
          hasChanges={false}
          onSave={() => {}}
          onTogglePublish={handleTogglePublish}
        />
        <div className="flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Views Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first view to start building your multi-view documentation map.
            </p>
            <button
              onClick={() => handleAddView('Overview', 'overview')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorTopBar
        map={map}
        currentView={activeView || undefined}
        saving={saving}
        hasChanges={hasChanges}
        onSave={handleSave}
        onTogglePublish={handleTogglePublish}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Views Panel - only shown for multi-view maps */}
        {isMultiView && (
          <ViewManagementPanel
            views={views}
            activeViewId={activeView?.id || ''}
            onViewChange={handleViewChange}
            onAddView={handleAddView}
            onUpdateView={handleUpdateView}
            onDeleteView={handleDeleteView}
            onReorderViews={handleReorderViews}
            disabled={saving}
          />
        )}

        <LeftSidebar
          onAddNode={handleAddNode}
          onAutoLayout={handleAutoLayout}
          showGrid={showGrid}
          showMiniMap={showMiniMap}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
          selectedNodesCount={selectedNodes.length}
          onAlign={handleAlign}
          onDistribute={handleDistribute}
          onCreateGroup={handleCreateGroup}
        />

        <EditorCanvas
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          showGrid={showGrid}
          showMiniMap={showMiniMap}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(e, node) => {
            // Handle multi-select with Shift key
            if (e.shiftKey) {
              e.stopPropagation();
              const isCurrentlySelected = nodes.find(n => n.id === node.id)?.selected;
              
              if (isCurrentlySelected) {
                // Deselect if already selected
                setNodes(nds => nds.map(n => 
                  n.id === node.id ? { ...n, selected: false } : n
                ));
              } else {
                // Add to selection
                setNodes(nds => nds.map(n => 
                  n.id === node.id ? { ...n, selected: true } : n
                ));
              }
              // Clear single selection when multi-selecting
              setSelectedNode(null);
              setSelectedEdge(null);
            } else {
              // Clear all selections and select only this node
              setNodes(nds => nds.map(n => ({ ...n, selected: false })));
              setSelectedNode(node);
              setSelectedEdge(null);
              setSelectedNodes([]);
            }
          }}
          onEdgeClick={(_e, edge) => setSelectedEdge(edge)}
          onPaneClick={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
            setSelectedNodes([]);
            // Clear all node selections
            setNodes(nds => nds.map(n => ({ ...n, selected: false })));
          }}
        />

        <RightPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          selectedNodes={selectedNodes}
          nodes={nodes}
          onUpdateNode={handleUpdateNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          onUngroup={handleUngroup}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
            setSelectedNodes([]);
            setNodes(nds => nds.map(n => ({ ...n, selected: false })));
          }}
          availableViews={isMultiView ? views : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteNodeDialog}
        onOpenChange={setDeleteNodeDialog}
        title={selectedNodes.length > 1 ? `Delete ${selectedNodes.length} Nodes` : "Delete Node"}
        description={
          selectedNodes.length > 1
            ? `Are you sure you want to delete ${selectedNodes.length} nodes? All connected edges will also be removed.`
            : "Are you sure you want to delete this node? All connected edges will also be removed."
        }
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

export function UnifiedEditor({ map, initialViews }: UnifiedEditorProps) {
  return (
    <ReactFlowProvider>
      <UnifiedEditorContent map={map} initialViews={initialViews} />
    </ReactFlowProvider>
  );
}

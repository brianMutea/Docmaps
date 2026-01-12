'use client';

/**
 * CanvasEditor - Single-view map editor component
 * 
 * This component handles editing for single-view maps (view_type: 'single').
 * For multi-view maps, see MultiViewEditor in ./editors/multi-view-editor.tsx
 * 
 * Features:
 * - Full canvas editing with React Flow
 * - Node management (add, update, delete)
 * - Edge management with multiple edge types
 * - Auto-save every 30 seconds
 * - Keyboard shortcuts (Cmd/Ctrl+S, Delete, Escape)
 * - SVG export functionality
 * - Publish/unpublish workflow
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  useReactFlow,
  ReactFlowProvider,
  getNodesBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createClient } from '@/lib/supabase';
import { useEditorStore } from '@/lib/store/editor-store';
import { applyLayout } from '@/lib/layout';
import { toast } from '@/lib/utils/toast';
import { analytics } from '@/lib/analytics';
import type { Map as MapType } from '@docmaps/database';
import { ConfirmDialog } from '@docmaps/ui';
import { LeftSidebar } from './canvas/left-sidebar';
import { RightPanel } from './canvas/right-panel';
import { TopBar } from './canvas/top-bar';
import { ProductNode } from './canvas/nodes/product-node';
import { FeatureNode } from './canvas/nodes/feature-node';
import { ComponentNode } from './canvas/nodes/component-node';

interface CanvasEditorProps {
  map: MapType;
}

function CanvasEditorContent({ map }: CanvasEditorProps) {
  const reactFlowInstance = useReactFlow();
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(map.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(map.edges as Edge[]);
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [deleteNodeDialog, setDeleteNodeDialog] = useState(false);
  const [deleteEdgeDialog, setDeleteEdgeDialog] = useState(false);

  const {
    selectedNode,
    selectedEdge,
    saving,
    hasChanges,
    setSelectedNode,
    setSelectedEdge,
    setSaving,
    setHasChanges,
  } = useEditorStore();

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
        // Solid arrow (default)
        return {
          style: { ...baseStyle, stroke: '#64748b' },
          markerEnd: { ...markerEnd, color: '#64748b' },
        };
      case 'related':
        // Dashed line
        return {
          style: { ...baseStyle, stroke: '#3b82f6', strokeDasharray: '5,5' },
          markerEnd: { ...markerEnd, color: '#3b82f6' },
        };
      case 'depends-on':
        // Bold line
        return {
          style: { strokeWidth: 3, stroke: '#ef4444' },
          markerEnd: { ...markerEnd, color: '#ef4444' },
        };
      case 'optional':
        // Dotted line
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
  }, [nodes, edges, setHasChanges]);

  // Handle save
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('maps')
        // @ts-ignore - Supabase type inference issue with JSONB columns
        .update({
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', map.id);

      if (error) throw error;

      setHasChanges(false);
      toast.success('Saved');
      
      // Track map save
      analytics.trackMapSaved(map.id);
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [nodes, edges, map.id, setSaving, setHasChanges]);

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

        // Update local map state
        map.status = newStatus;
        if (newStatus === 'published') {
          map.published_at = new Date().toISOString();
          toast.success('Published - Your map is now public');
          
          // Track map published
          analytics.trackMapPublished(map.id);
        } else {
          map.published_at = null;
          toast.success('Unpublished - Your map is now private');
        }
        
        router.refresh();
      } catch (error: any) {
        toast.error(`Failed to update status: ${error.message}`);
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

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
    },
    [setSelectedEdge]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

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
      
      // Track node addition
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
    (nodeId: string, updates: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
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
    (edgeId: string, updates: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              ...updates,
              data: {
                ...edge.data,
                ...updates,
              },
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
      
      // Track auto-layout usage
      analytics.trackAutoLayout(direction);
    },
    [nodes, edges, setNodes]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');

      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Delete/Backspace to delete selected (only if not typing)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        if (selectedNode) {
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

      // Get bounds of all nodes
      const nodesBounds = getNodesBounds(nodes);
      const padding = 40;
      
      // Calculate SVG dimensions with padding
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;
      const offsetX = nodesBounds.x - padding;
      const offsetY = nodesBounds.y - padding;

      // Create SVG element
      const svgNS = 'http://www.w3.org/2000/svg';
      const svgElement = document.createElementNS(svgNS, 'svg');
      svgElement.setAttribute('width', width.toString());
      svgElement.setAttribute('height', height.toString());
      svgElement.setAttribute('viewBox', `${offsetX} ${offsetY} ${width} ${height}`);
      svgElement.setAttribute('xmlns', svgNS);
      
      // Add white background
      const background = document.createElementNS(svgNS, 'rect');
      background.setAttribute('x', offsetX.toString());
      background.setAttribute('y', offsetY.toString());
      background.setAttribute('width', width.toString());
      background.setAttribute('height', height.toString());
      background.setAttribute('fill', '#ffffff');
      svgElement.appendChild(background);

      // Add defs for arrow markers
      const defs = document.createElementNS(svgNS, 'defs');
      const markerColors = [
        { id: 'arrow-gray', color: '#64748b' },
        { id: 'arrow-blue', color: '#3b82f6' },
        { id: 'arrow-red', color: '#ef4444' },
        { id: 'arrow-slate', color: '#94a3b8' },
      ];
      
      markerColors.forEach(({ id, color }) => {
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        path.setAttribute('fill', color);
        marker.appendChild(path);
        defs.appendChild(marker);
      });
      svgElement.appendChild(defs);

      // Draw edges first (so they appear behind nodes)
      styledEdges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return;

        // Get actual node dimensions based on type
        const getNodeDimensions = (node: Node) => {
          if (node.type === 'feature') return { width: 170, height: 70 };
          if (node.type === 'component') return { width: 130, height: 60 };
          return { width: 200, height: 80 };
        };

        const sourceDim = getNodeDimensions(sourceNode);
        const targetDim = getNodeDimensions(targetNode);

        // Calculate edge positions (from bottom center of source to top center of target)
        const sourceX = sourceNode.position.x + sourceDim.width / 2;
        const sourceY = sourceNode.position.y + sourceDim.height;
        const targetX = targetNode.position.x + targetDim.width / 2;
        const targetY = targetNode.position.y;

        const edgeType = edge.data?.edgeType || 'hierarchy';
        let strokeColor = '#64748b';
        let strokeWidth = '2';
        let strokeDasharray = 'none';
        let markerId = 'arrow-gray';

        switch (edgeType) {
          case 'related':
            strokeColor = '#3b82f6';
            strokeDasharray = '5,5';
            markerId = 'arrow-blue';
            break;
          case 'depends-on':
            strokeColor = '#ef4444';
            strokeWidth = '3';
            markerId = 'arrow-red';
            break;
          case 'optional':
            strokeColor = '#94a3b8';
            strokeDasharray = '2,2';
            markerId = 'arrow-slate';
            break;
        }

        // Create smooth bezier curve path
        const deltaY = targetY - sourceY;
        const controlPointOffset = Math.abs(deltaY) * 0.5;
        
        // Control points for smooth S-curve
        const cp1x = sourceX;
        const cp1y = sourceY + controlPointOffset;
        const cp2x = targetX;
        const cp2y = targetY - controlPointOffset;

        const pathData = `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        if (strokeDasharray !== 'none') {
          path.setAttribute('stroke-dasharray', strokeDasharray);
        }
        path.setAttribute('marker-end', `url(#${markerId})`);
        svgElement.appendChild(path);
      });

      // Draw nodes
      nodes.forEach((node) => {
        const x = node.position.x;
        const y = node.position.y;
        const color = node.data.color || '#10b981';
        
        // Determine node dimensions based on type - matching actual component sizes
        let nodeWidth = 200;
        let nodeHeight = 80;
        let innerPadding = 12;
        let iconSize = 32;
        let fontSize = '14px';
        let fontWeight = '600';
        let borderWidth = 4;
        let borderRadius = '8';
        let shadowOpacity = '0.1';
        
        if (node.type === 'feature') {
          nodeWidth = 170;
          nodeHeight = 70;
          innerPadding = 10;
          iconSize = 28;
          fontSize = '14px';
          fontWeight = '500';
          borderWidth = 4;
        } else if (node.type === 'component') {
          nodeWidth = 130;
          nodeHeight = 60;
          innerPadding = 8;
          iconSize = 24;
          fontSize = '12px';
          fontWeight = '500';
          borderWidth = 3;
          borderRadius = '8';
        }

        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('transform', `translate(${x}, ${y})`);

        // Drop shadow using filter
        const filterId = `shadow-${node.id}`;
        const filter = document.createElementNS(svgNS, 'filter');
        filter.setAttribute('id', filterId);
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
        
        const feGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', node.type === 'component' ? '1' : '2');
        filter.appendChild(feGaussianBlur);
        
        const feOffset = document.createElementNS(svgNS, 'feOffset');
        feOffset.setAttribute('dx', '0');
        feOffset.setAttribute('dy', '2');
        feOffset.setAttribute('result', 'offsetblur');
        filter.appendChild(feOffset);
        
        const feComponentTransfer = document.createElementNS(svgNS, 'feComponentTransfer');
        const feFuncA = document.createElementNS(svgNS, 'feFuncA');
        feFuncA.setAttribute('type', 'linear');
        feFuncA.setAttribute('slope', shadowOpacity);
        feComponentTransfer.appendChild(feFuncA);
        filter.appendChild(feComponentTransfer);
        
        const feMerge = document.createElementNS(svgNS, 'feMerge');
        const feMergeNode1 = document.createElementNS(svgNS, 'feMergeNode');
        const feMergeNode2 = document.createElementNS(svgNS, 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feMerge);
        
        defs.appendChild(filter);

        // Node background with shadow
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('width', nodeWidth.toString());
        rect.setAttribute('height', nodeHeight.toString());
        rect.setAttribute('rx', borderRadius);
        rect.setAttribute('fill', '#ffffff');
        rect.setAttribute('stroke', '#e5e7eb');
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('filter', `url(#${filterId})`);
        group.appendChild(rect);

        // Left border
        const leftBorder = document.createElementNS(svgNS, 'rect');
        leftBorder.setAttribute('width', borderWidth.toString());
        leftBorder.setAttribute('height', nodeHeight.toString());
        leftBorder.setAttribute('rx', borderRadius);
        leftBorder.setAttribute('fill', color);
        group.appendChild(leftBorder);

        // Icon background
        const iconBg = document.createElementNS(svgNS, 'rect');
        iconBg.setAttribute('x', (innerPadding + borderWidth).toString());
        iconBg.setAttribute('y', innerPadding.toString());
        iconBg.setAttribute('width', iconSize.toString());
        iconBg.setAttribute('height', iconSize.toString());
        iconBg.setAttribute('rx', (node.type === 'component' ? '4' : '8').toString());
        iconBg.setAttribute('fill', color);
        group.appendChild(iconBg);

        // Icon (using actual Lucide icon SVG paths)
        const iconGroup = document.createElementNS(svgNS, 'g');
        const iconX = innerPadding + borderWidth + iconSize / 2;
        const iconY = innerPadding + iconSize / 2;
        
        // Scale factor for icons based on size
        const iconScale = iconSize / 24; // Lucide icons are 24x24 by default
        iconGroup.setAttribute('transform', `translate(${iconX}, ${iconY}) scale(${iconScale})`);
        
        if (node.type === 'product') {
          // Box icon - Lucide "Box" icon path
          const boxPath = document.createElementNS(svgNS, 'path');
          boxPath.setAttribute('d', 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z');
          boxPath.setAttribute('fill', 'none');
          boxPath.setAttribute('stroke', '#ffffff');
          boxPath.setAttribute('stroke-width', '2');
          boxPath.setAttribute('stroke-linecap', 'round');
          boxPath.setAttribute('stroke-linejoin', 'round');
          boxPath.setAttribute('transform', 'translate(-12, -12)');
          iconGroup.appendChild(boxPath);
          
          const boxLine = document.createElementNS(svgNS, 'polyline');
          boxLine.setAttribute('points', '3.27 6.96 12 12.01 20.73 6.96');
          boxLine.setAttribute('fill', 'none');
          boxLine.setAttribute('stroke', '#ffffff');
          boxLine.setAttribute('stroke-width', '2');
          boxLine.setAttribute('stroke-linecap', 'round');
          boxLine.setAttribute('stroke-linejoin', 'round');
          boxLine.setAttribute('transform', 'translate(-12, -12)');
          iconGroup.appendChild(boxLine);
          
          const boxVertLine = document.createElementNS(svgNS, 'line');
          boxVertLine.setAttribute('x1', '12');
          boxVertLine.setAttribute('y1', '12.01');
          boxVertLine.setAttribute('x2', '12');
          boxVertLine.setAttribute('y2', '22.08');
          boxVertLine.setAttribute('stroke', '#ffffff');
          boxVertLine.setAttribute('stroke-width', '2');
          boxVertLine.setAttribute('stroke-linecap', 'round');
          boxVertLine.setAttribute('transform', 'translate(-12, -12)');
          iconGroup.appendChild(boxVertLine);
        } else if (node.type === 'feature') {
          // Zap/Lightning icon - Lucide "Zap" icon path
          const zapPath = document.createElementNS(svgNS, 'polygon');
          zapPath.setAttribute('points', '13 2 3 14 12 14 11 22 21 10 12 10 13 2');
          zapPath.setAttribute('fill', '#ffffff');
          zapPath.setAttribute('stroke', '#ffffff');
          zapPath.setAttribute('stroke-width', '2');
          zapPath.setAttribute('stroke-linecap', 'round');
          zapPath.setAttribute('stroke-linejoin', 'round');
          zapPath.setAttribute('transform', 'translate(-12, -12)');
          iconGroup.appendChild(zapPath);
        } else {
          // Wrench icon - Lucide "Wrench" icon path
          const wrenchPath = document.createElementNS(svgNS, 'path');
          wrenchPath.setAttribute('d', 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z');
          wrenchPath.setAttribute('fill', 'none');
          wrenchPath.setAttribute('stroke', '#ffffff');
          wrenchPath.setAttribute('stroke-width', '2');
          wrenchPath.setAttribute('stroke-linecap', 'round');
          wrenchPath.setAttribute('stroke-linejoin', 'round');
          wrenchPath.setAttribute('transform', 'translate(-12, -12)');
          iconGroup.appendChild(wrenchPath);
        }
        group.appendChild(iconGroup);

        // Node label with better positioning
        const textX = innerPadding + borderWidth + iconSize + 8;
        const textY = node.data.status && node.type !== 'component' 
          ? innerPadding + iconSize / 2 - 2 
          : innerPadding + iconSize / 2 + 5;
        
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', textX.toString());
        text.setAttribute('y', textY.toString());
        text.setAttribute('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
        text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', fontWeight);
        text.setAttribute('fill', '#111827');
        text.setAttribute('dominant-baseline', 'middle');
        
        // Truncate long labels
        let label = node.data.label || 'Untitled';
        const maxLength = node.type === 'component' ? 11 : node.type === 'feature' ? 13 : 15;
        if (label.length > maxLength) {
          label = label.substring(0, maxLength) + '...';
        }
        text.textContent = label;
        group.appendChild(text);

        // Status badge (if present)
        if (node.data.status && node.type !== 'component') {
          const statusY = innerPadding + iconSize / 2 + 14;
          const statusColors: Record<string, { bg: string; text: string }> = {
            stable: { bg: '#dcfce7', text: '#166534' },
            beta: { bg: '#dbeafe', text: '#1e40af' },
            deprecated: { bg: '#fee2e2', text: '#991b1b' },
            experimental: { bg: '#fef3c7', text: '#92400e' },
          };
          
          const statusColor = statusColors[node.data.status] || statusColors.stable;
          const statusText = node.data.status;
          const statusWidth = statusText.length * 5.5 + 12;
          
          const statusBg = document.createElementNS(svgNS, 'rect');
          statusBg.setAttribute('x', textX.toString());
          statusBg.setAttribute('y', (statusY - 8).toString());
          statusBg.setAttribute('width', statusWidth.toString());
          statusBg.setAttribute('height', '14');
          statusBg.setAttribute('rx', '7');
          statusBg.setAttribute('fill', statusColor.bg);
          group.appendChild(statusBg);
          
          const statusLabel = document.createElementNS(svgNS, 'text');
          statusLabel.setAttribute('x', (textX + statusWidth / 2).toString());
          statusLabel.setAttribute('y', statusY.toString());
          statusLabel.setAttribute('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
          statusLabel.setAttribute('font-size', '10px');
          statusLabel.setAttribute('font-weight', '500');
          statusLabel.setAttribute('fill', statusColor.text);
          statusLabel.setAttribute('text-anchor', 'middle');
          statusLabel.setAttribute('dominant-baseline', 'middle');
          statusLabel.textContent = statusText;
          group.appendChild(statusLabel);
        }

        svgElement.appendChild(group);
      });

      // Convert to string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);
      
      // Add proper XML declaration
      svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svgString}`;
      
      // Create blob and download
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${map.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`;
      link.href = url;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);

      toast.success('Map exported as SVG successfully');
      
      // Track map export
      analytics.trackMapExported(map.id, 'svg');
    } catch (error) {
      console.error('Error exporting map:', error);
      toast.error('Failed to export map');
    }
  }, [nodes, styledEdges, map.title, map.id, reactFlowInstance]);

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
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

      {/* Main Editor */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <LeftSidebar
          onAddNode={handleAddNode}
          onAutoLayout={handleAutoLayout}
          showGrid={showGrid}
          showMiniMap={showMiniMap}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
        />

        {/* Canvas - Now full width */}
        <div className="flex-1 relative">
          {/* Center Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: '1px',
              height: '100%',
              background: 'repeating-linear-gradient(to bottom, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 8px)',
              opacity: 0.4,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
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
          </ReactFlow>
        </div>

        {/* Floating Right Panel */}
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

      {/* Delete Node Confirmation Dialog */}
      <ConfirmDialog
        open={deleteNodeDialog}
        onOpenChange={setDeleteNodeDialog}
        title="Delete Node"
        description="Are you sure you want to delete this node? All connected edges will also be removed. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteNode}
        variant="destructive"
      />

      {/* Delete Edge Confirmation Dialog */}
      <ConfirmDialog
        open={deleteEdgeDialog}
        onOpenChange={setDeleteEdgeDialog}
        title="Delete Edge"
        description="Are you sure you want to delete this edge? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteEdge}
        variant="destructive"
      />
    </div>
  );
}


export function CanvasEditor({ map }: CanvasEditorProps) {
  return (
    <ReactFlowProvider>
      <CanvasEditorContent map={map} />
    </ReactFlowProvider>
  );
}

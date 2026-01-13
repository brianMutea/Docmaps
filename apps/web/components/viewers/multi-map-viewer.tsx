'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  getNodesBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Search, ZoomIn, ZoomOut, Maximize2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Map as MapType, ProductView } from '@docmaps/database';
import { ViewerHeader } from '../viewer-header';
import { NodeDetailPanel } from '../node-detail-panel';
import { FloatingSidebar } from '../floating-sidebar';
import { ProductNode } from '../nodes/product-node';
import { FeatureNode } from '../nodes/feature-node';
import { ComponentNode } from '../nodes/component-node';

interface MultiMapViewerProps {
  map: MapType;
  views: ProductView[];
  embedded?: boolean;
}

function MultiMapViewerContent({ map, views, embedded = false }: MultiMapViewerProps) {
  const reactFlowInstance = useReactFlow();
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  const activeView = views[activeViewIndex];
  const [displayNodes, setDisplayNodes] = useState<Node[]>(activeView.nodes as Node[]);

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

  // Apply edge styles
  const styledEdges = useMemo(() => {
    return (activeView.edges as Edge[]).map((edge) => {
      const edgeType = edge.data?.edgeType || 'hierarchy';
      const { style, markerEnd } = getEdgeStyle(edgeType);
      return {
        ...edge,
        style: { ...edge.style, ...style },
        markerEnd: markerEnd,
      };
    });
  }, [activeView.edges, getEdgeStyle]);

  // Handle view change with transition
  const handleViewChange = useCallback((viewId: string) => {
    const newIndex = views.findIndex(v => v.id === viewId);
    if (newIndex === -1 || newIndex === activeViewIndex) return;

    setIsViewTransitioning(true);
    setTimeout(() => {
      setActiveViewIndex(newIndex);
      const newView = views[newIndex];
      setDisplayNodes(newView.nodes as Node[]);
      setSelectedNode(null);
      setSearchQuery('');
      setIsViewTransitioning(false);
    }, 150);
  }, [views, activeViewIndex]);

  // Navigate to previous/next view
  const goToPrevView = useCallback(() => {
    if (activeViewIndex > 0) {
      handleViewChange(views[activeViewIndex - 1].id);
    }
  }, [activeViewIndex, views, handleViewChange]);

  const goToNextView = useCallback(() => {
    if (activeViewIndex < views.length - 1) {
      handleViewChange(views[activeViewIndex + 1].id);
    }
  }, [activeViewIndex, views, handleViewChange]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowSidebar(true);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Navigate to a view by slug
  const navigateToViewBySlug = useCallback((slug: string) => {
    const viewIndex = views.findIndex(v => v.slug === slug);
    if (viewIndex !== -1) {
      handleViewChange(views[viewIndex].id);
    }
  }, [views, handleViewChange]);

  // Navigate to node
  const navigateToNode = useCallback((node: Node) => {
    setSelectedNode(node);
    if (reactFlowInstance) {
      reactFlowInstance.setCenter(
        node.position.x + 100,
        node.position.y + 50,
        { zoom: 1.5, duration: 800 }
      );
    }
  }, [reactFlowInstance]);

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      const baseNodes = activeView.nodes as Node[];
      
      if (!query.trim()) {
        setDisplayNodes(baseNodes);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const matchingNodes: Node[] = [];
      
      const updatedNodes = baseNodes.map((node) => {
        const matches = node.data.label?.toLowerCase().includes(lowerQuery);
        if (matches) {
          matchingNodes.push(node);
        }
        return {
          ...node,
          style: {
            ...node.style,
            opacity: matches ? 1 : 0.3,
            boxShadow: matches ? '0 0 0 3px #3b82f6' : undefined,
          },
        };
      });
      
      setDisplayNodes(updatedNodes);

      // Auto-zoom to first match
      if (matchingNodes.length > 0 && reactFlowInstance) {
        const firstMatch = matchingNodes[0];
        reactFlowInstance.setCenter(
          firstMatch.position.x + 100,
          firstMatch.position.y + 50,
          { zoom: 1.5, duration: 800 }
        );
      }
    },
    [activeView.nodes, reactFlowInstance]
  );

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn({ duration: 300 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut({ duration: 300 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ duration: 500, padding: 0.2 });
  }, [reactFlowInstance]);

  const nodeCount = (activeView.nodes as Node[]).length;

  // SVG Export function
  const handleExportSVG = useCallback(() => {
    try {
      const nodes = activeView.nodes as Node[];
      const edges = activeView.edges as Edge[];
      
      if (nodes.length === 0) {
        toast.error('No nodes to export');
        return;
      }

      // Calculate bounds with padding
      const bounds = getNodesBounds(nodes);
      const padding = 60;
      const nodeWidth = 200;
      const nodeHeight = 80;
      
      // Adjust bounds to account for node dimensions
      const minX = bounds.x - padding;
      const minY = bounds.y - padding;
      const width = bounds.width + nodeWidth + padding * 2;
      const height = bounds.height + nodeHeight + padding * 2;

      // Create SVG
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('xmlns', svgNS);
      svg.setAttribute('width', String(width));
      svg.setAttribute('height', String(height));
      svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
      svg.setAttribute('style', 'font-family: system-ui, -apple-system, sans-serif;');

      // Add defs for markers and gradients
      const defs = document.createElementNS(svgNS, 'defs');
      
      // Arrow marker
      const marker = document.createElementNS(svgNS, 'marker');
      marker.setAttribute('id', 'arrowhead');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      const polygon = document.createElementNS(svgNS, 'polygon');
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
      polygon.setAttribute('fill', '#64748b');
      marker.appendChild(polygon);
      defs.appendChild(marker);
      svg.appendChild(defs);

      // Background
      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', String(minX));
      bg.setAttribute('y', String(minY));
      bg.setAttribute('width', String(width));
      bg.setAttribute('height', String(height));
      bg.setAttribute('fill', '#ffffff');
      svg.appendChild(bg);

      // Draw edges
      edges.forEach((edge) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const path = document.createElementNS(svgNS, 'path');
        const sx = sourceNode.position.x + nodeWidth / 2;
        const sy = sourceNode.position.y + nodeHeight;
        const tx = targetNode.position.x + nodeWidth / 2;
        const ty = targetNode.position.y;
        
        // Bezier curve for smooth edges
        const midY = (sy + ty) / 2;
        const d = `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', edge.style?.stroke as string || '#64748b');
        path.setAttribute('stroke-width', String(edge.style?.strokeWidth || 2));
        if (edge.style?.strokeDasharray) {
          path.setAttribute('stroke-dasharray', edge.style.strokeDasharray as string);
        }
        path.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(path);
      });

      // Draw nodes
      nodes.forEach((node) => {
        const g = document.createElementNS(svgNS, 'g');
        g.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);

        // Node colors
        const colors: Record<string, string> = {
          product: node.data.color || '#10b981',
          feature: node.data.color || '#3b82f6',
          component: node.data.color || '#8b5cf6',
        };
        const color = colors[node.type || 'product'] || '#64748b';

        // Node background
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('width', String(nodeWidth));
        rect.setAttribute('height', String(nodeHeight));
        rect.setAttribute('rx', '12');
        rect.setAttribute('fill', '#ffffff');
        rect.setAttribute('stroke', color);
        rect.setAttribute('stroke-width', '2');
        g.appendChild(rect);

        // Color accent bar
        const accent = document.createElementNS(svgNS, 'rect');
        accent.setAttribute('x', '0');
        accent.setAttribute('y', '0');
        accent.setAttribute('width', '6');
        accent.setAttribute('height', String(nodeHeight));
        accent.setAttribute('rx', '3');
        accent.setAttribute('fill', color);
        g.appendChild(accent);

        // Icon (if exists)
        if (node.data.icon) {
          const iconText = document.createElementNS(svgNS, 'text');
          iconText.setAttribute('x', '20');
          iconText.setAttribute('y', '35');
          iconText.setAttribute('font-size', '20');
          iconText.textContent = node.data.icon;
          g.appendChild(iconText);
        }

        // Label - full text without truncation
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', node.data.icon ? '48' : '20');
        label.setAttribute('y', '35');
        label.setAttribute('font-size', '14');
        label.setAttribute('font-weight', '600');
        label.setAttribute('fill', '#1f2937');
        label.textContent = node.data.label || 'Untitled';
        g.appendChild(label);

        // Type badge
        const badge = document.createElementNS(svgNS, 'text');
        badge.setAttribute('x', node.data.icon ? '48' : '20');
        badge.setAttribute('y', '55');
        badge.setAttribute('font-size', '11');
        badge.setAttribute('fill', '#6b7280');
        badge.setAttribute('text-transform', 'capitalize');
        badge.textContent = node.type || 'node';
        g.appendChild(badge);

        // Status indicator
        if (node.data.status && node.data.status !== 'stable') {
          const statusColors: Record<string, string> = {
            beta: '#3b82f6',
            experimental: '#f59e0b',
            deprecated: '#ef4444',
          };
          const statusCircle = document.createElementNS(svgNS, 'circle');
          statusCircle.setAttribute('cx', String(nodeWidth - 15));
          statusCircle.setAttribute('cy', '15');
          statusCircle.setAttribute('r', '5');
          statusCircle.setAttribute('fill', statusColors[node.data.status] || '#6b7280');
          g.appendChild(statusCircle);
        }

        svg.appendChild(g);
      });

      // Serialize and download
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svg);
      svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${map.title}-${activeView.title}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      link.download = `${fileName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('SVG exported successfully');
    } catch (error) {
      console.error('SVG export error:', error);
      toast.error('Failed to export SVG');
    }
  }, [activeView, map.title]);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <ViewerHeader 
        map={map} 
        currentView={activeView} 
        embedded={embedded}
        onExportSVG={handleExportSVG}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* View Selector Sidebar - Desktop */}
        {!embedded && (
          <div className="hidden sm:flex flex-col w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200">
            {/* Sidebar Header */}
            <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Products</h3>
                <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {views.length}
                </span>
              </div>
            </div>
            
            {/* View List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {views.map((view, index) => (
                <button
                  key={view.id}
                  onClick={() => handleViewChange(view.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
                    view.id === activeView.id
                      ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                      view.id === activeView.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`font-medium truncate ${view.id === activeView.id ? 'text-gray-900' : ''}`}>{view.title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* View Navigation */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPrevView}
                  disabled={activeViewIndex === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-gray-500">
                  {activeViewIndex + 1} of {views.length}
                </span>
                <button
                  onClick={goToNextView}
                  disabled={activeViewIndex === views.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile View Selector */}
        {!embedded && views.length > 1 && (
          <div className="sm:hidden absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-1">
              <button
                onClick={goToPrevView}
                disabled={activeViewIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <select
                value={activeView.id}
                onChange={(e) => handleViewChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none min-w-[100px] text-center"
              >
                {views.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.title}
                  </option>
                ))}
              </select>
              <button
                onClick={goToNextView}
                disabled={activeViewIndex === views.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Controls - Top Left (Search) */}
        {!embedded && (
          <div className="absolute top-4 left-4 sm:left-[calc(16rem+1rem)] z-10 flex flex-col gap-2">
            <button
              onClick={() => setShowQuickSearch(!showQuickSearch)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border transition-all duration-200 ${
                showQuickSearch
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white/95 backdrop-blur-sm text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300'
              }`}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Search</span>
            </button>

            {showQuickSearch && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 w-72 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search nodes..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {searchQuery && (
                  <p className="mt-2 text-xs text-gray-500">
                    {displayNodes.filter(n => n.style?.opacity === 1 || !n.style?.opacity).length} results
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Floating Controls - Bottom Left */}
        {!embedded && (
          <div className="absolute bottom-4 left-4 sm:left-[calc(16rem+1rem)] z-10 flex items-center gap-2">
            <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={handleZoomOut}
                className="p-2.5 text-gray-600 hover:bg-gray-100 transition-colors border-r border-gray-200"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2.5 text-gray-600 hover:bg-gray-100 transition-colors border-r border-gray-200"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleFitView}
                className="p-2.5 text-gray-600 hover:bg-gray-100 transition-colors"
                title="Fit to view"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-3 py-2">
              <span className="text-xs font-medium text-gray-600">
                {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
              </span>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className={`flex-1 h-full transition-opacity duration-150 ${isViewTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          <ReactFlow
            nodes={displayNodes}
            edges={styledEdges}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="#e2e8f0"
            />
            {!embedded && (
              <MiniMap 
                nodeStrokeWidth={3}
                pannable
                zoomable
                className="!bg-white/90 !border !border-gray-200 !rounded-xl !shadow-lg"
                maskColor="rgba(0, 0, 0, 0.08)"
              />
            )}
            <Controls 
              showZoom={false}
              showFitView={false}
              showInteractive={false}
              className="!hidden"
            />
          </ReactFlow>
        </div>

        {/* Node Detail Sidebar */}
        {!embedded && (selectedNode || showSidebar) && (
          <FloatingSidebar
            isOpen={showSidebar}
            onClose={() => {
              setShowSidebar(false);
              setSelectedNode(null);
            }}
            title="Node Details"
          >
            <NodeDetailPanel
              selectedNode={selectedNode}
              nodes={activeView.nodes as Node[]}
              edges={activeView.edges as Edge[]}
              onNodeNavigate={navigateToNode}
              onViewNavigate={navigateToViewBySlug}
            />
          </FloatingSidebar>
        )}
      </div>
    </div>
  );
}

export function MultiMapViewer({ map, views, embedded = false }: MultiMapViewerProps) {
  return (
    <ReactFlowProvider>
      <MultiMapViewerContent map={map} views={views} embedded={embedded} />
    </ReactFlowProvider>
  );
}

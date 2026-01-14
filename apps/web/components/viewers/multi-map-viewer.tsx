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
  initialViewIndex?: number;
}

function MultiMapViewerContent({ map, views, embedded = false, initialViewIndex = 0 }: MultiMapViewerProps) {
  const reactFlowInstance = useReactFlow();
  const [activeViewIndex, setActiveViewIndex] = useState(initialViewIndex);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  const activeView = views[activeViewIndex];
  
  // Strip selection state from nodes when loading
  const cleanNodes = useMemo(() => {
    return (activeView.nodes as Node[]).map(({ selected, dragging, ...node }) => node);
  }, [activeView.nodes]);
  
  const [displayNodes, setDisplayNodes] = useState<Node[]>(cleanNodes);

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

  // Apply edge styles and strip selection state
  const styledEdges = useMemo(() => {
    return (activeView.edges as Edge[]).map((edge) => {
      const { selected, ...cleanEdge } = edge;
      const edgeType = cleanEdge.data?.edgeType || 'hierarchy';
      const { style, markerEnd } = getEdgeStyle(edgeType);
      return {
        ...cleanEdge,
        style: { ...cleanEdge.style, ...style },
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
      // Strip selection state from nodes when switching views
      const cleanViewNodes = (newView.nodes as Node[]).map(({ selected, dragging, ...node }) => node);
      setDisplayNodes(cleanViewNodes);
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

  // SVG Export function - captures the actual rendered canvas
  const handleExportSVG = useCallback(() => {
    try {
      const nodes = activeView.nodes as Node[];
      const edges = styledEdges;
      
      if (nodes.length === 0) {
        toast.error('No nodes to export');
        return;
      }

      // Calculate text width helper
      const measureText = (text: string, fontSize: number, fontWeight: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return text.length * fontSize * 0.6;
        ctx.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
        return ctx.measureText(text).width;
      };

      // Node dimensions based on type and label (dynamic width)
      const getNodeDimensions = (node: Node) => {
        const label = node.data.label || 'Untitled';
        const type = node.type || 'feature';
        
        let fontSize: number;
        let fontWeight: string;
        let paddingX: number;
        let height: number;
        let minWidth: number;
        let maxWidth: number;
        
        switch (type) {
          case 'product':
            fontSize = 14;
            fontWeight = '600';
            paddingX = 48; // color bar + padding
            height = 72;
            minWidth = 200;
            maxWidth = 280;
            break;
          case 'feature':
            fontSize = 14;
            fontWeight = '500';
            paddingX = 36; // left border + color indicator + padding
            height = 52;
            minWidth = 160;
            maxWidth = 240;
            break;
          case 'component':
          default:
            fontSize = 12;
            fontWeight = '500';
            paddingX = 32; // color indicator + padding
            height = 42;
            minWidth = 120;
            maxWidth = 180;
            break;
        }
        
        const textWidth = measureText(label, fontSize, fontWeight);
        const width = Math.min(maxWidth, Math.max(minWidth, textWidth + paddingX));
        
        return { width, height };
      };

      // Calculate bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodes.forEach(node => {
        const dims = getNodeDimensions(node);
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + dims.width);
        maxY = Math.max(maxY, node.position.y + dims.height);
      });
      
      const padding = 60;
      const svgWidth = maxX - minX + padding * 2;
      const svgHeight = maxY - minY + padding * 2;
      const offsetX = -minX + padding;
      const offsetY = -minY + padding;

      // Create SVG
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('xmlns', svgNS);
      svg.setAttribute('width', String(svgWidth));
      svg.setAttribute('height', String(svgHeight));
      svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

      // Defs for shadows and markers
      const defs = document.createElementNS(svgNS, 'defs');
      
      // Shadow filters for each node type
      ['product', 'feature', 'component'].forEach(type => {
        const filter = document.createElementNS(svgNS, 'filter');
        filter.setAttribute('id', `shadow-${type}`);
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
        
        const feDropShadow = document.createElementNS(svgNS, 'feDropShadow');
        feDropShadow.setAttribute('dx', '0');
        feDropShadow.setAttribute('dy', type === 'product' ? '4' : type === 'feature' ? '2' : '1');
        feDropShadow.setAttribute('stdDeviation', type === 'product' ? '8' : type === 'feature' ? '4' : '2');
        feDropShadow.setAttribute('flood-color', 'rgba(0,0,0,0.1)');
        filter.appendChild(feDropShadow);
        defs.appendChild(filter);
      });
      
      // Arrow markers
      const markerColors: Record<string, string> = {
        hierarchy: '#64748b',
        related: '#3b82f6',
        'depends-on': '#ef4444',
        optional: '#94a3b8',
      };
      
      Object.entries(markerColors).forEach(([type, color]) => {
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', `arrow-${type}`);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS(svgNS, 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', color);
        marker.appendChild(polygon);
        defs.appendChild(marker);
      });
      
      svg.appendChild(defs);

      // Background
      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('width', String(svgWidth));
      bg.setAttribute('height', String(svgHeight));
      bg.setAttribute('fill', '#f8fafc');
      svg.appendChild(bg);

      // Draw edges
      edges.forEach((edge) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const sourceDims = getNodeDimensions(sourceNode);
        const targetDims = getNodeDimensions(targetNode);

        const sx = sourceNode.position.x + offsetX + sourceDims.width / 2;
        const sy = sourceNode.position.y + offsetY + sourceDims.height;
        const tx = targetNode.position.x + offsetX + targetDims.width / 2;
        const ty = targetNode.position.y + offsetY;
        
        const edgeType = edge.data?.edgeType || 'hierarchy';
        const strokeColor = markerColors[edgeType] || '#64748b';
        
        // Smooth bezier curve
        const dy = ty - sy;
        const controlY = Math.max(30, Math.abs(dy) * 0.4);
        const d = `M ${sx} ${sy} C ${sx} ${sy + controlY}, ${tx} ${ty - controlY}, ${tx} ${ty}`;
        
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', edgeType === 'depends-on' ? '3' : '2');
        if (edgeType === 'related') path.setAttribute('stroke-dasharray', '5,5');
        if (edgeType === 'optional') path.setAttribute('stroke-dasharray', '2,2');
        path.setAttribute('marker-end', `url(#arrow-${edgeType})`);
        svg.appendChild(path);
      });

      // Draw nodes
      nodes.forEach((node) => {
        const dims = getNodeDimensions(node);
        const type = node.type || 'feature';
        const color = node.data.color || (type === 'product' ? '#10b981' : type === 'feature' ? '#3b82f6' : '#8b5cf6');
        const x = node.position.x + offsetX;
        const y = node.position.y + offsetY;
        
        const g = document.createElementNS(svgNS, 'g');

        if (type === 'product') {
          // Product node - rounded card with gradient header
          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', String(x));
          rect.setAttribute('y', String(y));
          rect.setAttribute('width', String(dims.width));
          rect.setAttribute('height', String(dims.height));
          rect.setAttribute('rx', '12');
          rect.setAttribute('fill', '#ffffff');
          rect.setAttribute('filter', 'url(#shadow-product)');
          g.appendChild(rect);
          
          // Color bar on left
          const colorBar = document.createElementNS(svgNS, 'rect');
          colorBar.setAttribute('x', String(x + 16));
          colorBar.setAttribute('y', String(y + 16));
          colorBar.setAttribute('width', '4');
          colorBar.setAttribute('height', String(dims.height - 32));
          colorBar.setAttribute('rx', '2');
          colorBar.setAttribute('fill', color);
          g.appendChild(colorBar);
          
          // Label
          const label = document.createElementNS(svgNS, 'text');
          label.setAttribute('x', String(x + 32));
          label.setAttribute('y', String(y + dims.height / 2 + 5));
          label.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
          label.setAttribute('font-size', '14');
          label.setAttribute('font-weight', '600');
          label.setAttribute('fill', '#111827');
          label.textContent = node.data.label || 'Untitled';
          g.appendChild(label);
          
        } else if (type === 'feature') {
          // Feature node - card with left accent border
          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', String(x));
          rect.setAttribute('y', String(y));
          rect.setAttribute('width', String(dims.width));
          rect.setAttribute('height', String(dims.height));
          rect.setAttribute('rx', '10');
          rect.setAttribute('fill', '#ffffff');
          rect.setAttribute('stroke', '#e5e7eb');
          rect.setAttribute('stroke-width', '1');
          rect.setAttribute('filter', 'url(#shadow-feature)');
          g.appendChild(rect);
          
          // Left accent border
          const leftBorder = document.createElementNS(svgNS, 'rect');
          leftBorder.setAttribute('x', String(x));
          leftBorder.setAttribute('y', String(y));
          leftBorder.setAttribute('width', '4');
          leftBorder.setAttribute('height', String(dims.height));
          leftBorder.setAttribute('rx', '2');
          leftBorder.setAttribute('fill', color);
          g.appendChild(leftBorder);
          
          // Color indicator
          const indicator = document.createElementNS(svgNS, 'rect');
          indicator.setAttribute('x', String(x + 12));
          indicator.setAttribute('y', String(y + (dims.height - 24) / 2));
          indicator.setAttribute('width', '3');
          indicator.setAttribute('height', '24');
          indicator.setAttribute('rx', '1.5');
          indicator.setAttribute('fill', color);
          g.appendChild(indicator);
          
          // Label
          const label = document.createElementNS(svgNS, 'text');
          label.setAttribute('x', String(x + 24));
          label.setAttribute('y', String(y + dims.height / 2 + 5));
          label.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
          label.setAttribute('font-size', '14');
          label.setAttribute('font-weight', '500');
          label.setAttribute('fill', '#111827');
          label.textContent = node.data.label || 'Untitled';
          g.appendChild(label);
          
        } else {
          // Component node - compact card
          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', String(x));
          rect.setAttribute('y', String(y));
          rect.setAttribute('width', String(dims.width));
          rect.setAttribute('height', String(dims.height));
          rect.setAttribute('rx', '8');
          rect.setAttribute('fill', '#ffffff');
          rect.setAttribute('stroke', '#f3f4f6');
          rect.setAttribute('stroke-width', '1');
          rect.setAttribute('filter', 'url(#shadow-component)');
          g.appendChild(rect);
          
          // Color indicator
          const indicator = document.createElementNS(svgNS, 'rect');
          indicator.setAttribute('x', String(x + 10));
          indicator.setAttribute('y', String(y + (dims.height - 18) / 2));
          indicator.setAttribute('width', '2');
          indicator.setAttribute('height', '18');
          indicator.setAttribute('rx', '1');
          indicator.setAttribute('fill', color);
          g.appendChild(indicator);
          
          // Label
          const label = document.createElementNS(svgNS, 'text');
          label.setAttribute('x', String(x + 20));
          label.setAttribute('y', String(y + dims.height / 2 + 4));
          label.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
          label.setAttribute('font-size', '12');
          label.setAttribute('font-weight', '500');
          label.setAttribute('fill', '#374151');
          label.textContent = node.data.label || 'Untitled';
          g.appendChild(label);
        }

        // Status indicator (only for non-stable)
        if (node.data.status && node.data.status !== 'stable') {
          const statusColors: Record<string, string> = {
            beta: '#3b82f6',
            experimental: '#f59e0b',
            deprecated: '#ef4444',
          };
          const circle = document.createElementNS(svgNS, 'circle');
          circle.setAttribute('cx', String(x + dims.width - 12));
          circle.setAttribute('cy', String(y + 12));
          circle.setAttribute('r', '4');
          circle.setAttribute('fill', statusColors[node.data.status] || '#6b7280');
          g.appendChild(circle);
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
  }, [activeView, styledEdges, map.title]);

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

export function MultiMapViewer({ map, views, embedded = false, initialViewIndex = 0 }: MultiMapViewerProps) {
  return (
    <ReactFlowProvider>
      <MultiMapViewerContent map={map} views={views} embedded={embedded} initialViewIndex={initialViewIndex} />
    </ReactFlowProvider>
  );
}

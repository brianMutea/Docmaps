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
import { Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Map as MapType } from '@docmaps/database';
import { ViewerHeader } from '../viewer-header';
import { NodeDetailPanel } from '../node-detail-panel';
import { FloatingSidebar } from '../floating-sidebar';
import { ProductNode } from '../nodes/product-node';
import { FeatureNode } from '../nodes/feature-node';
import { ComponentNode } from '../nodes/component-node';

interface SingleMapViewerProps {
  map: MapType;
  embedded?: boolean;
}

function SingleMapViewerContent({ map, embedded = false }: SingleMapViewerProps) {
  const reactFlowInstance = useReactFlow();
  const [displayNodes, setDisplayNodes] = useState<Node[]>(map.nodes as Node[]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      product: ProductNode,
      feature: FeatureNode,
      component: ComponentNode,
    }),
    []
  );

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

  const styledEdges = useMemo(() => {
    return (map.edges as Edge[]).map((edge) => {
      const edgeType = edge.data?.edgeType || 'hierarchy';
      const { style, markerEnd } = getEdgeStyle(edgeType);
      return {
        ...edge,
        style: { ...edge.style, ...style },
        markerEnd: markerEnd,
      };
    });
  }, [map.edges, getEdgeStyle]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowSidebar(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      const baseNodes = map.nodes as Node[];
      
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

      if (matchingNodes.length > 0 && reactFlowInstance) {
        const firstMatch = matchingNodes[0];
        reactFlowInstance.setCenter(
          firstMatch.position.x + 100,
          firstMatch.position.y + 50,
          { zoom: 1.5, duration: 800 }
        );
      }
    },
    [map.nodes, reactFlowInstance]
  );

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn({ duration: 300 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut({ duration: 300 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ duration: 500, padding: 0.2 });
  }, [reactFlowInstance]);

  const nodeCount = (map.nodes as Node[]).length;

  // SVG Export function
  const handleExportSVG = useCallback(() => {
    try {
      const nodes = map.nodes as Node[];
      const edges = map.edges as Edge[];
      
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
      const fileName = map.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      link.download = `${fileName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('SVG exported successfully');
    } catch (error) {
      console.error('SVG export error:', error);
      toast.error('Failed to export SVG');
    }
  }, [map]);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <ViewerHeader map={map} embedded={embedded} onExportSVG={handleExportSVG} />

      <div className="flex-1 relative overflow-hidden">
        {/* Floating Controls - Top Left */}
        {!embedded && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {/* Quick Search Toggle */}
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
              <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-black/10 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Quick Search Input */}
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
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
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
            
            {/* Node Count Badge */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-3 py-2">
              <span className="text-xs font-medium text-gray-600">
                {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
              </span>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="h-full">
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
              nodes={map.nodes as Node[]}
              edges={map.edges as Edge[]}
              onNodeNavigate={navigateToNode}
            />
          </FloatingSidebar>
        )}
      </div>
    </div>
  );
}

export function SingleMapViewer({ map, embedded = false }: SingleMapViewerProps) {
  return (
    <ReactFlowProvider>
      <SingleMapViewerContent map={map} embedded={embedded} />
    </ReactFlowProvider>
  );
}

'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  ConnectionLineType,
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
import { TextBlockNode } from '../nodes/text-block-node';
import { GroupNode } from '../nodes/group-node';
import { 
  HierarchyEdge, 
  DependencyEdge, 
  AlternativeEdge, 
  IntegrationEdge, 
  ExtensionEdge,
  GroupingEdge,
} from '../edges';
import { exportToSVG } from '@docmaps/graph';

interface SingleMapViewerProps {
  map: MapType;
  embedded?: boolean;
}

function SingleMapViewerContent({ map, embedded = false }: SingleMapViewerProps) {
  const reactFlowInstance = useReactFlow();
  
  // Strip selection state from nodes when loading
  const cleanNodes = useMemo(() => {
    return (map.nodes as Node[]).map(({ selected, dragging, ...node }) => node);
  }, [map.nodes]);
  
  const [displayNodes, setDisplayNodes] = useState<Node[]>(cleanNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);

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

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      hierarchy: HierarchyEdge,
      dependency: DependencyEdge,
      alternative: AlternativeEdge,
      integration: IntegrationEdge,
      extension: ExtensionEdge,
      grouping: GroupingEdge,
    }),
    []
  );

  const getEdgeStyle = useCallback((edgeType: string) => {
    const markerEnd = { type: MarkerType.ArrowClosed };
    const markerStart = { type: MarkerType.ArrowClosed };

    switch (edgeType) {
      case 'hierarchy':
        return {
          style: { strokeWidth: 2, stroke: '#64748b' },
          markerEnd: { ...markerEnd, color: '#64748b' },
        };
      case 'dependency':
        return {
          style: { strokeWidth: 2, stroke: '#3b82f6', strokeDasharray: '5,5' },
          markerEnd: { ...markerEnd, color: '#3b82f6' },
        };
      case 'alternative':
        return {
          style: { strokeWidth: 2, stroke: '#8b5cf6', strokeDasharray: '2,4' },
          markerEnd: { ...markerEnd, color: '#8b5cf6' },
        };
      case 'integration':
        return {
          style: { strokeWidth: 2, stroke: '#10b981' },
          markerEnd: { ...markerEnd, color: '#10b981' },
          markerStart: { ...markerStart, color: '#10b981' },
        };
      case 'extension':
        return {
          style: { strokeWidth: 3, stroke: '#f59e0b' },
          markerEnd: { ...markerEnd, color: '#f59e0b' },
        };
      default:
        return {
          style: { strokeWidth: 2, stroke: '#64748b' },
          markerEnd: { ...markerEnd, color: '#64748b' },
        };
    }
  }, []);

  // Apply edge styles and strip selection state
  const styledEdges = useMemo(() => {
    return (map.edges as Edge[]).map((edge) => {
      const { selected, ...cleanEdge } = edge;
      const edgeType = cleanEdge.data?.edgeType || cleanEdge.type || 'hierarchy';
      const { style } = getEdgeStyle(edgeType);
      
      // Preserve markerEnd and markerStart from the saved edge data
      // These are already set correctly when the edge was created/updated in the editor
      return {
        ...cleanEdge,
        type: edgeType,
        style: { ...cleanEdge.style, ...style },
        // Keep the original markers from the database
        markerEnd: cleanEdge.markerEnd,
        markerStart: cleanEdge.markerStart,
      };
    });
  }, [map.edges, getEdgeStyle]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Don't open sidebar for textBlock nodes - content is visible inline
    if (node.type === 'textBlock') {
      return;
    }
    setSelectedNode(node);
    setShowSidebar(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowQuickSearch(false);
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

  // SVG Export function using professional exporter
  const handleExportSVG = useCallback(() => {
    try {
      const nodes = map.nodes as Node[];
      const edges = map.edges as Edge[];
      
      if (nodes.length === 0) {
        toast.error('No nodes to export');
        return;
      }

      exportToSVG(nodes, edges, {
        title: map.title,
      });

      toast.success('SVG exported successfully');
    } catch (error) {
      console.error('SVG export error:', error);
      toast.error('Failed to export SVG');
    }
  }, [map]);

  return (
    <div className="flex h-screen flex-col bg-neutral-900">
      <ViewerHeader map={map} embedded={embedded} onExportSVG={handleExportSVG} />

      <div className="flex-1 relative overflow-hidden">
        {/* Floating Controls - Top Left */}
        {!embedded && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {/* Quick Search Toggle */}
            <button
              onClick={() => setShowQuickSearch(!showQuickSearch)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg border transition-all duration-200 ${
                showQuickSearch
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-neutral-800/95 backdrop-blur-sm text-neutral-200 border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600'
              }`}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-black/20 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Quick Search Input */}
            {showQuickSearch && (
              <div className="bg-neutral-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-700 p-3 w-64 sm:w-72 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search nodes..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-neutral-900 text-white border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 placeholder:text-neutral-500"
                />
                {searchQuery && (
                  <p className="mt-2 text-xs text-neutral-400">
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
            <div className="flex items-center bg-neutral-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-700 overflow-hidden">
              <button
                onClick={handleZoomOut}
                className="p-2 sm:p-2.5 text-neutral-200 hover:bg-neutral-700 transition-colors border-r border-neutral-700"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 sm:p-2.5 text-neutral-200 hover:bg-neutral-700 transition-colors border-r border-neutral-700"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleFitView}
                className="p-2 sm:p-2.5 text-neutral-200 hover:bg-neutral-700 transition-colors"
                title="Fit to view"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Node Count Badge - hidden on very small screens */}
            <div className="hidden sm:flex bg-neutral-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-700 px-3 py-2">
              <span className="text-xs font-medium text-neutral-300">
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
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            connectionLineType={ConnectionLineType.SmoothStep}
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
              color="#404040"
            />
            {!embedded && (
              <MiniMap 
                nodeStrokeWidth={3}
                pannable
                zoomable
                className="!bg-neutral-800/90 !border !border-neutral-700 !rounded-xl !shadow-lg"
                maskColor="rgba(0, 0, 0, 0.3)"
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
        {!embedded && selectedNode && (
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

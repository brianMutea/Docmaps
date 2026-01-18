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
import { Search, ZoomIn, ZoomOut, Maximize2, Layers, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Map as MapType, ProductView } from '@docmaps/database';
import { ViewerHeader } from '../viewer-header';
import { NodeDetailPanel } from '../node-detail-panel';
import { FloatingSidebar } from '../floating-sidebar';
import { ProductNode } from '../nodes/product-node';
import { FeatureNode } from '../nodes/feature-node';
import { ComponentNode } from '../nodes/component-node';
import { TextBlockNode } from '../nodes/text-block-node';
import { exportToSVG } from '@docmaps/graph';

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
  const [showViewSelector, setShowViewSelector] = useState(false);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  const activeView = views[activeViewIndex];
  
  const [displayNodes, setDisplayNodes] = useState<Node[]>(() => {
    // Deep clone initial nodes
    const nodes = views[initialViewIndex]?.nodes as Node[] || [];
    return JSON.parse(JSON.stringify(nodes.map(({ selected, dragging, ...node }) => node)));
  });

  // Register custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      product: ProductNode,
      feature: FeatureNode,
      component: ComponentNode,
      textBlock: TextBlockNode,
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
      // Deep clone nodes when switching views to prevent reference issues
      const cleanViewNodes = JSON.parse(JSON.stringify(
        (newView.nodes as Node[]).map(({ selected, dragging, ...node }) => node)
      ));
      setDisplayNodes(cleanViewNodes);
      setSelectedNode(null);
      setSearchQuery('');
      setIsViewTransitioning(false);
      
      // Fit view after switching
      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
        }, 50);
      }
    }, 150);
  }, [views, activeViewIndex, reactFlowInstance]);

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
    // Don't open sidebar for textBlock nodes - content is visible inline
    if (node.type === 'textBlock') {
      return;
    }
    setSelectedNode(node);
    setShowSidebar(true);
  }, []);

  // Handle pane click (deselect and close dropdowns)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowQuickSearch(false);
    setShowViewSelector(false);
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

  // SVG Export function using professional exporter
  const handleExportSVG = useCallback(() => {
    try {
      const nodes = activeView.nodes as Node[];
      const edges = activeView.edges as Edge[];
      
      if (nodes.length === 0) {
        toast.error('No nodes to export');
        return;
      }

      exportToSVG(nodes, edges, {
        title: `${map.title}-${activeView.title}`,
      });

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
          <div className="hidden lg:flex flex-col w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200">
            {/* Sidebar Header */}
            <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Walkthrough</h3>
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

        {/* Mobile/Tablet View Selector - Professional Bottom Sheet Style */}
        {!embedded && views.length > 1 && (
          <div className="lg:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 p-1.5">
              {/* Previous button */}
              <button
                onClick={goToPrevView}
                disabled={activeViewIndex === 0}
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                aria-label="Previous view"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              {/* View selector dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowViewSelector(!showViewSelector)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all min-w-[140px] justify-center"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-900 text-white text-xs font-bold">
                    {activeViewIndex + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">
                    {activeView.title}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showViewSelector ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showViewSelector && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setShowViewSelector(false)}
                      onTouchStart={() => setShowViewSelector(false)}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-[70] animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-[50vh] overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select View</p>
                      </div>
                      {views.map((view, index) => (
                        <button
                          key={view.id}
                          onClick={() => {
                            handleViewChange(view.id);
                            setShowViewSelector(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                            view.id === activeView.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                            view.id === activeView.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium truncate">{view.title}</span>
                          {view.id === activeView.id && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Next button */}
              <button
                onClick={goToNextView}
                disabled={activeViewIndex === views.length - 1}
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                aria-label="Next view"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Controls - Top Left (Search) */}
        {!embedded && (
          <div className="absolute top-4 left-4 lg:left-[calc(16rem+1rem)] z-10 flex flex-col gap-2">
            <button
              onClick={() => setShowQuickSearch(!showQuickSearch)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg border transition-all duration-200 ${
                showQuickSearch
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white/95 backdrop-blur-sm text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300'
              }`}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Search</span>
            </button>

            {showQuickSearch && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 w-64 sm:w-72 animate-in slide-in-from-top-2 duration-200">
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
          <div className="absolute bottom-4 left-4 lg:left-[calc(16rem+1rem)] z-10 flex items-center gap-2">
            <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={handleZoomOut}
                className="p-2 sm:p-2.5 text-gray-600 hover:bg-gray-100 transition-colors border-r border-gray-200"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 sm:p-2.5 text-gray-600 hover:bg-gray-100 transition-colors border-r border-gray-200"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleFitView}
                className="p-2 sm:p-2.5 text-gray-600 hover:bg-gray-100 transition-colors"
                title="Fit to view"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="hidden sm:flex bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-3 py-2">
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

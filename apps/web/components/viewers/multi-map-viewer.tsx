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
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Map as MapType, ProductView } from '@docmaps/database';
import { ViewSelector } from '@docmaps/ui';
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

  // Handle view change
  const handleViewChange = useCallback((viewId: string) => {
    const newIndex = views.findIndex(v => v.id === viewId);
    if (newIndex === -1 || newIndex === activeViewIndex) return;

    setActiveViewIndex(newIndex);
    const newView = views[newIndex];
    setDisplayNodes(newView.nodes as Node[]);
    setSelectedNode(null);
    setSearchQuery('');
  }, [views, activeViewIndex]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowSidebar(true);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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

  // Format views for ViewSelector
  const viewSelectorItems = useMemo(() => 
    views.map(v => ({ id: v.id, title: v.title, slug: v.slug })),
    [views]
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <ViewerHeader 
        map={map} 
        currentView={activeView} 
        embedded={embedded} 
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* View Selector Sidebar */}
        {!embedded && (
          <ViewSelector
            views={viewSelectorItems}
            activeViewId={activeView.id}
            onViewChange={handleViewChange}
            title="Views"
            className="hidden sm:block w-56 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200"
          />
        )}

        {/* Mobile View Selector */}
        {!embedded && views.length > 1 && (
          <div className="sm:hidden absolute top-3 left-3 z-10">
            <select
              value={activeView.id}
              onChange={(e) => handleViewChange(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white/95 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-700 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {views.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={displayNodes}
            edges={styledEdges}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ maxZoom: 1.0, minZoom: 0.5 }}
          >
            <Background />
            <Controls />
            {!embedded && <MiniMap />}
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
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              onNodeNavigate={navigateToNode}
              onClose={() => {
                setShowSidebar(false);
                setSelectedNode(null);
              }}
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

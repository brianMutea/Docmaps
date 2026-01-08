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
import { ExternalLink, Share2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Logo } from '@docmaps/ui';
import type { Map as MapType } from '@docmaps/database';
import { ProductNode } from './nodes/product-node';
import { FeatureNode } from './nodes/feature-node';
import { ComponentNode } from './nodes/component-node';

interface MapViewerProps {
  map: MapType;
  embedded?: boolean;
}

export function MapViewer({ map, embedded = false }: MapViewerProps) {
  return (
    <ReactFlowProvider>
      <MapViewerContent map={map} embedded={embedded} />
    </ReactFlowProvider>
  );
}

function MapViewerContent({ map, embedded = false }: MapViewerProps) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>(map.nodes as Node[]);
  const [edges] = useState<Edge[]>(map.edges as Edge[]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Get breadcrumb path for selected node
  const getBreadcrumbPath = useCallback((nodeId: string): Node[] => {
    const path: Node[] = [];
    let currentId: string | null = nodeId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      
      const node = nodes.find(n => n.id === currentId);
      if (!node) break;
      
      path.unshift(node);
      
      // Find parent edge
      const parentEdge = edges.find(e => e.target === currentId);
      currentId = parentEdge ? parentEdge.source : null;
    }

    return path;
  }, [nodes, edges]);

  // Navigate to node in breadcrumb
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
      if (!query.trim()) {
        // Reset all nodes to normal
        setNodes(map.nodes as Node[]);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const matchingNodes: Node[] = [];
      
      const updatedNodes = (map.nodes as Node[]).map((node) => {
        const matches = node.data.label?.toLowerCase().includes(lowerQuery);
        if (matches) {
          matchingNodes.push(node);
        }
        return {
          ...node,
          style: {
            ...node.style,
            opacity: matches ? 1 : 0.3,
            boxShadow: matches ? '0 0 0 2px #3b82f6' : undefined,
          },
        };
      });
      
      setNodes(updatedNodes);

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
    [map.nodes, reactFlowInstance]
  );

  // Handle share
  const handleShare = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!', {
        description: 'Share this map with others',
      });
    }
  }, []);

  // Handle embed code copy
  const handleCopyEmbed = useCallback(() => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${map.slug}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      toast.success('Embed code copied!', {
        description: 'Paste this code into your website',
      });
    }
  }, [map.slug]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header - Hide in embedded mode */}
      {!embedded && (
        <header className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-lg font-bold text-gray-900">DocMaps</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{map.title}</h1>
                <p className="text-sm text-gray-600">{map.product_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {map.product_url && (
                <a
                  href={map.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Docs
                </a>
              )}
              <button
                onClick={handleCopyEmbed}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Embed
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className={`flex flex-1 overflow-hidden ${embedded ? 'flex-row' : ''}`}>
        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ maxZoom: 0.7, minZoom: 0.7 }}
          >
            <Background />
            <Controls />
            {!embedded && <MiniMap />}
          </ReactFlow>
        </div>

        {/* Sidebar - Hide in embedded mode */}
        {!embedded && (
          <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          {/* Search */}
          <div className="border-b border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search nodes..."
                className="w-full rounded-md border border-gray-300 pl-10 pr-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {selectedNode && (
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center gap-1 text-sm overflow-x-auto">
                {getBreadcrumbPath(selectedNode.id).map((node, index, array) => (
                  <div key={node.id} className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => navigateToNode(node)}
                      className={`px-2 py-1 rounded hover:bg-gray-200 transition-colors ${
                        node.id === selectedNode.id
                          ? 'font-semibold text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title={node.data.label}
                    >
                      {node.data.label}
                    </button>
                    {index < array.length - 1 && (
                      <span className="text-gray-400">/</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Node Details */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {selectedNode.data.icon && (
                    <span className="text-2xl">{selectedNode.data.icon}</span>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedNode.data.label}
                    </h2>
                    {selectedNode.data.status && (
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          selectedNode.data.status === 'stable'
                            ? 'bg-green-100 text-green-800'
                            : selectedNode.data.status === 'beta'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedNode.data.status === 'deprecated'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedNode.data.status}
                      </span>
                    )}
                  </div>
                </div>

                {selectedNode.data.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <div
                      className="prose prose-sm max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: selectedNode.data.description }}
                    />
                  </div>
                )}

                {selectedNode.data.tags && selectedNode.data.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.data.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.docUrl && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Documentation</h3>
                    <a
                      href={selectedNode.data.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Documentation
                    </a>
                  </div>
                )}

                {selectedNode.data.additionalLinks &&
                  selectedNode.data.additionalLinks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Additional Links
                      </h3>
                      <div className="space-y-2">
                        {selectedNode.data.additionalLinks.map(
                          (link: { title: string; url: string }, index: number) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {link.title || link.url}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Click any node to view details
                </h3>
                <p className="text-xs text-gray-600">
                  Explore the map by clicking on nodes to see their information
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

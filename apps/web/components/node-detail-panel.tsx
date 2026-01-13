'use client';

import { useMemo } from 'react';
import { Search, ExternalLink, Tag, FileText, Link2, ChevronRight, Sparkles, Layers } from 'lucide-react';
import type { Node, Edge } from 'reactflow';

interface NodeDetailPanelProps {
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
  onNodeNavigate: (node: Node) => void;
  onViewNavigate?: (slug: string) => void;
}

export function NodeDetailPanel({
  selectedNode,
  nodes,
  edges,
  onNodeNavigate,
  onViewNavigate,
}: NodeDetailPanelProps) {
  const breadcrumbPath = useMemo(() => {
    if (!selectedNode) return [];
    
    const path: Node[] = [];
    let currentId: string | null = selectedNode.id;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = nodes.find(n => n.id === currentId);
      if (!node) break;
      path.unshift(node);
      const parentEdge = edges.find(e => e.target === currentId);
      currentId = parentEdge ? parentEdge.source : null;
    }

    return path;
  }, [selectedNode, nodes, edges]);

  const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    stable: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    beta: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    deprecated: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    experimental: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {selectedNode ? 'Details' : 'Explore'}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedNode ? (
          <div className="p-5">
            {/* Breadcrumb Navigation */}
            {breadcrumbPath.length > 1 && (
              <div className="mb-6 pb-5 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Path</p>
                <div className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide py-1">
                  {breadcrumbPath.map((node, index, array) => (
                    <div key={node.id} className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onNodeNavigate(node)}
                        className={`px-2.5 py-1.5 rounded-lg transition-all ${
                          node.id === selectedNode.id
                            ? 'font-semibold text-blue-700 bg-blue-50 border border-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title={node.data.label}
                      >
                        {node.data.label}
                      </button>
                      {index < array.length - 1 && (
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Node Details */}
            <div className="space-y-6">
              {/* Header with icon and title */}
              <div className="flex items-start gap-4">
                {selectedNode.data.icon && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-4xl shadow-sm">
                    {selectedNode.data.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {selectedNode.data.label}
                  </h2>
                  {selectedNode.data.status && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${
                        statusConfig[selectedNode.data.status]?.bg || 'bg-gray-50'
                      } ${statusConfig[selectedNode.data.status]?.text || 'text-gray-700'} ${
                        statusConfig[selectedNode.data.status]?.border || 'border-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedNode.data.status]?.dot || 'bg-gray-500'}`} />
                      {selectedNode.data.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedNode.data.description && (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Description</h3>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedNode.data.description }}
                  />
                </div>
              )}

              {/* Tags */}
              {selectedNode.data.tags && selectedNode.data.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.data.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm hover:shadow transition-shadow"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentation Link */}
              {selectedNode.data.docUrl && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Documentation</h3>
                  </div>
                  <a
                    href={selectedNode.data.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 px-4 py-3.5 rounded-xl transition-all border border-blue-100 hover:border-blue-200 shadow-sm hover:shadow group"
                  >
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    View Documentation
                  </a>
                </div>
              )}

              {/* Additional Links */}
              {selectedNode.data.additionalLinks && selectedNode.data.additionalLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Additional Links</h3>
                  </div>
                  <div className="space-y-2">
                    {selectedNode.data.additionalLinks.map(
                      (link: { title: string; url: string }, index: number) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all border border-gray-100 hover:border-blue-200 group"
                        >
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 group-hover:text-blue-500" />
                          <span className="truncate">{link.title || link.url}</span>
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Refer to View */}
              {selectedNode.data.referTo && onViewNavigate && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Reference</h3>
                  </div>
                  <button
                    onClick={() => onViewNavigate(selectedNode.data.referTo.slug)}
                    className="w-full flex items-center gap-3 text-sm font-medium text-indigo-700 hover:text-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-4 py-3.5 rounded-xl transition-all border border-indigo-100 hover:border-indigo-200 shadow-sm hover:shadow group"
                  >
                    <Layers className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Go to {selectedNode.data.referTo.title}</span>
                    <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200 shadow-sm">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Node</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
              Click on any node in the map to view its details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

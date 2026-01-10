'use client';

import { useCallback, useMemo } from 'react';
import { Search, X, ExternalLink, Tag, FileText, Link2, ChevronRight } from 'lucide-react';
import type { Node, Edge } from 'reactflow';

interface NodeDetailPanelProps {
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNodeNavigate: (node: Node) => void;
  onClose: () => void;
}

export function NodeDetailPanel({
  selectedNode,
  nodes,
  edges,
  searchQuery,
  onSearchChange,
  onNodeNavigate,
  onClose,
}: NodeDetailPanelProps) {
  // Get breadcrumb path for selected node
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

  // Get search results count
  const searchResultsCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const lowerQuery = searchQuery.toLowerCase();
    return nodes.filter(n => n.data.label?.toLowerCase().includes(lowerQuery)).length;
  }, [searchQuery, nodes]);

  const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
    stable: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    beta: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    deprecated: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    experimental: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  };

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {selectedNode ? 'Node Details' : 'Search'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/80 transition-colors text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search nodes..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-gray-500">
              {searchResultsCount} {searchResultsCount === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {selectedNode ? (
          <>
            {/* Breadcrumb Navigation */}
            {breadcrumbPath.length > 1 && (
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide">
                  {breadcrumbPath.map((node, index, array) => (
                    <div key={node.id} className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onNodeNavigate(node)}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          node.id === selectedNode.id
                            ? 'font-semibold text-blue-700 bg-blue-50'
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
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-3xl shadow-sm">
                    {selectedNode.data.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {selectedNode.data.label}
                  </h2>
                  {selectedNode.data.status && (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                        statusConfig[selectedNode.data.status]?.bg || 'bg-gray-50'
                      } ${statusConfig[selectedNode.data.status]?.text || 'text-gray-700'} ${
                        statusConfig[selectedNode.data.status]?.border || 'border-gray-200'
                      }`}
                    >
                      {selectedNode.data.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedNode.data.description && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
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
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm"
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
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl transition-all border border-blue-100"
                  >
                    <ExternalLink className="h-4 w-4" />
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
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all border border-gray-100 hover:border-blue-200"
                        >
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{link.title || link.url}</span>
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Node</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Click on any node in the map to view its details, or use the search to find specific nodes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

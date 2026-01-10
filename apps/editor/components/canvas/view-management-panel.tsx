'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Pencil, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ConfirmDialog } from '@docmaps/ui';
import { generateSlug } from '@/lib/utils/validation';
import type { ProductView } from '@docmaps/database';

interface ViewManagementPanelProps {
  views: ProductView[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  onAddView: (title: string, slug: string) => Promise<void>;
  onUpdateView: (viewId: string, title: string, slug: string) => Promise<void>;
  onDeleteView: (viewId: string) => Promise<void>;
  onReorderViews: (viewId: string, direction: 'up' | 'down') => Promise<void>;
  disabled?: boolean;
}

interface EditingState {
  viewId: string;
  title: string;
  slug: string;
}

export function ViewManagementPanel({
  views,
  activeViewId,
  onViewChange,
  onAddView,
  onUpdateView,
  onDeleteView,
  onReorderViews,
  disabled = false,
}: ViewManagementPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newViewTitle, setNewViewTitle] = useState('');
  const [newViewSlug, setNewViewSlug] = useState('');
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateSlug = useCallback((slug: string, excludeViewId?: string): boolean => {
    const existingSlugs = views
      .filter(v => v.id !== excludeViewId)
      .map(v => v.slug);
    return !existingSlugs.includes(slug);
  }, [views]);

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewViewTitle('');
    setNewViewSlug('');
    setError(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewViewTitle('');
    setNewViewSlug('');
    setError(null);
  };

  const handleTitleChange = (value: string) => {
    setNewViewTitle(value);
    setNewViewSlug(generateSlug(value));
  };

  const handleAddView = async () => {
    if (!newViewTitle.trim()) {
      setError('Title is required');
      return;
    }
    if (!newViewSlug.trim()) {
      setError('Slug is required');
      return;
    }
    if (!validateSlug(newViewSlug.trim())) {
      setError('Slug must be unique');
      return;
    }
    if (views.length >= 10) {
      setError('Maximum 10 views allowed');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onAddView(newViewTitle.trim(), newViewSlug.trim());
      handleCancelAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add view');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (view: ProductView) => {
    setEditing({ viewId: view.id, title: view.title, slug: view.slug });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    
    if (!editing.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!editing.slug.trim()) {
      setError('Slug is required');
      return;
    }
    if (!validateSlug(editing.slug.trim(), editing.viewId)) {
      setError('Slug must be unique');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onUpdateView(editing.viewId, editing.title.trim(), editing.slug.trim());
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update view');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteView = async (viewId: string) => {
    if (views.length <= 1) {
      setError('Cannot delete the last view');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onDeleteView(viewId);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete view');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (viewId: string, direction: 'up' | 'down') => {
    setLoading(true);
    try {
      await onReorderViews(viewId, direction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder views');
    } finally {
      setLoading(false);
    }
  };

  const viewToDelete = deleteConfirm ? views.find(v => v.id === deleteConfirm) : null;

  return (
    <div className="w-56 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Views</h3>
          <button
            onClick={handleStartAdd}
            disabled={disabled || loading || views.length >= 10 || isAdding}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add view"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Add new view form */}
        {isAdding && (
          <div className="p-2 bg-white border border-blue-200 rounded-lg space-y-2">
            <input
              type="text"
              value={newViewTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="View title"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              autoFocus
              disabled={loading}
            />
            <input
              type="text"
              value={newViewSlug}
              onChange={(e) => setNewViewSlug(generateSlug(e.target.value))}
              placeholder="view-slug"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none font-mono text-xs"
              disabled={loading}
            />
            <div className="flex gap-1">
              <button
                onClick={handleAddView}
                disabled={loading}
                className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={handleCancelAdd}
                disabled={loading}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* View list */}
        {views.map((view, index) => (
          <div
            key={view.id}
            className={`group relative rounded-lg transition-colors ${
              activeViewId === view.id
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            {editing?.viewId === view.id ? (
              <div className="p-2 space-y-2">
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  autoFocus
                  disabled={loading}
                />
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: generateSlug(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none font-mono text-xs"
                  disabled={loading}
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={() => onViewChange(view.id)}
                  disabled={disabled || loading}
                  className="flex-1 p-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{view.title}</p>
                      <p className="text-xs text-gray-500 truncate font-mono">{view.slug}</p>
                    </div>
                  </div>
                </button>
                
                <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReorder(view.id, 'up')}
                    disabled={disabled || loading || index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(view.id, 'down')}
                    disabled={disabled || loading || index === views.length - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(view)}
                    disabled={disabled || loading}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit view"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(view.id)}
                    disabled={disabled || loading || views.length <= 1}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                    title="Delete view"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 text-center">
          {views.length}/10 views
        </p>
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete View"
        description={
          viewToDelete
            ? `Are you sure you want to delete "${viewToDelete.title}"? All nodes and edges in this view will be permanently removed.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm && handleDeleteView(deleteConfirm)}
        variant="destructive"
      />
    </div>
  );
}

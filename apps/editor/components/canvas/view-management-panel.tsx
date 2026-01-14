'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Pencil, Check, X, ChevronUp, ChevronDown, Layers } from 'lucide-react';
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
    const existingSlugs = views.filter(v => v.id !== excludeViewId).map(v => v.slug);
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
    if (!newViewTitle.trim()) { setError('Title is required'); return; }
    if (!newViewSlug.trim()) { setError('Slug is required'); return; }
    if (!validateSlug(newViewSlug.trim())) { setError('Slug must be unique'); return; }
    if (views.length >= 10) { setError('Maximum 10 views allowed'); return; }

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
    if (!editing.title.trim()) { setError('Title is required'); return; }
    if (!editing.slug.trim()) { setError('Slug is required'); return; }
    if (!validateSlug(editing.slug.trim(), editing.viewId)) { setError('Slug must be unique'); return; }

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
    if (views.length <= 1) { setError('Cannot delete the last view'); return; }

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
    <div className="w-full sm:w-60 border-b sm:border-b-0 sm:border-r border-gray-200 bg-gray-50/50 flex flex-col sm:h-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Views</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full sm:hidden">
              {views.length}/10
            </span>
          </div>
          <button
            onClick={handleStartAdd}
            disabled={disabled || loading || views.length >= 10 || isAdding}
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Add view"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{error}</p>
        )}
      </div>

      {/* View List - Horizontal scroll on mobile, vertical on desktop */}
      <div className="flex-1 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto p-2 sm:space-y-1.5">
        <div className="flex sm:flex-col gap-2 sm:gap-1.5 min-w-max sm:min-w-0">
          {/* Add New View Form */}
          {isAdding && (
            <div className="p-3 bg-white border-2 border-blue-200 rounded-xl space-y-2 shadow-sm min-w-[200px] sm:min-w-0">
              <input
                type="text"
                value={newViewTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="View title"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                autoFocus
                disabled={loading}
              />
              <input
                type="text"
                value={newViewSlug}
                onChange={(e) => setNewViewSlug(generateSlug(e.target.value))}
                placeholder="view-slug"
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-600"
                disabled={loading}
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddView}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Adding...' : 'Add View'}
                </button>
                <button
                  onClick={handleCancelAdd}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* View Items */}
          {views.map((view, index) => (
            <ViewItem
              key={view.id}
              view={view}
              index={index}
              totalViews={views.length}
              isActive={activeViewId === view.id}
              isEditing={editing?.viewId === view.id}
              editingState={editing}
              disabled={disabled}
              loading={loading}
              onSelect={() => onViewChange(view.id)}
              onStartEdit={() => handleStartEdit(view)}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onDelete={() => setDeleteConfirm(view.id)}
              onReorder={handleReorder}
              onEditChange={(field, value) => editing && setEditing({ ...editing, [field]: value })}
            />
          ))}
        </div>
      </div>

      {/* Footer - Hidden on mobile */}
      <div className="hidden sm:block px-4 py-2.5 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{views.length} of 10 views</p>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i < views.length ? 'bg-blue-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete View"
        description={viewToDelete ? `Are you sure you want to delete "${viewToDelete.title}"? All nodes and edges in this view will be permanently removed.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm && handleDeleteView(deleteConfirm)}
        variant="destructive"
      />
    </div>
  );
}

interface ViewItemProps {
  view: ProductView;
  index: number;
  totalViews: number;
  isActive: boolean;
  isEditing: boolean;
  editingState: EditingState | null;
  disabled: boolean;
  loading: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onReorder: (viewId: string, direction: 'up' | 'down') => void;
  onEditChange: (field: 'title' | 'slug', value: string) => void;
}

function ViewItem({
  view,
  index,
  totalViews,
  isActive,
  isEditing,
  editingState,
  disabled,
  loading,
  onSelect,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onReorder,
  onEditChange,
}: ViewItemProps) {
  if (isEditing && editingState) {
    return (
      <div className="p-3 bg-white border-2 border-blue-200 rounded-xl space-y-2 shadow-sm min-w-[200px] sm:min-w-0">
        <input
          type="text"
          value={editingState.title}
          onChange={(e) => onEditChange('title', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          autoFocus
          disabled={loading}
        />
        <input
          type="text"
          value={editingState.slug}
          onChange={(e) => onEditChange('slug', generateSlug(e.target.value))}
          className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-600"
          disabled={loading}
        />
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={onSaveEdit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Check className="h-3.5 w-3.5" /> Save
          </button>
          <button
            onClick={onCancelEdit}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-xl transition-all min-w-[140px] sm:min-w-0 ${
        isActive
          ? 'bg-blue-50 border-2 border-blue-300 shadow-sm'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onSelect}
        disabled={disabled || loading}
        className="w-full p-2.5 sm:p-3 text-left"
      >
        <div className="flex items-start gap-2 sm:gap-2.5">
          <GripVertical className="hidden sm:block h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
              {view.title}
            </p>
            <p className={`text-xs font-mono truncate ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              /{view.slug}
            </p>
          </div>
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Action Buttons - Show on hover (desktop) or always visible on mobile when active */}
      <div className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity bg-white/90 rounded-lg p-0.5 shadow-sm border border-gray-100 ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <ActionBtn
          onClick={() => onReorder(view.id, 'up')}
          disabled={disabled || loading || index === 0}
          title="Move up"
          className="hidden sm:flex"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn
          onClick={() => onReorder(view.id, 'down')}
          disabled={disabled || loading || index === totalViews - 1}
          title="Move down"
          className="hidden sm:flex"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn onClick={onStartEdit} disabled={disabled || loading} title="Edit" className="text-blue-600 hover:bg-blue-50">
          <Pencil className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn
          onClick={onDelete}
          disabled={disabled || loading || totalViews <= 1}
          title="Delete"
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  disabled,
  title,
  className = '',
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      className={`p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center ${className}`}
      title={title}
    >
      {children}
    </button>
  );
}

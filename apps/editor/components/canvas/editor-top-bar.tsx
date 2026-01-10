'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import type { Map as MapType, ProductView } from '@docmaps/database';
import { ConfirmDialog } from '@docmaps/ui';
import { PreviewDialog } from './preview-dialog';

interface EditorTopBarProps {
  map: MapType;
  currentView?: ProductView;
  saving: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onTogglePublish: (newStatus: 'draft' | 'published') => Promise<void>;
}

export function EditorTopBar({ 
  map, 
  currentView,
  saving, 
  hasChanges, 
  onSave, 
  onTogglePublish,
}: EditorTopBarProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const getSaveButtonText = () => {
    if (saving) return 'Saving...';
    if (hasChanges) return 'Save';
    return 'Saved';
  };

  const handleTogglePublish = async () => {
    const newStatus = map.status === 'published' ? 'draft' : 'published';
    
    if (newStatus === 'published') {
      setShowPublishDialog(true);
      return;
    }

    setIsPublishing(true);
    try {
      await onTogglePublish(newStatus);
    } finally {
      setIsPublishing(false);
    }
  };

  const confirmPublish = async () => {
    setIsPublishing(true);
    try {
      await onTogglePublish('published');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 bg-white px-3 sm:px-6 py-3 shadow-sm gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={() => router.push('/editor/dashboard')}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 sm:h-6 w-px bg-gray-300 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
                {map.title}
              </h1>
              {currentView && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {currentView.title}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{map.product_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0">
          {/* Preview Button */}
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Status Badge and Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-medium ${
                map.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {map.status === 'published' ? 'Published' : 'Draft'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={map.status === 'published'}
                onChange={handleTogglePublish}
                disabled={isPublishing}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <button
            onClick={onSave}
            disabled={!hasChanges || saving}
            className="rounded-lg bg-blue-600 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
          >
            {getSaveButtonText()}
          </button>
        </div>
      </div>

      {/* Preview Dialog - using current view's nodes/edges if available */}
      <PreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        nodes={currentView ? currentView.nodes : map.nodes}
        edges={currentView ? currentView.edges : map.edges}
        title={currentView ? `${map.title} - ${currentView.title}` : map.title}
      />

      {/* Publish Confirmation Dialog */}
      <ConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish Map"
        description="Make this map public? Anyone with the link will be able to view it."
        confirmText="Publish"
        cancelText="Cancel"
        onConfirm={confirmPublish}
        variant="default"
      />
    </>
  );
}

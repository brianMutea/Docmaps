'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Download } from 'lucide-react';
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
  onExport?: () => void;
}

export function EditorTopBar({ 
  map, 
  currentView,
  saving, 
  hasChanges, 
  onSave, 
  onTogglePublish,
  onExport,
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
      <div className="flex items-center justify-between h-14 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={() => router.push('/editor/dashboard')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Back to dashboard"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                {map.title}
              </h1>
              {currentView && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {currentView.title}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{map.product_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Button */}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Preview Button */}
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Status Badge and Toggle */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                map.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                  : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${map.status === 'published' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {map.status === 'published' ? 'Published' : 'Draft'}
            </span>
            <button
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                map.status === 'published'
                  ? 'bg-emerald-500 focus:ring-emerald-500'
                  : 'bg-gray-300 focus:ring-gray-400'
              } ${isPublishing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              role="switch"
              aria-checked={map.status === 'published'}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  map.status === 'published' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-sm font-semibold transition-all ${
              hasChanges && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
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

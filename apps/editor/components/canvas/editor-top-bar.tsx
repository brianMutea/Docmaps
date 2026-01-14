'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, MoreVertical, Check } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
      <div className="flex items-center justify-between h-14 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-3 sm:px-4 shadow-sm relative z-50">
        {/* Left side - Back button and title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => router.push('/editor/dashboard')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Back to dashboard"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="hidden sm:block h-6 w-px bg-gray-200" />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-[300px]">
                {map.title}
              </h1>
              {currentView && (
                <span className="hidden xs:inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 truncate max-w-[80px] sm:max-w-none">
                  {currentView.title}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate hidden sm:block">{map.product_name}</p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
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

          {/* Mobile/Tablet Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Status indicator - compact */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                map.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${map.status === 'published' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span className="hidden xs:inline">{map.status === 'published' ? 'Live' : 'Draft'}</span>
            </span>

            {/* Toggle */}
            <button
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${
                map.status === 'published' ? 'bg-emerald-500' : 'bg-gray-300'
              } ${isPublishing ? 'opacity-50' : ''}`}
              role="switch"
              aria-checked={map.status === 'published'}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  map.status === 'published' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            {/* Save Button - compact */}
            <button
              onClick={onSave}
              disabled={!hasChanges || saving}
              className={`flex items-center justify-center h-8 w-8 sm:w-auto sm:px-3 rounded-lg text-sm font-semibold transition-all ${
                hasChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : hasChanges ? (
                <>
                  <span className="hidden sm:inline">Save</span>
                  <Check className="h-4 w-4 sm:hidden" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Saved</span>
                  <Check className="h-4 w-4 sm:hidden text-gray-400" />
                </>
              )}
            </button>

            {/* More menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="absolute right-3 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setShowPreview(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 text-gray-400" />
                <span>Preview</span>
              </button>
              {currentView && (
                <div className="px-4 py-2 border-t border-gray-100 mt-1">
                  <p className="text-xs text-gray-500">Current view</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{currentView.title}</p>
                </div>
              )}
            </div>
          </>
        )}
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

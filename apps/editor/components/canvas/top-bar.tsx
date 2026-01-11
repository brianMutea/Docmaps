'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Download, ArrowLeft, Check, Loader2, Cloud, CloudOff } from 'lucide-react';
import type { Map as MapType } from '@docmaps/database';
import type { Node, Edge } from 'reactflow';
import { ConfirmDialog } from '@docmaps/ui';
import { PreviewDialog } from './preview-dialog';

interface TopBarProps {
  map: MapType;
  saving: boolean;
  hasChanges: boolean;
  nodes: Node[];
  edges: Edge[];
  onSave: () => void;
  onTogglePublish: (newStatus: 'draft' | 'published') => Promise<void>;
  onExport: () => void;
}

export function TopBar({ map, saving, hasChanges, nodes, edges, onSave, onTogglePublish, onExport }: TopBarProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

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
        {/* Left Section - Back & Title */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={() => router.push('/editor/dashboard')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                {map.title}
              </h1>
              <SaveStatus saving={saving} hasChanges={hasChanges} />
            </div>
            <p className="text-xs text-gray-500 truncate">{map.product_name}</p>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <ActionButton onClick={onExport} icon={<Download className="h-4 w-4" />} label="Export" />

          {/* Preview Button */}
          <ActionButton onClick={() => setShowPreview(true)} icon={<Eye className="h-4 w-4" />} label="Preview" />

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Status Toggle */}
          <div className="flex items-center gap-2">
            <StatusBadge status={map.status} />
            <PublishToggle
              isPublished={map.status === 'published'}
              isPublishing={isPublishing}
              onToggle={handleTogglePublish}
            />
          </div>

          {/* Save Button */}
          <SaveButton saving={saving} hasChanges={hasChanges} onSave={onSave} />
        </div>
      </div>

      <PreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        nodes={nodes}
        edges={edges}
        title={map.title}
      />

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

function SaveStatus({ saving, hasChanges }: { saving: boolean; hasChanges: boolean }) {
  if (saving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Saving...</span>
      </span>
    );
  }
  
  if (hasChanges) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-600">
        <CloudOff className="h-3 w-3" />
        <span className="hidden sm:inline">Unsaved</span>
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
      <Cloud className="h-3 w-3" />
      <span className="hidden sm:inline">Saved</span>
    </span>
  );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isPublished
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
          : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

function PublishToggle({ isPublished, isPublishing, onToggle }: { isPublished: boolean; isPublishing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={isPublishing}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isPublished
          ? 'bg-emerald-500 focus:ring-emerald-500'
          : 'bg-gray-300 focus:ring-gray-400'
      } ${isPublishing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={isPublished}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          isPublished ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SaveButton({ saving, hasChanges, onSave }: { saving: boolean; hasChanges: boolean; onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      disabled={!hasChanges || saving}
      className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-sm font-semibold transition-all ${
        hasChanges && !saving
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Saving</span>
        </>
      ) : hasChanges ? (
        <>
          <span>Save</span>
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Saved</span>
        </>
      )}
    </button>
  );
}

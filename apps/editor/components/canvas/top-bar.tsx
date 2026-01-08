'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Download } from 'lucide-react';
import type { Map as MapType } from '@docmaps/database';
import type { Node, Edge } from 'reactflow';
import { ConfirmDialog } from '@docmaps/ui';
import { PreviewDialog } from './preview-dialog';
import { toast } from '@/lib/utils/toast';

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

    // Unpublish directly without confirmation
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
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/editor/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{map.title}</h1>
            <p className="text-sm text-gray-500">{map.product_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export SVG
          </button>

          {/* Preview Button */}
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          {/* Status Badge and Toggle */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <button
            onClick={onSave}
            disabled={!hasChanges || saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {getSaveButtonText()}
          </button>
        </div>
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        nodes={nodes}
        edges={edges}
        title={map.title}
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Layers, FileText, MoreVertical, Edit3, ExternalLink, Copy, Trash2, Eye, Clock, Settings } from 'lucide-react';
import type { Map as MapType } from '@docmaps/database';
import { ConfirmDialog } from '@docmaps/ui';
import { EditMapModal } from './edit-map-modal';

interface MapItemProps {
  map: MapType;
  viewCount?: number;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate?: (updatedMap: MapType) => void;
}

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://docmaps-web.vercel.app';

export function MapItem({ map, viewCount, onDelete, onDuplicate, onUpdate }: MapItemProps) {
  const [currentMap, setCurrentMap] = useState(map);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
    setMenuOpen(false);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setMenuOpen(false);
  };

  const handleMapUpdate = (updatedMap: MapType) => {
    setCurrentMap(updatedMap);
    onUpdate?.(updatedMap);
  };

  const confirmDelete = () => {
    onDelete(currentMap.id);
  };

  const isMultiView = currentMap.view_type === 'multi';

  const gradientIndex = currentMap.title.charCodeAt(0) % 4;
  const gradients = [
    'from-blue-500/10 via-blue-400/5 to-transparent',
    'from-purple-500/10 via-purple-400/5 to-transparent',
    'from-teal-500/10 via-teal-400/5 to-transparent',
    'from-amber-500/10 via-amber-400/5 to-transparent',
  ];

  return (
    <>
      <div className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200">
        {/* Header - Logo or Gradient */}
        {currentMap.logo_url ? (
          <div className="relative h-20 bg-gray-50 border-b border-gray-100">
            <Image
              src={currentMap.logo_url}
              alt={`${currentMap.product_name} logo`}
              fill
              unoptimized
              className="object-contain p-3"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className={`h-2 bg-gradient-to-r ${gradients[gradientIndex]}`} />
        )}
        
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/editor/maps/${currentMap.id}`}
                className="text-base font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors block"
              >
                {currentMap.title}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{currentMap.product_name}</p>
            </div>

            <div className="relative z-10">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white py-1 shadow-xl ring-1 ring-black/5 z-30 border border-gray-100">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      Edit Details
                    </button>
                    <Link
                      href={`/editor/maps/${currentMap.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 text-gray-400" />
                      Edit Canvas
                    </Link>
                    {currentMap.status === 'published' && (
                      <a
                        href={`${WEB_APP_URL}/maps/${currentMap.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                        View Public
                      </a>
                    )}
                    <button
                      onClick={() => { onDuplicate(currentMap.id); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="h-4 w-4 text-gray-400" />
                      Duplicate
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {currentMap.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{currentMap.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              currentMap.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentMap.status === 'published' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {currentMap.status === 'published' ? 'Published' : 'Draft'}
            </span>

            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              isMultiView ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
            }`}>
              {isMultiView ? (
                <>
                  <Layers className="h-3 w-3" />
                  Multi-View
                  {viewCount !== undefined && viewCount > 0 && <span className="text-purple-500">({viewCount})</span>}
                </>
              ) : (
                <>
                  <FileText className="h-3 w-3" />
                  Single
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {currentMap.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(currentMap.updated_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <Link
          href={`/editor/maps/${currentMap.id}`}
          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Edit ${currentMap.title}`}
        />
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Map"
        description={`Are you sure you want to delete "${currentMap.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <EditMapModal
        map={currentMap}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUpdate={handleMapUpdate}
      />
    </>
  );
}

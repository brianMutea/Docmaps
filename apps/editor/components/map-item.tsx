'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Layers, FileText } from 'lucide-react';
import type { Map as MapType } from '@docmaps/database';
import { ConfirmDialog } from '@docmaps/ui';

interface MapItemProps {
  map: MapType;
  viewCount?: number;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function MapItem({ map, viewCount, onDelete, onDuplicate }: MapItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(map.id);
  };

  const isMultiView = map.view_type === 'multi';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/editor/maps/${map.id}`}
              className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors"
            >
              {map.title}
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{map.product_name}</p>
          {map.description && (
            <p className="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2">
              {map.description}
            </p>
          )}
        </div>

        <div className="relative group/menu flex-shrink-0">
          <button className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 border border-gray-100">
            <Link
              href={`/editor/maps/${map.id}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </Link>
            {map.status === 'published' && (
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL?.replace('3000', '3001')}/maps/${map.slug}`}
                target="_blank"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Public
              </Link>
            )}
            <button
              onClick={() => onDuplicate(map.id)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Duplicate
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
        {/* Status Badge */}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            map.status === 'published'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          {map.status === 'published' ? 'Published' : 'Draft'}
        </span>

        {/* View Type Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isMultiView
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {isMultiView ? (
            <>
              <Layers className="h-3 w-3" />
              Multi-View
              {viewCount !== undefined && viewCount > 0 && (
                <span className="ml-0.5 text-purple-500">({viewCount})</span>
              )}
            </>
          ) : (
            <>
              <FileText className="h-3 w-3" />
              Single
            </>
          )}
        </span>

        {/* View Count */}
        <span className="flex items-center gap-1 text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          {map.view_count}
        </span>

        {/* Updated Time */}
        <span className="hidden sm:inline text-gray-400">•</span>
        <span className="hidden sm:inline">Updated {formatDistanceToNow(new Date(map.updated_at))} ago</span>
        <span className="sm:hidden">{formatDistanceToNow(new Date(map.updated_at))} ago</span>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Map"
        description={`Are you sure you want to delete "${map.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Map as MapType } from '@docmaps/database';
import { ConfirmDialog } from '@docmaps/ui';

interface MapItemProps {
  map: MapType;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function MapItem({ map, onDelete, onDuplicate }: MapItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(map.id);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/editor/maps/${map.id}`}
            className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {map.title}
          </Link>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 truncate">{map.product_name}</p>
          {map.description && (
            <p className="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2">
              {map.description}
            </p>
          )}
        </div>

        <div className="relative group flex-shrink-0">
          <button className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
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

          <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <Link
              href={`/editor/maps/${map.id}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Edit
            </Link>
            {map.status === 'published' && (
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL?.replace('3000', '3001')}/maps/${map.slug}`}
                target="_blank"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Public
              </Link>
            )}
            <button
              onClick={() => onDuplicate(map.id)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            map.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {map.status === 'published' ? 'Published' : 'Draft'}
        </span>
        <span className="flex items-center gap-1">
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

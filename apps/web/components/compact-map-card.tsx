'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Map as MapType } from '@docmaps/database';

interface CompactMapCardProps {
  map: MapType;
  featured?: boolean;
}

export function CompactMapCard({ map, featured = false }: CompactMapCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/maps/${map.slug}`}
      className="relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Card (Always Visible) */}
      <div
        className={`relative bg-white rounded-lg border p-4 transition-all duration-200 ${
          featured
            ? 'border-blue-200 hover:border-blue-400'
            : 'border-gray-200 hover:border-blue-300'
        } ${isHovered ? 'shadow-md' : 'shadow-sm hover:shadow-md'}`}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute -top-2 -right-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          </div>
        )}

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {map.title}
        </h3>
      </div>

      {/* Expanded Card (On Hover) */}
      {isHovered && (
        <div
          className="absolute left-0 right-0 top-0 z-50 bg-white rounded-lg border border-blue-400 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200"
          style={{
            minWidth: '280px',
          }}
        >
          {/* Featured Badge */}
          {featured && (
            <div className="absolute -top-2 -right-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            </div>
          )}

          <div className={featured ? 'pr-16' : ''}>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {map.title}
            </h3>
          </div>

          <p className="text-sm font-medium text-blue-600 mb-2">
            {map.product_name}
          </p>

          {map.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {map.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{map.view_count} views</span>
            </div>
            <span className="text-right">
              {formatDistanceToNow(new Date(map.updated_at), { addSuffix: true })}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <span className="text-sm font-semibold text-blue-600">
              View Map →
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}

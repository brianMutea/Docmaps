'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, Sparkles, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Map as MapType } from '@docmaps/database';

interface MapCardProps {
  map: MapType;
  featured?: boolean;
}

export function MapCard({ map, featured = false }: MapCardProps) {
  return (
    <Link
      href={`/maps/${map.slug}`}
      className="relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 cursor-pointer group"
    >
      {/* Logo Header */}
      {map.logo_url && (
        <div className="relative h-24 bg-gray-50 border-b border-gray-100">
          <Image
            src={map.logo_url}
            alt={`${map.product_name} logo`}
            fill
            unoptimized
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          </div>
        )}

        {/* Content */}
        <div className={featured && !map.logo_url ? 'pr-24' : ''}>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {map.title}
          </h3>
          <p className="text-sm font-medium text-blue-600 mb-2">
            {map.product_name}
          </p>
          {map.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {map.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{map.view_count} views</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(map.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Hover indicator */}
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View Map
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

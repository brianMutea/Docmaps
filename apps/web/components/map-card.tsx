'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, Sparkles, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, Badge } from '@docmaps/ui';
import type { Map as MapType } from '@docmaps/database';

interface MapCardProps {
  map: MapType;
  featured?: boolean;
}

export function MapCard({ map, featured = false }: MapCardProps) {
  return (
    <Link
      href={`/maps/${map.slug}`}
      className="group"
    >
      <Card interactive hover className="h-full flex flex-col">
        {/* Logo Header */}
        {map.logo_url && (
          <div className="relative h-24 bg-neutral-50 border-b border-neutral-100">
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

        <div className="p-6 flex-1 flex flex-col">
          {/* Featured badge */}
          {featured && (
            <div className="mb-3">
              <Badge variant="accent" icon={<Sparkles className="h-3 w-3" />}>
                Featured
              </Badge>
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
              {map.title}
            </h3>
            <p className="text-sm font-medium text-primary-600 mb-2">
              {map.product_name}
            </p>
            {map.description && (
              <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                {map.description}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{map.view_count} views</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(map.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Hover indicator */}
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
            View Map
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

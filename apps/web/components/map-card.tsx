'use client';

import Image from 'next/image';
import { Eye, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Map as MapType } from '@docmaps/database';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardMeta, CardBadge, CardHoverIndicator } from '@docmaps/ui';

interface MapCardProps {
  map: MapType;
  featured?: boolean;
}

export function MapCard({ map, featured = false }: MapCardProps) {
  return (
    <Card href={`/maps/${map.slug}`}>
      {/* Logo Header */}
      {map.logo_url && (
        <CardHeader>
          <Image
            src={map.logo_url}
            alt={`${map.product_name} logo`}
            fill
            unoptimized
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </CardHeader>
      )}

      <CardContent>
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 right-4">
            <CardBadge variant="featured">
              <Sparkles className="h-3 w-3" />
              Featured
            </CardBadge>
          </div>
        )}

        {/* Content */}
        <div className={featured && !map.logo_url ? 'pr-24' : ''}>
          <CardTitle>{map.title}</CardTitle>
          <p className="text-sm font-medium text-blue-600 mb-2">
            {map.product_name}
          </p>
          {map.description && (
            <CardDescription>{map.description}</CardDescription>
          )}
        </div>

        {/* Meta */}
        <CardMeta>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{map.view_count} views</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(map.created_at), { addSuffix: true })}
          </span>
        </CardMeta>

        {/* Hover indicator */}
        <CardHoverIndicator text="View Map" />
      </CardContent>
    </Card>
  );
}

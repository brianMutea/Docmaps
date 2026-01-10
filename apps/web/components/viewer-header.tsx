'use client';

import { useCallback } from 'react';
import { ExternalLink, Share2, Code2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import type { Map as MapType, ProductView } from '@docmaps/database';

interface ViewerHeaderProps {
  map: MapType;
  currentView?: ProductView;
  viewCount?: number;
  embedded?: boolean;
}

export function ViewerHeader({ map, currentView, viewCount, embedded = false }: ViewerHeaderProps) {
  const handleShare = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!', {
        description: 'Share this map with others',
      });
    }
  }, []);

  const handleCopyEmbed = useCallback(() => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${map.slug}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      toast.success('Embed code copied!', {
        description: 'Paste this code into your website',
      });
    }
  }, [map.slug]);

  if (embedded) return null;

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-full mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left side - Map info */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
                  {map.title}
                </h1>
                {currentView && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    <Layers className="h-3 w-3" />
                    {currentView.title}
                  </span>
                )}
                {viewCount && viewCount > 1 && !currentView && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-medium text-purple-700">
                    <Layers className="h-3 w-3" />
                    {viewCount} views
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{map.product_name}</p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {map.product_url && (
              <a
                href={map.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap"
              >
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">View Docs</span>
              </a>
            )}
            <button
              onClick={handleCopyEmbed}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap"
              title="Copy embed code"
            >
              <Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">Embed</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

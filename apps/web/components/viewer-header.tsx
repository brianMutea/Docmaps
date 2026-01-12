'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Share2, Code2, Layers, Check, Copy, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Map as MapType, ProductView } from '@docmaps/database';

interface ViewerHeaderProps {
  map: MapType;
  currentView?: ProductView;
  viewCount?: number;
  embedded?: boolean;
}

export function ViewerHeader({ map, currentView, viewCount, embedded = false }: ViewerHeaderProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const handleCopyLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Link copied!', {
        description: 'Share this map with others',
      });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, []);

  const handleCopyEmbed = useCallback(() => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${map.slug}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success('Embed code copied!', {
        description: 'Paste this code into your website',
      });
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  }, [map.slug]);

  if (embedded) return null;

  return (
    <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left side - Map info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Map Logo or Icon */}
            {map.logo_url ? (
              <div className="hidden sm:flex relative w-10 h-10 rounded-xl bg-white border border-gray-200 overflow-hidden">
                <Image
                  src={map.logo_url}
                  alt={`${map.product_name} logo`}
                  fill
                  className="object-contain p-1"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  {map.title}
                </h1>
                {currentView && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {currentView.title}
                  </span>
                )}
                {viewCount && viewCount > 1 && !currentView && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200/60 px-2.5 py-1 text-xs font-semibold text-purple-700">
                    <Layers className="h-3 w-3" />
                    {viewCount} views
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate mt-0.5">{map.product_name}</p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* View Docs Button */}
            {map.product_url && (
              <a
                href={map.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View Docs</span>
              </a>
            )}

            {/* Share Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showShareMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showShareMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[60]" 
                    onClick={() => setShowShareMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        handleCopyLink();
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {copiedLink ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Copy link</span>
                    </button>
                    <button
                      onClick={() => {
                        handleCopyEmbed();
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {copiedEmbed ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Code2 className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Copy embed code</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

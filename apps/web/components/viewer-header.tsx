'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ExternalLink, Share2, Code2, Layers, Check, Copy, ChevronDown, Download, ArrowLeft, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { Map as MapType, ProductView } from '@docmaps/database';

interface ViewerHeaderProps {
  map: MapType;
  currentView?: ProductView;
  viewCount?: number;
  embedded?: boolean;
  onExportSVG?: () => void;
}

export function ViewerHeader({ map, currentView, viewCount, embedded = false, onExportSVG }: ViewerHeaderProps) {
  const router = useRouter();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Build URL with view parameter for multi-view maps
  const getShareUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    let url = `${baseUrl}/maps/${map.slug}`;
    if (currentView) {
      url += `?view=${currentView.slug}`;
    }
    return url;
  }, [map.slug, currentView]);

  const getEmbedUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    let url = `${baseUrl}/embed/${map.slug}`;
    if (currentView) {
      url += `?view=${currentView.slug}`;
    }
    return url;
  }, [map.slug, currentView]);

  const handleCopyLink = useCallback(() => {
    const url = getShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Link copied!', {
        description: currentView ? `Link to "${currentView.title}" view` : 'Share this map with others',
      });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [getShareUrl, currentView]);

  const handleCopyEmbed = useCallback(() => {
    const embedUrl = getEmbedUrl();
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success('Embed code copied!', {
        description: currentView ? `Embed code for "${currentView.title}" view` : 'Paste this code into your website',
      });
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  }, [getEmbedUrl, currentView]);

  const handleExportSVG = useCallback(() => {
    if (onExportSVG) {
      onExportSVG();
      setShowShareMenu(false);
      setShowMobileMenu(false);
    }
  }, [onExportSVG]);

  const handleBack = useCallback(() => {
    router.push('/maps');
  }, [router]);

  if (embedded) return null;

  return (
    <header className="border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-20">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left side - Back button and Map info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all flex-shrink-0"
              aria-label="Back to maps"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Divider - hidden on mobile */}
            <div className="hidden sm:block h-6 w-px bg-gray-200" />

            {/* Map Logo or Icon - hidden on small mobile */}
            {map.logo_url ? (
              <div className="hidden xs:flex relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                <Image
                  src={map.logo_url}
                  alt={`${map.product_name} logo`}
                  fill
                  unoptimized
                  className="object-contain p-0.5 sm:p-1"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="hidden xs:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[240px] lg:max-w-none">
                  {map.title}
                </h1>
                {currentView && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {currentView.title}
                  </span>
                )}
                {viewCount && viewCount > 1 && !currentView && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200/60 px-2 py-0.5 text-xs font-semibold text-purple-700">
                    <Layers className="h-3 w-3" />
                    {viewCount} views
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5 max-w-[140px] xs:max-w-[180px] sm:max-w-none">{map.product_name}</p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* View Docs Button */}
              {map.product_url && (
                <a
                  href={map.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden lg:inline">View Docs</span>
                </a>
              )}

              {/* Share Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 lg:px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden lg:inline">Share</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showShareMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Dropdown Menu */}
                {showShareMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setShowShareMenu(false)}
                      onTouchStart={() => setShowShareMenu(false)}
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
                      {onExportSVG && (
                        <>
                          <div className="my-1 border-t border-gray-100" />
                          <button
                            onClick={handleExportSVG}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Download className="h-4 w-4 text-gray-400" />
                            <span>Export as SVG</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile/Tablet Actions */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Quick share button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
                aria-label="Copy link"
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              </button>

              {/* More menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {showMobileMenu && (
            <>
              <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm md:hidden"
                onClick={() => setShowMobileMenu(false)}
                onTouchStart={() => setShowMobileMenu(false)}
              />
              <div className="absolute right-3 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-[70] md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Current view info */}
                {currentView && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Current View</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      {currentView.title}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copiedEmbed ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Code2 className="h-4 w-4 text-gray-400" />
                    )}
                    <span>Copy embed code</span>
                  </button>
                  {onExportSVG && (
                    <button
                      onClick={handleExportSVG}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4 text-gray-400" />
                      <span>Export as SVG</span>
                    </button>
                  )}
                </div>

                {/* View Docs link */}
                {map.product_url && (
                  <>
                    <div className="my-1 border-t border-gray-100" />
                    <a
                      href={map.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span>View Documentation</span>
                    </a>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

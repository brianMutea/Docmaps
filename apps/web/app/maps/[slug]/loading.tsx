import { Skeleton } from '@docmaps/ui';
import { Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function MapViewerLoading() {
  return (
    <div className="h-screen flex flex-col bg-neutral-900 animate-fade-in">
      {/* Header Skeleton */}
      <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left side */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <Skeleton className="h-6 w-48 mb-1.5 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-10 w-10 sm:w-28 rounded-xl" />
              <Skeleton className="h-10 w-24 sm:w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* View Selector Sidebar - Desktop */}
        <div className="hidden sm:flex flex-col w-64 bg-neutral-800 backdrop-blur-sm border-r border-neutral-700">
          {/* Sidebar Header */}
          <div className="px-4 py-4 border-b border-neutral-700 bg-gradient-to-r from-primary-500/10 to-info-500/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-500/20">
                <Layers className="h-4 w-4 text-primary-400" />
              </div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-6 ml-auto rounded-full" />
            </div>
          </div>

          {/* View List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className={`h-14 w-full rounded-xl ${i === 0 ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20' : ''}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="p-3 border-t border-neutral-700 bg-neutral-800/50">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Floating Controls - Top */}
        <div className="absolute top-4 right-4 z-10">
          <Skeleton className="h-11 w-28 rounded-xl shadow-lg" />
        </div>

        {/* Floating Controls - Bottom Left */}
        <div className="absolute bottom-4 left-4 sm:left-[calc(16rem+1rem)] z-10 flex items-center gap-2">
          <div className="flex items-center bg-neutral-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-700 overflow-hidden">
            <div className="p-2.5 text-neutral-400 border-r border-neutral-700">
              <ZoomOut className="h-4 w-4" />
            </div>
            <div className="p-2.5 text-neutral-400 border-r border-neutral-700">
              <ZoomIn className="h-4 w-4" />
            </div>
            <div className="p-2.5 text-neutral-400">
              <Maximize2 className="h-4 w-4" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-xl shadow-lg" />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-neutral-900">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="map-loading-grid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="rgb(148, 163, 184)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-loading-grid)" />
            </svg>
          </div>

          {/* Loading Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-neutral-700 border-t-primary-500 animate-spin" />
              </div>
              <p className="mt-6 text-sm font-medium text-neutral-300">Loading map...</p>
              <p className="mt-1 text-xs text-neutral-500">Preparing visualization</p>
            </div>
          </div>

          {/* MiniMap Placeholder */}
          <div className="absolute bottom-4 right-4 hidden sm:block">
            <Skeleton className="h-32 w-48 rounded-xl shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

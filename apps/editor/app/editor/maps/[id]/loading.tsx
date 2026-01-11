import { Skeleton } from '@docmaps/ui';
import { Layers, Save, Eye, Globe } from 'lucide-react';

export default function EditorLoading() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 animate-fade-in">
      {/* Top Bar Skeleton */}
      <div className="border-b border-gray-200/80 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <div className="hidden sm:block h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
              <Save className="h-4 w-4 text-gray-400" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-10 w-10 sm:w-28 rounded-xl" />
            <Skeleton className="h-10 w-10 sm:w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Skeleton */}
        <div className="hidden lg:flex flex-col w-64 border-r border-gray-200/80 bg-white/80 backdrop-blur-sm">
          {/* Sidebar Header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Tool Sections */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Add Nodes Section */}
            <div>
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>

            {/* Layout Section */}
            <div>
              <Skeleton className="h-4 w-20 mb-3" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            </div>

            {/* Actions Section */}
            <div>
              <Skeleton className="h-4 w-16 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]">
          {/* Loading Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 animate-pulse-slow">
                  <Layers className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                </div>
              </div>
              <p className="mt-6 text-sm font-medium text-gray-600">Loading editor...</p>
              <p className="mt-1 text-xs text-gray-400">Preparing your canvas</p>
            </div>
          </div>

          {/* Floating Controls Placeholder */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <div className="hidden md:flex flex-col w-80 border-l border-gray-200/80 bg-white/80 backdrop-blur-sm">
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-gray-300" />
              </div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

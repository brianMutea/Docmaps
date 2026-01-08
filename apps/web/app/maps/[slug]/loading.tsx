import { Skeleton } from '@docmaps/ui';

export default function MapViewerLoading() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header Skeleton */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-80 border-l border-gray-200 bg-white p-6">
          <Skeleton className="h-10 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

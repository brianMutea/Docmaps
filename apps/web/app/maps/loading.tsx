import { Skeleton } from '@docmaps/ui';

export default function BrowseMapsLoading() {
  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="loading-browse-grid"
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
            <rect width="100%" height="100%" fill="url(#loading-browse-grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4 rounded-2xl bg-neutral-800" />
          <Skeleton className="h-6 w-96 mx-auto mb-8 rounded-xl bg-neutral-800" />
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-14 w-full rounded-2xl bg-neutral-800" />
          </div>
        </div>
      </section>

      {/* Filters and Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Skeleton className="h-12 flex-1 rounded-xl bg-neutral-800" />
          <Skeleton className="h-12 w-48 rounded-xl bg-neutral-800" />
        </div>

        {/* Maps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden"
            >
              {/* Card Header */}
              <div className="h-24 bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 relative">
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-xl bg-neutral-700" />
                  <Skeleton className="h-6 w-20 rounded-full bg-neutral-700" />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2 rounded-lg bg-neutral-700" />
                <Skeleton className="h-4 w-1/2 mb-4 rounded bg-neutral-700" />
                <Skeleton className="h-4 w-full mb-2 rounded bg-neutral-700" />
                <Skeleton className="h-4 w-4/5 mb-4 rounded bg-neutral-700" />

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                  <Skeleton className="h-4 w-16 rounded bg-neutral-700" />
                  <Skeleton className="h-4 w-24 rounded bg-neutral-700" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
            <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
            <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
            <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
            <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
          </div>
        </div>
      </section>
    </div>
  );
}

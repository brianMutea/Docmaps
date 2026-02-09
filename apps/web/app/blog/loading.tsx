import { Skeleton } from '@docmaps/ui';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="loading-blog-grid"
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
            <rect width="100%" height="100%" fill="url(#loading-blog-grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4 rounded-2xl bg-neutral-800" />
          <Skeleton className="h-6 w-96 mx-auto rounded-xl bg-neutral-800" />
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48 rounded-xl bg-neutral-800" />
            <Skeleton className="h-1 flex-1 ml-6 rounded bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden"
              >
                <Skeleton className="h-48 w-full bg-neutral-700" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3 rounded-lg bg-neutral-700" />
                  <Skeleton className="h-4 w-full mb-2 rounded bg-neutral-700" />
                  <Skeleton className="h-4 w-5/6 mb-4 rounded bg-neutral-700" />
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full bg-neutral-700" />
                    <Skeleton className="h-6 w-20 rounded-full bg-neutral-700" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                    <Skeleton className="h-4 w-24 rounded bg-neutral-700" />
                    <Skeleton className="h-4 w-16 rounded bg-neutral-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <Skeleton className="h-14 w-full rounded-xl bg-neutral-800" />
        </div>

        {/* Latest Posts */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-40 rounded-xl bg-neutral-800" />
            <Skeleton className="h-5 w-24 rounded bg-neutral-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden"
              >
                <Skeleton className="h-48 w-full bg-neutral-700" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3 rounded-lg bg-neutral-700" />
                  <Skeleton className="h-4 w-full mb-2 rounded bg-neutral-700" />
                  <Skeleton className="h-4 w-5/6 mb-4 rounded bg-neutral-700" />
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full bg-neutral-700" />
                    <Skeleton className="h-6 w-20 rounded-full bg-neutral-700" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                    <Skeleton className="h-4 w-24 rounded bg-neutral-700" />
                    <Skeleton className="h-4 w-16 rounded bg-neutral-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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

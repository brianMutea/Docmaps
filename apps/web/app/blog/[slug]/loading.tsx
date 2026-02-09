import { Skeleton } from '@docmaps/ui';

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="loading-post-grid"
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
            <rect width="100%" height="100%" fill="url(#loading-post-grid)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <Skeleton className="h-4 w-32 mb-6 rounded bg-neutral-800" />
          
          {/* Title */}
          <Skeleton className="h-12 w-full max-w-2xl mb-4 rounded-2xl bg-neutral-800" />
          <Skeleton className="h-12 w-3/4 mb-6 rounded-2xl bg-neutral-800" />
          
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full bg-neutral-800" />
              <Skeleton className="h-4 w-32 rounded bg-neutral-800" />
            </div>
            <Skeleton className="h-4 w-24 rounded bg-neutral-800" />
            <Skeleton className="h-4 w-20 rounded bg-neutral-800" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full bg-neutral-800" />
            <Skeleton className="h-6 w-24 rounded-full bg-neutral-800" />
            <Skeleton className="h-6 w-16 rounded-full bg-neutral-800" />
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
          {/* Main Content */}
          <div className="prose prose-invert max-w-none">
            {/* Featured Image */}
            <Skeleton className="h-96 w-full rounded-2xl mb-8 bg-neutral-800" />

            {/* Content Blocks */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
              <Skeleton className="h-6 w-5/6 rounded bg-neutral-800" />
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
              <Skeleton className="h-6 w-4/5 rounded bg-neutral-800" />
              
              <div className="py-4" />
              
              <Skeleton className="h-8 w-2/3 rounded-xl mb-4 bg-neutral-800" />
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
              <Skeleton className="h-6 w-3/4 rounded bg-neutral-800" />
              
              <div className="py-4" />
              
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
              <Skeleton className="h-6 w-5/6 rounded bg-neutral-800" />
              <Skeleton className="h-6 w-full rounded bg-neutral-800" />
            </div>
          </div>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
                <Skeleton className="h-6 w-32 mb-4 rounded-lg bg-neutral-700" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded bg-neutral-700" />
                  <Skeleton className="h-4 w-5/6 rounded bg-neutral-700" />
                  <Skeleton className="h-4 w-full rounded bg-neutral-700" />
                  <Skeleton className="h-4 w-4/5 rounded bg-neutral-700" />
                </div>
              </div>

              <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
                <Skeleton className="h-6 w-24 mb-4 rounded-lg bg-neutral-700" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10 rounded-lg bg-neutral-700" />
                  <Skeleton className="h-10 w-10 rounded-lg bg-neutral-700" />
                  <Skeleton className="h-10 w-10 rounded-lg bg-neutral-700" />
                  <Skeleton className="h-10 w-10 rounded-lg bg-neutral-700" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        <div className="mt-16 pt-12 border-t border-neutral-800">
          <Skeleton className="h-8 w-48 mb-8 rounded-xl bg-neutral-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden"
              >
                <Skeleton className="h-40 w-full bg-neutral-700" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2 rounded-lg bg-neutral-700" />
                  <Skeleton className="h-4 w-full mb-1 rounded bg-neutral-700" />
                  <Skeleton className="h-4 w-5/6 rounded bg-neutral-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

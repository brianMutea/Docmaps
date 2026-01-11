import { Skeleton } from '@docmaps/ui';
import { Map, Sparkles } from 'lucide-react';

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 text-center">
          {/* Logo Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 animate-pulse-slow">
                <Map className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          {/* Title Skeleton */}
          <Skeleton className="h-12 sm:h-16 w-3/4 max-w-2xl mx-auto mb-6 rounded-2xl" />
          <Skeleton className="h-6 w-2/3 max-w-xl mx-auto mb-10 rounded-xl" />

          {/* Search Bar Skeleton */}
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-14 sm:h-16 w-full rounded-2xl shadow-lg" />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 mt-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2 rounded-lg" />
                <Skeleton className="h-4 w-20 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Maps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2 rounded-xl" />
            <Skeleton className="h-5 w-64 rounded-lg" />
          </div>
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>

        {/* Maps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm"
            >
              {/* Card Header Gradient */}
              <div className="h-24 bg-gradient-to-br from-gray-100 via-gray-50 to-white relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0YzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-1/2 mb-4 rounded" />
                <Skeleton className="h-4 w-full mb-2 rounded" />
                <Skeleton className="h-4 w-4/5 mb-4 rounded" />

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Skeleton */}
      <footer className="border-t border-gray-200/60 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <Skeleton className="h-5 w-64 rounded" />
          </div>
        </div>
      </footer>
    </div>
  );
}

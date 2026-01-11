import { Skeleton } from '@docmaps/ui';
import { BarChart3, Map, Eye, TrendingUp } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 animate-fade-in px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-56 mb-2" />
        <Skeleton className="h-4 sm:h-5 w-64 sm:w-80" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 mb-6 sm:mb-8">
        {[
          { icon: Map, color: 'blue' },
          { icon: Eye, color: 'purple' },
          { icon: TrendingUp, color: 'emerald' },
          { icon: BarChart3, color: 'amber' },
        ].map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 mb-2 sm:mb-3" />
                <Skeleton className="h-7 sm:h-9 w-14 sm:w-20" />
              </div>
              <div
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-${item.color}-50 text-${item.color}-500 opacity-50`}
              >
                <item.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
              <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 mb-2" />
            <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-32 rounded-lg sm:rounded-xl" />
        </div>
        <div className="h-40 sm:h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
              <Skeleton
                className="w-full rounded-t-lg"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
              <Skeleton className="h-2 sm:h-3 w-4 sm:w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Maps Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-36 sm:w-48" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg sm:rounded-xl" />
          <Skeleton className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg sm:rounded-xl" />
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 rounded-lg sm:rounded-xl" />
        </div>
      </div>

      {/* Maps Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm"
          >
            {/* Card Header Gradient */}
            <div className="h-16 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-50 relative">
              <div className="absolute bottom-2 sm:bottom-3 left-3 sm:left-4 flex items-center gap-2">
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl" />
                <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
              </div>
            </div>
            {/* Card Content */}
            <div className="p-4 sm:p-5">
              <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-1/2 mb-3 sm:mb-4" />
              <Skeleton className="h-3 sm:h-4 w-full mb-2" />
              <Skeleton className="h-3 sm:h-4 w-4/5 mb-3 sm:mb-4" />
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

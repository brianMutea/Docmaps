import { Skeleton } from '@docmaps/ui';
import { BarChart3, Map, Eye, TrendingUp } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 animate-fade-in">
      {/* Header Section */}
      <div className="mb-8">
        <Skeleton className="h-10 w-56 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { icon: Map, color: 'blue' },
          { icon: Eye, color: 'purple' },
          { icon: TrendingUp, color: 'emerald' },
          { icon: BarChart3, color: 'amber' },
        ].map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-9 w-20" />
              </div>
              <div
                className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-500 opacity-50`}
              >
                <item.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="h-64 flex items-end justify-between gap-2 px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton
                className="w-full rounded-t-lg"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Maps Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Maps Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm"
          >
            {/* Card Header Gradient */}
            <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-50 relative">
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            {/* Card Content */}
            <div className="p-5">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-4" />
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

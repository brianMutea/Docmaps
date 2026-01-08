'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { toast } from '@/lib/utils/toast';
import { MapItem } from '@/components/map-item';
import { TrendingUp, Eye, Map as MapIcon, BarChart3 } from 'lucide-react';
import type { Map as MapType } from '@docmaps/database';
import Link from 'next/link';

interface Analytics {
  totalMaps: number;
  totalViews: number;
  mostPopularMap: MapType | null;
  recentViews: Array<{ viewed_at: string; count: number }>;
}

interface DashboardClientProps {
  maps: MapType[];
  analytics: Analytics;
}

export function DashboardClient({ maps: initialMaps, analytics }: DashboardClientProps) {
  const router = useRouter();
  const [maps, setMaps] = useState(initialMaps);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('maps').delete().eq('id', id);

      if (error) throw error;

      setMaps(maps.filter((map) => map.id !== id));
      toast.success('Map deleted successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(`Failed to delete map: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const originalMap = maps.find((m) => m.id === id);

      if (!originalMap) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Generate new slug
      const newSlug = `${originalMap.slug}-copy-${Date.now()}`;

      // @ts-ignore - Supabase type inference issue with JSONB columns
      const { error } = await supabase.from('maps').insert({
        user_id: user.id,
        title: `${originalMap.title} (Copy)`,
        product_name: originalMap.product_name,
        product_url: originalMap.product_url,
        description: originalMap.description,
        slug: newSlug,
        nodes: originalMap.nodes,
        edges: originalMap.edges,
        metadata: originalMap.metadata,
        status: 'draft',
      });

      if (error) throw error;

      toast.success('Map duplicated successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(`Failed to duplicate map: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate max views for chart scaling
  const maxViews = Math.max(...analytics.recentViews.map(v => v.count), 1);

  return (
    <div className="space-y-8 relative">
      {/* Subtle Grid Pattern Background */}
      <div className="fixed inset-0 opacity-[0.15] pointer-events-none z-0">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dashboard-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
        </svg>
      </div>

      {/* Analytics Section */}
      <div className="relative z-10">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Total Maps */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Maps</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{analytics.totalMaps}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{analytics.totalViews}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Most Popular Map */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 sm:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Most Popular Map</p>
                {analytics.mostPopularMap ? (
                  <>
                    <Link
                      href={`/editor/maps/${analytics.mostPopularMap.id}`}
                      className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block"
                    >
                      {analytics.mostPopularMap.title}
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {analytics.mostPopularMap.view_count} views
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No views yet</p>
                )}
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 flex items-center justify-center ml-4">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Views Chart */}
        {analytics.recentViews.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Views Activity</h3>
              <span className="text-xs sm:text-sm text-gray-500">(Last 30 days)</span>
            </div>
            
            <div className="flex items-end gap-0.5 sm:gap-1 h-24 sm:h-32">
              {analytics.recentViews.slice(-30).map((view, index) => {
                const height = (view.count / maxViews) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 group relative"
                    style={{ minWidth: '4px' }}
                  >
                    <div
                      className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {new Date(view.viewed_at).toLocaleDateString()}: {view.count} views
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>
                {analytics.recentViews.length > 0 
                  ? new Date(analytics.recentViews[0].viewed_at).toLocaleDateString()
                  : 'No data'}
              </span>
              <span>Today</span>
            </div>
          </div>
        )}
      </div>

      {/* Maps Section */}
      <div className="relative z-10">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Your Maps</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <MapItem
              key={map.id}
              map={map}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

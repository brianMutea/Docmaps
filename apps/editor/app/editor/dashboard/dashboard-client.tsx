'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { toast } from '@/lib/utils/toast';
import { MapItem } from '@/components/map-item';
import { TrendingUp, Eye, Map as MapIcon, BarChart3, Layers } from 'lucide-react';
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
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  // Fetch view counts for multi-view maps
  useEffect(() => {
    const fetchViewCounts = async () => {
      const multiViewMaps = maps.filter(m => m.view_type === 'multi');
      if (multiViewMaps.length === 0) return;

      const supabase = createClient();
      const counts: Record<string, number> = {};

      for (const map of multiViewMaps) {
        const { count } = await supabase
          .from('product_views')
          .select('*', { count: 'exact', head: true })
          .eq('map_id', map.id);
        
        counts[map.id] = count || 0;
      }

      setViewCounts(counts);
    };

    fetchViewCounts();
  }, [maps]);

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Delete associated product_views first (for multi-view maps)
      await supabase.from('product_views').delete().eq('map_id', id);
      
      // Then delete the map
      const { error } = await supabase.from('maps').delete().eq('id', id);

      if (error) throw error;

      setMaps(maps.filter((map) => map.id !== id));
      toast.success('Map deleted successfully');
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete map: ${message}`);
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
      const { data: newMap, error } = await supabase.from('maps').insert({
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
        view_type: originalMap.view_type,
      }).select().single();

      if (error) throw error;

      // If multi-view, duplicate the product_views as well
      if (originalMap.view_type === 'multi' && newMap) {
        const { data: originalViews } = await supabase
          .from('product_views')
          .select('*')
          .eq('map_id', id)
          .order('order_index', { ascending: true });

        if (originalViews && originalViews.length > 0) {
          const newViews = originalViews.map((view, index) => ({
            map_id: (newMap as { id: string }).id,
            title: (view as { title: string }).title,
            slug: (view as { slug: string }).slug,
            order_index: index,
            nodes: (view as { nodes: unknown }).nodes,
            edges: (view as { edges: unknown }).edges,
          }));

          // @ts-ignore - Supabase type inference issue
          await supabase.from('product_views').insert(newViews);
        }
      }

      toast.success('Map duplicated successfully');
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to duplicate map: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const maxViews = Math.max(...analytics.recentViews.map(v => v.count), 1);
  const multiViewCount = maps.filter(m => m.view_type === 'multi').length;
  const singleViewCount = maps.filter(m => m.view_type === 'single').length;

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
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 mb-6">
          {/* Total Maps */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Maps</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{analytics.totalMaps}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{singleViewCount} single</span>
                  <span>•</span>
                  <span>{multiViewCount} multi</span>
                </div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <MapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{analytics.totalViews}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Multi-View Maps */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Multi-View Maps</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{multiViewCount}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Most Popular Map */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Most Popular</p>
                {analytics.mostPopularMap ? (
                  <>
                    <Link
                      href={`/editor/maps/${analytics.mostPopularMap.id}`}
                      className="text-sm sm:text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block"
                    >
                      {analytics.mostPopularMap.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics.mostPopularMap.view_count} views
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No views yet</p>
                )}
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center ml-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Views Chart */}
        {analytics.recentViews.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
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
                      className="bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 transition-colors rounded-t"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-1.5 px-2.5 whitespace-nowrap shadow-lg">
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
        {maps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <MapIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No maps yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first documentation map to get started.</p>
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Create Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {maps.map((map) => (
              <MapItem
                key={map.id}
                map={map}
                viewCount={viewCounts[map.id]}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

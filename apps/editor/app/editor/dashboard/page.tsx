import { createServerClient } from '@docmaps/auth/server';
import { EditorNav } from '@/components/editor-nav';
import { DashboardClient } from './dashboard-client';
import Link from 'next/link';
import type { Map as MapType } from '@docmaps/database';

export default async function DashboardPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profileData = profile as { display_name?: string; avatar_url?: string } | null;

  const { data: maps, error } = await supabase
    .from('maps')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Cast to proper type
  const typedMaps = (maps || []) as MapType[];

  // Calculate analytics
  const totalMaps = typedMaps.length;
  const totalViews = typedMaps.reduce((sum, map) => sum + (map.view_count || 0), 0);
  const mostPopularMap = typedMaps.length > 0 
    ? typedMaps.reduce((prev, current) => 
        (current.view_count > prev.view_count) ? current : prev
      , typedMaps[0])
    : null;

  // Fetch recent views activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const mapIds = typedMaps.map(m => m.id);
  let recentViews: Array<{ viewed_at: string; count: number }> = [];

  if (mapIds.length > 0) {
    const { data: viewsData } = await supabase
      .from('map_views')
      .select('viewed_at')
      .in('map_id', mapIds)
      .gte('viewed_at', thirtyDaysAgo.toISOString())
      .order('viewed_at', { ascending: true });

    // Group views by date
    const viewsByDate: Record<string, number> = {};
    (viewsData || []).forEach((view: any) => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    recentViews = Object.entries(viewsByDate).map(([date, count]) => ({
      viewed_at: date,
      count,
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorNav 
        userEmail={user.email || ''} 
        displayName={profileData?.display_name}
        avatarUrl={profileData?.avatar_url}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Overview of your documentation maps and analytics
            </p>
          </div>
          <Link
            href="/editor/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Create Map
          </Link>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-800">Failed to load maps: {error.message}</p>
          </div>
        )}

        {maps && maps.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No maps yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first documentation map
            </p>
            <Link
              href="/editor/new"
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Create Map
            </Link>
          </div>
        ) : (
          <DashboardClient 
            maps={typedMaps}
            analytics={{
              totalMaps,
              totalViews,
              mostPopularMap,
              recentViews,
            }}
          />
        )}
      </main>
    </div>
  );
}

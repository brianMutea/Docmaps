import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { MapViewer } from '@/components/map-viewer';
import { ViewTracker } from '@/components/view-tracker';
import type { Map as MapType } from '@docmaps/database';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function MapViewerPage({ params }: PageProps) {
  const supabase = createServerClient();

  // Fetch the map
  const { data: map, error } = await supabase
    .from('maps')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (error || !map) {
    notFound();
  }

  // Get current user (if authenticated)
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      {/* @ts-ignore - Type issue with map.id */}
      <ViewTracker mapId={map.id} userId={user?.id || null} mapSlug={map.slug} />
      <MapViewer map={map as MapType} />
    </>
  );
}

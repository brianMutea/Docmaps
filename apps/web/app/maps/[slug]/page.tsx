import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { SingleMapViewer } from '@/components/viewers/single-map-viewer';
import { MultiMapViewer } from '@/components/viewers/multi-map-viewer';
import { ViewTracker } from '@/components/view-tracker';
import type { Map as MapType, ProductView } from '@docmaps/database';

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

  const mapData = map as MapType;

  // Get current user (if authenticated)
  const { data: { user } } = await supabase.auth.getUser();

  // For multi-view maps, fetch associated product_views
  if (mapData.view_type === 'multi') {
    const { data: productViews, error: viewsError } = await supabase
      .from('product_views')
      .select('*')
      .eq('map_id', mapData.id)
      .order('order_index', { ascending: true });

    // If no views or error, fall back to single view
    if (viewsError || !productViews || productViews.length === 0) {
      return (
        <>
          <ViewTracker mapId={mapData.id} userId={user?.id || null} mapSlug={mapData.slug} />
          <SingleMapViewer map={mapData} />
        </>
      );
    }

    return (
      <>
        <ViewTracker mapId={mapData.id} userId={user?.id || null} mapSlug={mapData.slug} />
        <MultiMapViewer map={mapData} views={productViews as ProductView[]} />
      </>
    );
  }

  // Single view maps
  return (
    <>
      <ViewTracker mapId={mapData.id} userId={user?.id || null} mapSlug={mapData.slug} />
      <SingleMapViewer map={mapData} />
    </>
  );
}

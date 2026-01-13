import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { SingleMapViewer } from '@/components/viewers/single-map-viewer';
import { MultiMapViewer } from '@/components/viewers/multi-map-viewer';
import { ViewTracker } from '@/components/view-tracker';
import type { Map as MapType, ProductView } from '@docmaps/database';

interface EmbedPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
  const { slug } = await params;
  const { view: viewSlug } = await searchParams;
  const supabase = createServerClient();

  // Fetch the map
  const { data: map, error } = await supabase
    .from('maps')
    .select('*')
    .eq('slug', slug)
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
        <div className="h-screen w-full overflow-hidden">
          <ViewTracker mapId={mapData.id} userId={user?.id || null} mapSlug={mapData.slug} />
          <SingleMapViewer map={mapData} embedded={true} />
        </div>
      );
    }

    // Find initial view index based on view query parameter
    const initialViewIndex = viewSlug 
      ? (productViews as ProductView[]).findIndex(v => v.slug === viewSlug)
      : 0;

    return (
      <div className="h-screen w-full overflow-hidden">
        <ViewTracker mapId={mapData.id} userId={user?.id || null} mapSlug={mapData.slug} />
        <MultiMapViewer 
          map={mapData} 
          views={productViews as ProductView[]} 
          embedded={true}
          initialViewIndex={initialViewIndex >= 0 ? initialViewIndex : 0}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <ViewTracker mapId={mapData.id} userId={user?.id || null} mapSlug={mapData.slug} />
      <SingleMapViewer map={mapData} embedded={true} />
    </div>
  );
}

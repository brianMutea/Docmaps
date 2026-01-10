import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { CanvasEditor } from '@/components/canvas-editor';
import { MultiViewEditor } from '@/components/editors/multi-view-editor';
import type { Map as MapType, ProductView } from '@docmaps/database';

export default async function MapEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: map, error } = await supabase
    .from('maps')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !map) {
    redirect('/editor/dashboard');
  }

  // Check ownership
  const mapData = map as MapType;
  if (mapData.user_id !== user.id) {
    redirect('/editor/dashboard');
  }

  // For multi-view maps, fetch associated product_views
  if (mapData.view_type === 'multi') {
    const { data: productViews, error: viewsError } = await supabase
      .from('product_views')
      .select('*')
      .eq('map_id', params.id)
      .order('order_index', { ascending: true });

    // Pass empty array if no views - MultiViewEditor handles empty state
    const views = viewsError ? [] : (productViews as ProductView[] || []);

    return (
      <MultiViewEditor 
        map={mapData} 
        initialViews={views} 
      />
    );
  }

  // Single view maps use the existing CanvasEditor (backward compatible)
  return <CanvasEditor map={mapData} />;
}

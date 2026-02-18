import { redirect } from 'next/navigation';
import { createServerClient } from '@docmaps/auth/server';
import { UnifiedEditor } from '@/components/editors/unified-editor';
import { GenerationSuccessBanner } from '@/components/generation-success-banner';
import type { Map as MapType, ProductView } from '@docmaps/database';

export default async function MapEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerClient();

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

    // Pass views to UnifiedEditor - it handles empty state
    const views = viewsError ? [] : (productViews as ProductView[] || []);

    return (
      <>
        <GenerationSuccessBanner />
        <UnifiedEditor 
          map={mapData} 
          initialViews={views} 
        />
      </>
    );
  }

  // Single view maps - no views passed
  return (
    <>
      <GenerationSuccessBanner />
      <UnifiedEditor map={mapData} />
    </>
  );
}

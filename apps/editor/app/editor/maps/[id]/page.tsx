import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { CanvasEditor } from '@/components/canvas-editor';

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
  if (map.user_id !== user.id) {
    redirect('/editor/dashboard');
  }

  return <CanvasEditor map={map} />;
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the original map
    const { data: originalMap, error: fetchError } = await supabase
      .from('maps')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !originalMap) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    // Generate new slug
    // @ts-ignore - Type inference issue
    const newSlug = `${originalMap.slug}-copy-${Date.now()}`;

    // @ts-ignore - Supabase type inference issue with JSONB columns
    const { data: newMap, error: insertError } = await supabase
      .from('maps')
      // @ts-ignore - Type inference issue
      .insert({
        user_id: user.id,
        // @ts-ignore - Type inference issue
        title: `${originalMap.title} (Copy)`,
        // @ts-ignore - Type inference issue
        product_name: originalMap.product_name,
        // @ts-ignore - Type inference issue
        product_url: originalMap.product_url,
        // @ts-ignore - Type inference issue
        description: originalMap.description,
        slug: newSlug,
        // @ts-ignore - Type inference issue
        nodes: originalMap.nodes,
        // @ts-ignore - Type inference issue
        edges: originalMap.edges,
        // @ts-ignore - Type inference issue
        metadata: originalMap.metadata,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to duplicate map' },
        { status: 500 }
      );
    }

    return NextResponse.json({ map: newMap }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating map:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

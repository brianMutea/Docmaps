import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { NewMapForm } from '@/components/new-map-form';
import { EditorNav } from '@/components/editor-nav';

export default async function NewMapPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profileData = profile as { display_name?: string; avatar_url?: string } | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorNav
        userEmail={user.email || ''}
        displayName={profileData?.display_name || null}
        avatarUrl={profileData?.avatar_url || null}
      />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Map</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Create a visual documentation map for a product or framework
          </p>
        </div>

        <NewMapForm userId={user.id} />
      </main>
    </div>
  );
}

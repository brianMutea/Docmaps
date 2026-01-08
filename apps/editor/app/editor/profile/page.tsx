import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { ProfileForm } from '@/components/profile-form';

export default async function ProfilePage() {
  const supabase = createServerClient();

  // Check authentication
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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>

      <ProfileForm user={user} profile={profile} />
    </div>
  );
}

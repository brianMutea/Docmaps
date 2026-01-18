import { redirect } from 'next/navigation';
import { createServerClient } from '@docmaps/auth/server';

export default async function Home() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/editor/dashboard');
  } else {
    redirect('/sign-in');
  }
}

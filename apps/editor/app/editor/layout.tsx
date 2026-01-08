import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { MobileWarning } from '@/components/mobile-warning';

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <MobileWarning />
      {children}
    </>
  );
}

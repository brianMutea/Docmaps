import { createServerClient } from '@docmaps/auth/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after successful OAuth
  return NextResponse.redirect(new URL('/editor/dashboard', request.url));
}

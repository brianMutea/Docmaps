import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@docmaps/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  // Use default cookie handling - Supabase SSR handles persistence automatically
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

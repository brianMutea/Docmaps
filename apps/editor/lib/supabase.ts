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

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Get cookie from document.cookie
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
      },
      set(name: string, value: string, options: any) {
        // Set cookie with proper options for persistence
        document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
      },
      remove(name: string, options: any) {
        // Remove cookie
        document.cookie = `${name}=; path=/; max-age=0`;
      },
    },
  });
}

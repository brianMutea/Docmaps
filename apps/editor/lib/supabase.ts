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
      getAll() {
        return document.cookie.split(';').map((cookie) => {
          const [name, ...rest] = cookie.trim().split('=');
          return { name, value: rest.join('=') };
        });
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: any }>
      ) {
        try {
          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }: {
              name: string;
              value: string;
              options?: any;
            }) => {
              const maxAge = options?.maxAge ?? 31536000; // 1 year default
              const sameSite = options?.sameSite ?? 'lax';
              const secure = options?.secure ? 'secure' : '';
              document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=${sameSite}; ${secure}`;
            }
          );
        } catch (error) {
          // Cookie setting can fail in some contexts, log but don't throw
          console.error('Error setting cookies:', error);
        }
      },
    },
  });
}

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string
) {
  return createClient<Database>(supabaseUrl, supabaseKey);
}

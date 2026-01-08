import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@docmaps/database';

export function createClient() {
  return createClientComponentClient<Database>();
}

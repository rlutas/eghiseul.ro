import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Public client for anonymous queries (no auth context)
// Use this for public data like services catalog
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

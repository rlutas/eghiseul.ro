/**
 * Read-only Supabase client for the cazierjudiciaronline.com database.
 *
 * Used ONLY by the payout reconciliation (Decontări) to enrich Stripe
 * transactions belonging to CJO orders with their Oblio invoice + client
 * info. Same cross-project pattern as REGISTRY_SUPABASE_* in the CJO repo.
 *
 * Env: CJO_SUPABASE_URL + CJO_SUPABASE_SERVICE_KEY. When missing, returns
 * null and the sync leaves CJO rows as "unmatched" instead of failing.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null | undefined;

export function createCjoClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.CJO_SUPABASE_URL;
  const key = process.env.CJO_SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.warn('[supabase/cjo] CJO_SUPABASE_URL / CJO_SUPABASE_SERVICE_KEY not set — CJO enrichment disabled');
    cached = null;
    return cached;
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

/**
 * isInvoicingEnabled — reads the admin toggle that turns automatic Oblio invoice
 * emission on/off (Settings → Plăți → Oblio).
 *
 * Why: in test/staging we don't want a real Oblio invoice created for every paid
 * order (they have to be deleted afterwards). This flag lets an admin pause
 * automatic invoicing without touching env vars or code.
 *
 * Fail-safe: defaults to TRUE when the setting row is missing or the read fails,
 * so we never silently stop invoicing in production. The flag is stored in
 * `admin_settings` under key `invoicing` as `{ oblio_enabled: boolean }`.
 */

import { createAdminClient } from '@/lib/supabase/admin';

export async function isInvoicingEnabled(): Promise<boolean> {
  try {
    // admin_settings isn't in the generated Supabase types yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from('admin_settings')
      .select('value')
      .eq('key', 'invoicing')
      .maybeSingle();

    if (error) return true; // never block invoicing on a read error
    const value = data?.value as { oblio_enabled?: boolean } | null | undefined;
    // Missing row or missing flag → enabled (default). Only an explicit false disables.
    return value?.oblio_enabled !== false;
  } catch {
    return true;
  }
}

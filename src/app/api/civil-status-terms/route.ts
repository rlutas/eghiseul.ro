import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_CIVIL_TERM_TIERS } from '@/lib/civil-status/delivery-terms';

// ──────────────────────────────────────────────────────────────
// GET /api/civil-status-terms - Public read of civil-status delivery
// term tiers (config ne-sensibil; folosit de wizard + price-sidebar).
// Fallback la defaults dacă admin_settings lipsește.
// ──────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient: any = createAdminClient();
    const { data, error } = await adminClient
      .from('admin_settings')
      .select('value')
      .eq('key', 'civil_status_term_tiers')
      .maybeSingle();

    if (error || !data?.value) {
      return NextResponse.json({ success: true, data: DEFAULT_CIVIL_TERM_TIERS });
    }

    return NextResponse.json({ success: true, data: data.value });
  } catch {
    return NextResponse.json({ success: true, data: DEFAULT_CIVIL_TERM_TIERS });
  }
}

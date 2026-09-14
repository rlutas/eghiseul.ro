/**
 * GET /api/admin/marketing/lifecycle-stats
 * Câte emailuri de lifecycle au plecat (per tip, total + ultimele 30 zile) și
 * câte au eșuat permanent. Permission: settings.manage
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export const dynamic = 'force-dynamic';

const KINDS = ['review_request', 'expiry_reminder', 'cross_sell'] as const;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  // Un `from()` nou per interogare (postgrest-js mută URL-ul builder-ului).
  const count = () => admin.from('lifecycle_emails').select('id', { count: 'exact', head: true });

  const data: Record<string, { sent: number; sent30d: number; failed: number }> = {};
  for (const kind of KINDS) {
    const [{ count: sent }, { count: sent30d }, { count: failed }] = await Promise.all([
      count().eq('kind', kind).not('sent_at', 'is', null),
      count().eq('kind', kind).not('sent_at', 'is', null).gte('sent_at', since30),
      count().eq('kind', kind).not('failed_reason', 'is', null),
    ]);
    data[kind] = { sent: sent ?? 0, sent30d: sent30d ?? 0, failed: failed ?? 0 };
  }
  return NextResponse.json({ success: true, data });
}

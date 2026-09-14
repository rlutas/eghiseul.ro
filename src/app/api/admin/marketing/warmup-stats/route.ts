/**
 * GET /api/admin/marketing/warmup-stats
 * Progres campania de warm-up pe registrul de contacte (72k) — câți au primit
 * deja emailul de reactivare, câți rămân, câți s-au dezabonat.
 * Permission: settings.manage
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  // Un `from()` NOU per interogare: postgrest-js mută URL-ul builder-ului la
  // fiecare filtru, deci un builder refolosit ar cumula filtrele (toate cele
  // patru numere ar ieși identice).
  const count = () => admin.from('contacts').select('id', { count: 'exact', head: true });

  const [{ count: total }, { count: sent }, { count: skipped }, { count: unsubscribed }, { count: remaining }] =
    await Promise.all([
      count(),
      count().not('warmup_email_sent_at', 'is', null),
      count().not('warmup_skipped_at', 'is', null),
      count().eq('marketing_status', 'unsubscribed'),
      count()
        .is('warmup_email_sent_at', null)
        .is('warmup_skipped_at', null)
        .not('marketing_status', 'in', '(unsubscribed,suppressed)'),
    ]);

  return NextResponse.json({
    success: true,
    data: {
      total: total ?? 0,
      sent: sent ?? 0,
      skipped: skipped ?? 0,
      remaining: remaining ?? 0,
      unsubscribed: unsubscribed ?? 0,
    },
  });
}

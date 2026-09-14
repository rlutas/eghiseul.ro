import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { loadChangelog } from '@/lib/knowledge/docs';

/**
 * GET /api/admin/knowledge/feed — datele ultimelor livrări din changelog.
 * Alimentează badge-ul „noutăți" de pe „Ghid & noutăți" din meniul admin:
 * clientul numără intrările mai noi decât data reținută în localStorage.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requireAdmin(user.id);
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const entries = await loadChangelog({ limit: 60 });
    return NextResponse.json({
      success: true,
      data: {
        latest: entries[0]?.date ?? null,
        dates: entries.map((e) => e.date),
      },
    });
  } catch (err) {
    console.error('[knowledge/feed] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}

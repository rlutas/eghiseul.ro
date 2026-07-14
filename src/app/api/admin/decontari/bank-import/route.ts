/**
 * POST /api/admin/decontari/bank-import — upload extras de cont BT (CSV).
 * Body: raw CSV text (Content-Type: text/csv) sau multipart cu câmpul `file`.
 * Parsează, categorizează, potrivește creditele Stripe cu payout-urile.
 * Auth: payments.verify.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { importBankStatement } from '@/lib/accounting/bank-statement';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'payments.verify');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    let content = '';
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) {
        return NextResponse.json({ success: false, error: 'Lipsește fișierul (câmpul "file")' }, { status: 400 });
      }
      content = await file.text();
    } else {
      content = await request.text();
    }
    if (!content.trim()) {
      return NextResponse.json({ success: false, error: 'CSV gol' }, { status: 400 });
    }

    const result = await importBankStatement(content);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[admin/decontari] bank import failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

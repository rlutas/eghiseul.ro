import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { startWorkOnVerifiedProof } from '@/lib/orders/start-work-on-proof-run';

/**
 * POST /api/admin/orders/[id]/start-work — „Dovadă verificată — pornește
 * lucrul" pe o comandă cu transfer bancar care așteaptă încasarea.
 *
 * Comanda trece pe `processing` și primește documentele Barou; plata rămâne
 * `awaiting_verification` — factura, emailul de confirmare și joburile
 * ONRC/ANCPI pleacă tot la „Confirmă plata". Vezi
 * `src/lib/orders/start-work-on-proof.ts`.
 *
 * Body: { note?: string } — de unde a venit dovada (email / WhatsApp / upload).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = (await request.json().catch(() => ({}))) as { note?: string };
    const note = (body.note || '').trim().slice(0, 500) || undefined;

    const result = await startWorkOnVerifiedProof(orderId, { adminId: user.id, note });
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: { barou: result.barou } });
  } catch (err) {
    console.error('[start-work] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { fulfilManuallyPaidOrder } from '@/lib/orders/fulfil-paid';

/**
 * POST /api/admin/orders/[id]/mark-paid — plată manuală (transfer bancar /
 * cash) pentru comenzile telefonice. Referința e OBLIGATORIE (nr. tranzacție /
 * chitanță). Rulează același lanț de fulfilment ca webhook-ul Stripe
 * (factură Oblio cu collect corect, contact, confirmare, joburi, Barou).
 * Idempotent — al doilea apel pe o comandă plătită e no-op.
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

    const body = (await request.json()) as { method?: string; reference?: string };
    const method = body.method === 'cash' ? 'Cash' : body.method === 'transfer' ? 'Transfer bancar' : null;
    const reference = (body.reference || '').trim();

    if (!method) {
      return NextResponse.json({ success: false, error: 'Metoda de plată: transfer sau cash.' }, { status: 400 });
    }
    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Referința plății e obligatorie (nr. tranzacție / chitanță).' },
        { status: 400 }
      );
    }

    const result = await fulfilManuallyPaidOrder(orderId, {
      collect: method,
      reference,
      adminId: user.id,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    if (result.alreadyPaid) {
      return NextResponse.json({ success: false, error: 'Comanda este deja plătită.' }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[mark-paid] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}

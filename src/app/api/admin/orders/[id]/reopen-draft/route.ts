/**
 * POST /api/admin/orders/[id]/reopen-draft — trece o comandă TRIMISĂ și
 * NEPLĂTITĂ (pending/abandoned) înapoi pe ciornă și întoarce un link de
 * continuare (48h). Clientul sau operatorul reintră în formular, schimbă ce e
 * de schimbat (opțiuni, livrare), semnează și trimite din nou.
 *
 * Regulile stau în `src/lib/orders/reopen-draft.ts`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { stripe } from '@/lib/stripe';
import { reopenOrderAsDraft } from '@/lib/orders/reopen-draft';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const result = await reopenOrderAsDraft(createAdminClient(), orderId, user.id, {
      expireCheckoutSession: (sessionId) => stripe.checkout.sessions.expire(sessionId),
    });
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      success: true,
      data: { resumeUrl: result.resumeUrl, expiresAt: result.expiresAt },
    });
  } catch (error) {
    console.error('[reopen-draft] error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

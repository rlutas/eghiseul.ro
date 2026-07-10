import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';

/**
 * Sends an order to a collaborator (topograph) — or takes it back.
 * Used for identificare-imobil orders the internal team can't solve: the
 * collaborator then sees the order in /colaborator (per-order scope,
 * orders.assigned_collaborator_id, migration 108) and fulfils it as usual.
 *
 * POST body: { collaboratorId: string | null }  (null = un-assign)
 * Permission: orders.manage (manager/operator+).
 */
export async function POST(
  request: NextRequest,
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
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const body = await request.json().catch(() => ({}));
    const collaboratorId: string | null = body.collaboratorId ?? null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    if (collaboratorId) {
      const { data: prof } = await admin
        .from('profiles')
        .select('id, role')
        .eq('id', collaboratorId)
        .single();
      if (!prof || prof.role !== 'collaborator') {
        return NextResponse.json(
          { success: false, error: 'Utilizatorul selectat nu este colaborator' },
          { status: 400 }
        );
      }
    }

    const { data: order, error: updErr } = await admin
      .from('orders')
      .update({ assigned_collaborator_id: collaboratorId, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('id, friendly_order_id, services:service_id(name)')
      .single();
    if (updErr || !order) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    // Heads-up email to the collaborator (best effort — never blocks).
    if (collaboratorId) {
      try {
        const { data: authUser } = await admin.auth.admin.getUserById(collaboratorId);
        const email = authUser?.user?.email;
        if (email) {
          const friendly = order.friendly_order_id || orderId;
          await sendEmail({
            to: email,
            subject: `Comandă nouă alocată: ${friendly}`,
            html: `<p>Bună,</p><p>Ți-a fost alocată comanda <strong>${friendly}</strong> (${order.services?.name ?? ''}).</p><p>O găsești în portal: <a href="https://eghiseul.ro/colaborator/orders/${orderId}">deschide comanda</a>.</p>`,
            text: `Ți-a fost alocată comanda ${friendly} (${order.services?.name ?? ''}). O găsești la https://eghiseul.ro/colaborator/orders/${orderId}`,
            idempotencyKey: `collab-assign-${orderId}-${collaboratorId}`,
          });
        }
      } catch (e) {
        console.warn('[admin] collaborator assign email failed:', e);
      }
    }

    return NextResponse.json({ success: true, data: { assigned_collaborator_id: collaboratorId } });
  } catch (error) {
    console.error('[admin] assign-collaborator error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}

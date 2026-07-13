import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';
import { brandedEmailHtml, ctaButton, infoRows, escHtml } from '@/lib/email/templates/branded-layout';

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
          const serviceName = order.services?.name ?? '';
          const portalUrl = `https://eghiseul.ro/colaborator/orders/${orderId}`;
          // Branded shell (same visual language as the order emails) — the old
          // bare two-line HTML looked broken and landed in Yahoo spam.
          const html = brandedEmailHtml({
            preheader: `Comandă nouă de lucrat: ${friendly} — ${serviceName}`,
            content: `
        <h1 style="margin:0 0 6px;color:#0B1B33;font-size:20px;">Comandă nouă alocată</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Salut! Ți-a fost alocată o comandă nouă în portalul de colaborator.</p>
        ${infoRows([
          { label: 'Comandă', value: friendly, mono: true },
          { label: 'Serviciu', value: escHtml(serviceName) },
        ])}
        <p style="margin:18px 0 0;color:#475569;font-size:14px;line-height:1.6;">Toate datele pentru lucrare (imobil, adresă, proprietar) sunt în portal:</p>
        ${ctaButton('Deschide comanda', portalUrl)}`,
          });
          await sendEmail({
            to: email,
            subject: `Comandă nouă alocată: ${friendly} — ${serviceName}`,
            html,
            text: `Salut! Ți-a fost alocată comanda ${friendly} (${serviceName}). Toate datele pentru lucrare sunt în portal: ${portalUrl}`,
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

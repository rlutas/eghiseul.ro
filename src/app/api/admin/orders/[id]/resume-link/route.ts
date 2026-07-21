/**
 * POST /api/admin/orders/[id]/resume-link — generează link de continuare pe un
 * DRAFT (token opac, 48h). Operatorul îl trimite clientului blocat; linkul
 * hidratează formularul cu datele de pe server indiferent de email — acoperă și
 * clienții opriți înainte de pasul contact (fără email salvat).
 *
 * Pt pending/abandoned NU e nevoie de token — continuarea e pagina de checkout.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

const TOKEN_TTL_HOURS = 48;

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

    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order } = await (adminClient as any)
      .from('orders')
      .select('id, friendly_order_id, status, services(slug)')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită' }, { status: 404 });
    }
    if (order.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Linkul cu token e doar pentru ciorne. Pentru pending/abandonate folosește pagina de checkout.' },
        { status: 409 }
      );
    }

    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updErr } = await (adminClient as any)
      .from('orders')
      .update({ resume_token: token, resume_token_expires_at: expiresAt.toISOString() })
      .eq('id', orderId)
      .eq('status', 'draft');
    if (updErr) {
      console.error('[resume-link] update failed:', updErr);
      return NextResponse.json({ success: false, error: 'Nu am putut genera linkul' }, { status: 500 });
    }

    const slug = (Array.isArray(order.services) ? order.services[0]?.slug : order.services?.slug) || 'cazier-judiciar';
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
    const resumeUrl = `${base}/comanda/${slug}?resume=${token}`;

    // Audit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any).from('order_history').insert({
      order_id: orderId,
      changed_by: user.id,
      event_type: 'resume_link_generated',
      notes: `Link de continuare generat (valabil ${TOKEN_TTL_HOURS}h)`,
    });

    return NextResponse.json({
      success: true,
      data: { resumeUrl, expiresAt: expiresAt.toISOString() },
    });
  } catch (error) {
    console.error('[resume-link] error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

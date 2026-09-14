/**
 * POST /api/admin/marketing/campaigns/[id]/test
 * Trimite campania (așa cum ar pleca) pe adresa adminului curent — sau pe
 * `{ to }` din body — fără să atingă jurnalul de trimiteri. Link de
 * dezabonare fictiv (nu există contact).
 *
 * Permission: settings.manage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';
import { renderCampaignEmail } from '@/lib/email/templates/campaign';
import { appBase } from '@/lib/lifecycle/contacts';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
  const { id } = await params;

  let to = user.email ?? '';
  try {
    const body = await request.json();
    if (typeof body?.to === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.to.trim())) to = body.to.trim();
  } catch {
    // body optional
  }
  if (!to) return NextResponse.json({ success: false, error: 'Nu am o adresă de test' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: c } = await admin.from('email_campaigns').select('subject, preheader, body_text, cta_label, cta_url').eq('id', id).maybeSingle();
  if (!c) return NextResponse.json({ success: false, error: 'Campania nu există' }, { status: 404 });

  const mail = renderCampaignEmail({
    subject: c.subject,
    preheader: c.preheader,
    bodyText: c.body_text,
    ctaLabel: c.cta_label,
    ctaUrl: c.cta_url,
    firstName: 'Test',
    unsubscribeUrl: `${appBase()}/api/contacts/unsubscribe?token=test`,
  });
  try {
    const res = await sendEmail({ to, subject: `[TEST] ${mail.subject}`, html: mail.html, text: mail.text });
    if (res.skipped) return NextResponse.json({ success: false, error: `Netrimis: ${res.reason}` }, { status: 503 });
    return NextResponse.json({ success: true, data: { to, id: res.id } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'send failed' }, { status: 502 });
  }
}

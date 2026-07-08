import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CONSENT_TEXT } from '@/lib/marketing/consent';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/newsletter — GDPR opt-in subscribe.
 * Body: { email, consent: true, source?, name? }
 * One row per email (case-insensitive): an existing address that re-consents
 * is reactivated (unsubscribed_at cleared, consent refreshed).
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string; consent?: boolean; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Cerere invalidă' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ success: false, error: 'Adresă de email invalidă' }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ success: false, error: 'Consimțământul este necesar' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null;
  const source = (body.source ?? 'calculator').slice(0, 120);
  const name = (body.name ?? '').trim().slice(0, 120) || null;

  // `newsletter_subscribers` nu e încă în tipurile generate Supabase — același
  // pattern ca în lib/onrc + record-outage.ts pentru tabele noi.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Case-insensitive one-row-per-email: update if it exists, insert otherwise.
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  const error = existing
    ? (
        await supabase
          .from('newsletter_subscribers')
          .update({
            consent: true,
            consent_text: CONSENT_TEXT,
            unsubscribed_at: null,
            source,
            ...(name ? { name } : {}),
            ...(ip ? { ip } : {}),
          })
          .eq('id', existing.id)
      ).error
    : (
        await supabase
          .from('newsletter_subscribers')
          .insert({ email, source, consent: true, name, consent_text: CONSENT_TEXT, ip })
      ).error;

  if (error) {
    console.error('[newsletter] save failed:', error.message);
    return NextResponse.json({ success: false, error: 'A apărut o eroare. Încearcă din nou.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

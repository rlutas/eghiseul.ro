import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string; consent?: boolean };
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

  // `newsletter_subscribers` nu e încă în tipurile generate Supabase — același
  // pattern ca în lib/onrc + record-outage.ts pentru tabele noi.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, source: (body.source ?? 'calculator').slice(0, 120), consent: true });

  // 23505 = unique violation → deja abonat, tratăm ca succes.
  if (error && error.code !== '23505') {
    console.error('[newsletter] insert failed:', error.message);
    return NextResponse.json({ success: false, error: 'A apărut o eroare. Încearcă din nou.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

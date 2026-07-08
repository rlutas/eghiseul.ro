import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/unsubscribe?token=<unsubscribe_token>
 *
 * One-click GDPR opt-out — the link embedded in every campaign email.
 * Marks unsubscribed_at (row is KEPT as proof of past consent) and renders a
 * tiny confirmation page in Romanian. Idempotent: a second click confirms too.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim() || '';

  const page = (title: string, body: string, ok: boolean) =>
    new NextResponse(
      `<!doctype html><html lang="ro"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title} — eGhișeul.ro</title>
<style>body{font-family:system-ui,sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:40px;max-width:440px;text-align:center;box-shadow:0 4px 16px rgba(6,16,31,.06)}
h1{font-size:20px;color:#0f172a;margin:0 0 8px}p{color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px}
a{display:inline-block;background:${ok ? '#ECB95F' : '#e2e8f0'};color:#0f172a;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:10px;font-size:14px}</style>
</head><body><div class="card"><h1>${title}</h1><p>${body}</p><a href="https://eghiseul.ro/">Înapoi la eGhișeul.ro</a></div></body></html>`,
      { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  if (!token || token.length > 100) {
    return page('Link invalid', 'Linkul de dezabonare nu este valid. Dacă problema persistă, scrie-ne la contact@eghiseul.ro.', false);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: sub } = await supabase
    .from('newsletter_subscribers')
    .select('id, unsubscribed_at')
    .eq('unsubscribe_token', token)
    .maybeSingle();

  if (!sub) {
    return page('Link invalid', 'Linkul de dezabonare nu este valid sau a expirat. Scrie-ne la contact@eghiseul.ro și te dezabonăm manual.', false);
  }

  if (!sub.unsubscribed_at) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('id', sub.id);
    if (error) {
      console.error('[newsletter] unsubscribe failed:', error.message);
      return page('Eroare', 'Nu am putut procesa dezabonarea. Încearcă din nou sau scrie-ne la contact@eghiseul.ro.', false);
    }
  }

  return page(
    'Te-ai dezabonat',
    'Nu vei mai primi emailuri de marketing de la eGhișeul.ro. Emailurile despre comenzile tale active nu sunt afectate.',
    true
  );
}

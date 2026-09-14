import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/contacts/unsubscribe?token=<unsubscribe_token>
 *
 * Dezabonare cu un click pentru emailul de warm-up (`/api/cron/warmup-campaign`).
 * Diferit de `/api/newsletter/unsubscribe` — acela operează pe
 * `newsletter_subscribers` (opt-in explicit), acesta pe `contacts` (registrul
 * intern de 72k, populație separată). Rândul rămâne (dovadă), doar
 * `marketing_status` trece pe `unsubscribed`.
 */
export async function GET(req: NextRequest) {
  return handleUnsubscribe(req);
}

// RFC 8058 one-click: clienții de mail (Gmail/Yahoo) trimit POST cu body
// `List-Unsubscribe=One-Click` pe URL-ul din header-ul List-Unsubscribe.
// Token-ul e în query, la fel ca la GET.
export async function POST(req: NextRequest) {
  return handleUnsubscribe(req);
}

async function handleUnsubscribe(req: NextRequest) {
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
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, marketing_status')
    .eq('unsubscribe_token', token)
    .maybeSingle();

  if (!contact) {
    return page('Link invalid', 'Linkul de dezabonare nu este valid sau a expirat. Scrie-ne la contact@eghiseul.ro și te dezabonăm manual.', false);
  }

  if (contact.marketing_status !== 'unsubscribed') {
    const { error } = await supabase
      .from('contacts')
      .update({ marketing_status: 'unsubscribed' })
      .eq('id', contact.id);
    if (error) {
      console.error('[contacts] unsubscribe failed:', error.message);
      return page('Eroare', 'Nu am putut procesa dezabonarea. Încearcă din nou sau scrie-ne la contact@eghiseul.ro.', false);
    }
  }

  return page(
    'Te-ai dezabonat',
    'Nu vei mai primi emailuri de marketing de la eGhișeul.ro. Emailurile despre comenzile tale active nu sunt afectate.',
    true
  );
}

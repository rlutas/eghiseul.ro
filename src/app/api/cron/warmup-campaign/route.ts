/**
 * POST /api/cron/warmup-campaign
 *
 * Trimite un email de reactivare, o singură dată per contact, către
 * registrul intern de 72k contacte (`contacts` — majoritatea lead-uri
 * WPForms de pe eghiseul.ro vechi, niciodată contactate de marketing).
 * Decizie de business 2026-09-14: consimțământul a fost dat pe site-ul
 * vechi, se trimite la toți — dar treptat, câțiva pe zi, nu într-un singur
 * val (deliverability pe o listă rece — vezi
 * `docs/marketing/email-marketing-plan-2026-09.md`).
 *
 * Volumul zilnic e controlat din `admin_settings.warmup_campaign`
 * (`{ enabled: boolean, dailyBatchSize: number }`, editabil din
 * `/admin/marketing`). **Implicit `enabled: false`** — pornește doar după
 * ce echipa a revizuit conținutul emailului. Cronul rulează oricum zilnic
 * (vezi `vercel.json`) dar iese imediat dacă e dezactivat.
 *
 * Fiecare contact iese din coadă într-un singur fel: `warmup_email_sent_at`
 * (trimis) sau `warmup_skipped_at` + motiv (sărit definitiv: fără email,
 * domeniu nelivrabil, adresă de test, Resend respinge adresa). Fără marcarea
 * skip-urilor, un contact prost la capul cozii FIFO ar bloca batch-ul zilnic
 * la infinit. Erorile tranzitorii (429/5xx, rețea) rămân nemarcate — retry
 * mâine.
 *
 * Authentication: `CRON_SECRET` în header `Authorization: Bearer ...`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, ResendError } from '@/lib/email/resend';
import { buildWarmupSubject, buildWarmupHtml, buildWarmupText } from '@/lib/email/templates/warmup-reengagement';
import { TEST_EMAILS, isUndeliverable } from '@/lib/email/deliverability';

// Resend: 2 req/s pe cont. Pauza asta ține cronul sub limită indiferent de
// mărimea batch-ului; la 300 s de rulare încap ~400 trimiteri, restul se
// reia mâine (fiecare contact e marcat imediat după trimitere).
export const maxDuration = 300;
const SEND_SPACING_MS = 600;

const DEFAULT_SETTINGS = { enabled: false, dailyBatchSize: 25 };

// Slug-uri reale din `contacts.services` (interogat 2026-09-14). Ce lipsește
// cade pe slug-ul cu cratime înlocuite — acceptabil, dar fără diacritice.
const SERVICE_LABELS: Record<string, string> = {
  'cazier-judiciar': 'cazier judiciar',
  'cazier-judiciar-persoana-fizica': 'cazier judiciar',
  'cazier-judiciar-persoana-juridica': 'cazier judiciar (firmă)',
  'extras-carte-funciara': 'extras de carte funciară',
  'certificat-nastere': 'certificat de naștere',
  'certificat-casatorie': 'certificat de căsătorie',
  'certificat-celibat': 'certificat de celibat',
  'extras-multilingv-certificat-nastere': 'extras multilingv de naștere',
  'extras-multilingv-certificat-casatorie': 'extras multilingv de căsătorie',
  'certificat-constatator': 'certificat constatator',
  'certificat-integritate': 'certificat de integritate comportamentală',
  'cazier-fiscal': 'cazier fiscal',
  'cazier-auto': 'cazier auto',
  'identificare-imobil': 'identificare imobil',
  'identificare-imobile-proprietar': 'identificare imobile după proprietar',
  'extras-plan-cadastral': 'extras de plan cadastral',
  'plan-amplasament-delimitare': 'plan de amplasament și delimitare',
  'copie-carte-funciara': 'copie de carte funciară',
  'copie-inventar-coordonate': 'inventar de coordonate',
};

function serviceHint(slug: string | null): string | null {
  if (!slug) return null;
  return SERVICE_LABELS[slug] ?? slug.replace(/-/g, ' ');
}

function appBase(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Outcome = { contactId: string; status: 'sent' | 'skipped' | 'error'; reason?: string };

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: settingsRow } = await admin
    .from('admin_settings')
    .select('value')
    .eq('key', 'warmup_campaign')
    .maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(settingsRow?.value ?? {}) };

  if (!settings.enabled) {
    return NextResponse.json({
      success: true,
      data: { sentCount: 0, skippedCount: 0, reason: 'disabled', processedAt: new Date().toISOString() },
    });
  }

  const batchSize = Math.min(2000, Math.max(1, Number(settings.dailyBatchSize) || DEFAULT_SETTINGS.dailyBatchSize));

  // Ordine FIFO după `first_seen_at`; 99% din import nu are valoarea (NULL),
  // deci `created_at` face ordinea deterministă între rulări.
  const { data: candidates, error: fetchError } = await admin
    .from('contacts')
    .select('id, email, first_name, services, unsubscribe_token')
    .is('warmup_email_sent_at', null)
    .is('warmup_skipped_at', null)
    .not('marketing_status', 'in', '(unsubscribed,suppressed)')
    .order('first_seen_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (fetchError) {
    console.error('[warmup-campaign] fetch failed:', fetchError);
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({
      success: true,
      data: { sentCount: 0, skippedCount: 0, reason: 'no candidates left', processedAt: new Date().toISOString() },
    });
  }

  // Un `from('contacts')` NOU la fiecare scriere: builder-ul postgrest-js își
  // mută URL-ul la fiecare filtru, deci refolosirea celui de la SELECT ar
  // cumula `id=eq.A&id=eq.B...` și ar marca doar primul contact din batch.
  const markSkipped = async (contactId: string, reason: string) => {
    await admin
      .from('contacts')
      .update({ warmup_skipped_at: new Date().toISOString(), warmup_skip_reason: reason })
      .eq('id', contactId);
  };
  const markSent = async (contactId: string) => {
    await admin.from('contacts').update({ warmup_email_sent_at: new Date().toISOString() }).eq('id', contactId);
  };

  // Nu există claim atomic înainte de trimitere — două rulări suprapuse
  // (retry Vercel, trigger manual peste cron) ar putea alege același contact
  // nesunat. Protecție reală: `idempotencyKey: warmup-<id>` trimis la Resend
  // (vezi `sendEmail`), care deduplichează trimiterea efectivă.
  const results: Outcome[] = [];

  for (const contact of candidates) {
    const email = (contact.email ?? '').trim();
    const skipReason = !email
      ? 'no email'
      : TEST_EMAILS.has(email.toLowerCase())
        ? 'test email'
        : isUndeliverable(email)
          ? 'undeliverable domain'
          : null;
    if (skipReason) {
      await markSkipped(contact.id, skipReason);
      results.push({ contactId: contact.id, status: 'skipped', reason: skipReason });
      continue;
    }

    const unsubscribeUrl = `${appBase()}/api/contacts/unsubscribe?token=${contact.unsubscribe_token}`;
    const payload = {
      firstName: contact.first_name ?? null,
      serviceHint: serviceHint((contact.services ?? [])[0] ?? null),
      unsubscribeUrl,
    };

    try {
      const sendRes = await sendEmail({
        to: email,
        subject: buildWarmupSubject(payload),
        html: buildWarmupHtml(payload),
        text: buildWarmupText(payload),
        idempotencyKey: `warmup-${contact.id}`,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      if (sendRes.skipped) {
        // Resend neconfigurat — nu marca, retry la următoarea rulare.
        results.push({ contactId: contact.id, status: 'skipped', reason: sendRes.reason });
        continue;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'send failed';
      // 4xx (fără 429) = Resend a respins adresa/cererea; nu se va repara
      // singur mâine, ieși din coadă. 429/5xx/rețea = retry.
      if (err instanceof ResendError && err.status >= 400 && err.status < 500 && err.status !== 429) {
        await markSkipped(contact.id, `resend rejected: ${message.slice(0, 200)}`);
        results.push({ contactId: contact.id, status: 'skipped', reason: message });
      } else {
        results.push({ contactId: contact.id, status: 'error', reason: message });
      }
      await sleep(SEND_SPACING_MS);
      continue;
    }

    await markSent(contact.id);
    results.push({ contactId: contact.id, status: 'sent' });
    await sleep(SEND_SPACING_MS);
  }

  return NextResponse.json({
    success: true,
    data: {
      sentCount: results.filter((r) => r.status === 'sent').length,
      skippedCount: results.filter((r) => r.status === 'skipped').length,
      errorCount: results.filter((r) => r.status === 'error').length,
      dailyBatchSize: batchSize,
      processedAt: new Date().toISOString(),
      results,
    },
  });
}

// Vercel Cron invocă rutele cu GET — fără acest passthrough programarea nu
// ar porni niciodată (aceeași capcană descoperită la recovery-emails).
export async function GET(request: NextRequest) {
  return POST(request);
}

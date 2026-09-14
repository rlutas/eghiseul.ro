/**
 * POST /api/cron/email-campaigns — zilnic (vezi vercel.json)
 *
 * Trimite campaniile manuale din `email_campaigns` (status `sending`) în
 * tranșe zilnice (`daily_batch_size`), parcurgând registrul `contacts` cu un
 * cursor keyset (created_at, id) salvat pe campanie — un contact e citit o
 * singură dată, indiferent dacă i s-a trimis sau a fost sărit.
 *
 * Segmente: `customers` (is_customer), `subscribed` (opt-in explicit),
 * `all_contacts`. Toate exclud `unsubscribed`/`suppressed`, adresele de test
 * și domeniile nelivrabile. Jurnal per destinatar în `email_campaign_sends`
 * (PK campaign_id+contact_id = claim; 23505 = deja trimis).
 *
 * Auth: CRON_SECRET (Bearer).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, ResendError } from '@/lib/email/resend';
import { TEST_EMAILS, isUndeliverable } from '@/lib/email/deliverability';
import { listUnsubscribeHeaders } from '@/lib/email/templates/marketing-footer';
import { renderCampaignEmail } from '@/lib/email/templates/campaign';
import { appBase } from '@/lib/lifecycle/contacts';

export const maxDuration = 300;
const SEND_SPACING_MS = 600;
const MAX_PER_RUN = 400; // ~4 min la 600 ms; restul mâine

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Campaign {
  id: string;
  subject: string;
  preheader: string | null;
  body_text: string;
  cta_label: string | null;
  cta_url: string | null;
  segment: 'customers' | 'subscribed' | 'all_contacts';
  daily_batch_size: number;
  sent_count: number;
  cursor_created_at: string | null;
  cursor_id: string | null;
}

interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  unsubscribe_token: string;
  created_at: string;
}

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

  const { data: campaigns, error } = await admin
    .from('email_campaigns')
    .select('id, subject, preheader, body_text, cta_label, cta_url, segment, daily_batch_size, sent_count, cursor_created_at, cursor_id')
    .eq('status', 'sending')
    .order('started_at', { ascending: true });
  if (error) {
    console.error('[email-campaigns] fetch failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({ success: true, data: { reason: 'no campaigns sending', campaigns: [], processedAt: new Date().toISOString() } });
  }

  let budget = MAX_PER_RUN;
  const summary: Array<{ campaignId: string; sent: number; skipped: number; errors: number; done: boolean }> = [];

  for (const c of campaigns as Campaign[]) {
    const batch = Math.min(c.daily_batch_size, budget);
    if (batch <= 0) break;

    // Keyset: (created_at, id) > (cursor_created_at, cursor_id). Un `from()`
    // nou pentru fiecare interogare — builder-ul postgrest-js nu se refolosește.
    let q = admin
      .from('contacts')
      .select('id, email, first_name, unsubscribe_token, created_at')
      .not('marketing_status', 'in', '(unsubscribed,suppressed)')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(batch);
    if (c.segment === 'customers') q = q.eq('is_customer', true);
    if (c.segment === 'subscribed') q = q.eq('marketing_status', 'subscribed');
    if (c.cursor_created_at && c.cursor_id) {
      q = q.or(`created_at.gt.${c.cursor_created_at},and(created_at.eq.${c.cursor_created_at},id.gt.${c.cursor_id})`);
    }
    const { data: contacts, error: cErr } = await q;
    if (cErr) {
      console.error('[email-campaigns] contacts fetch failed:', cErr);
      summary.push({ campaignId: c.id, sent: 0, skipped: 0, errors: 1, done: false });
      continue;
    }

    let sent = 0;
    let skipped = 0;
    let errors = 0;
    let last: Contact | null = null;

    for (const contact of (contacts ?? []) as Contact[]) {
      last = contact;
      const email = (contact.email ?? '').trim().toLowerCase();
      if (!email || TEST_EMAILS.has(email) || isUndeliverable(email)) {
        skipped += 1;
        continue;
      }
      const { error: claimErr } = await admin.from('email_campaign_sends').insert({ campaign_id: c.id, contact_id: contact.id });
      if (claimErr) {
        skipped += 1; // 23505 = deja trimis (rulare suprapusă)
        continue;
      }
      const unsubscribeUrl = `${appBase()}/api/contacts/unsubscribe?token=${contact.unsubscribe_token}`;
      try {
        const mail = renderCampaignEmail({
          subject: c.subject,
          preheader: c.preheader,
          bodyText: c.body_text,
          ctaLabel: c.cta_label,
          ctaUrl: c.cta_url,
          firstName: contact.first_name,
          unsubscribeUrl,
        });
        const res = await sendEmail({
          to: email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          idempotencyKey: `campaign-${c.id}-${contact.id}`,
          headers: listUnsubscribeHeaders(unsubscribeUrl),
        });
        if (res.skipped) {
          await admin.from('email_campaign_sends').delete().eq('campaign_id', c.id).eq('contact_id', contact.id);
          skipped += 1;
          continue;
        }
        await admin
          .from('email_campaign_sends')
          .update({ sent_at: new Date().toISOString() })
          .eq('campaign_id', c.id)
          .eq('contact_id', contact.id);
        sent += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'send failed';
        const permanent = err instanceof ResendError && err.status >= 400 && err.status < 500 && err.status !== 429;
        if (permanent) {
          await admin
            .from('email_campaign_sends')
            .update({ failed_reason: message.slice(0, 300) })
            .eq('campaign_id', c.id)
            .eq('contact_id', contact.id);
        } else {
          await admin.from('email_campaign_sends').delete().eq('campaign_id', c.id).eq('contact_id', contact.id);
        }
        errors += 1;
      } finally {
        await sleep(SEND_SPACING_MS);
      }
    }

    budget -= sent + errors;
    const done = (contacts ?? []).length < batch;
    // Cursorul avansează doar peste contactele parcurse; la eroare tranzitorie
    // ultimul contact rămâne nesemnat (claim șters) — dar cursorul l-a depășit.
    // Acceptat: campania e newsletter, nu tranzacțional.
    const patch: Record<string, unknown> = {
      sent_count: c.sent_count + sent,
      updated_at: new Date().toISOString(),
      ...(last ? { cursor_created_at: last.created_at, cursor_id: last.id } : {}),
      ...(done ? { status: 'done', finished_at: new Date().toISOString() } : {}),
    };
    await admin.from('email_campaigns').update(patch).eq('id', c.id);
    summary.push({ campaignId: c.id, sent, skipped, errors, done });
  }

  return NextResponse.json({ success: true, data: { campaigns: summary, processedAt: new Date().toISOString() } });
}

export async function GET(request: NextRequest) {
  return POST(request);
}

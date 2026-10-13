/**
 * GET/POST /api/cron/reengage-orders — plan B10 (Raul, 13.10.2026)
 *
 * „Mai ai nevoie de …?": ONE email, no coupon, to eghiseul clients whose
 * order stayed unpaid 7–60 days ago. Rules and caps: `src/lib/orders/reengage.ts`.
 * Hourly 10:05–18:05 RO (07–15 UTC in summer time), ≤15 per run, ≤90 per 24 h,
 * stops by itself after 500 (test, measured via utm_campaign=reengage-order).
 *
 * The send log is `order_history` (`event_type='recovery_email_sent'`,
 * `changed_by='system-reengage'`): no new column. The row is written BEFORE
 * the send (claim) and removed if the send fails, so a failed send is retried
 * and a sent one never repeats. Resend's idempotency key covers overlapping runs.
 *
 * `?dry=1` returns who WOULD get it now plus the pool size, sends nothing.
 * Auth: CRON_SECRET (Bearer). Vercel Cron calls with GET → passthrough.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import { renderReengageOrderEmail } from '@/lib/email/templates/reengage-order';
import { listUnsubscribeHeaders } from '@/lib/email/templates/marketing-footer';
import { TEST_EMAILS, isSuspiciousEmail, isUndeliverable } from '@/lib/email/deliverability';
import { buildResumeUrl } from '@/lib/orders/resume-url';
import { hasProgressBeyondContact } from '@/lib/orders/abandoned-progress';
import { withUtm } from '@/lib/email/utm';
import { brandForOrder } from '@/lib/brand/for-order';
import { canReceiveMarketing, loadContactsByEmail, unsubscribeUrlFor } from '@/lib/lifecycle/contacts';
import {
  REENGAGE_ACTOR,
  REENGAGE_ENABLED,
  REENGAGE_MAX_AGE_MS,
  REENGAGE_MIN_AGE_MS,
  REENGAGE_PAID_LOOKBACK_MS,
  UNPAID_STATUSES,
  newestIso,
  normalizeEmail,
  reengageBudget,
  reengageReason,
  selectReengage,
  type ReengageContext,
  type ReengageOrder,
} from '@/lib/orders/reengage';

export const maxDuration = 120;

const UTM_CAMPAIGN = 'reengage-order';

interface CandidateRow {
  id: string;
  friendly_order_id: string | null;
  order_number: string | null;
  status: string;
  platform: string | null;
  is_test: boolean | null;
  created_at: string;
  paid_at: string | null;
  customer_data: Record<string, unknown> | null;
  services: { name: string | null; slug: string | null } | null;
}

function contactOf(cd: unknown): { email?: string | null; firstName?: string | null } {
  return ((cd as { contact?: { email?: string | null; firstName?: string | null } } | null)?.contact) ?? {};
}

function firstNameOf(cd: unknown): string | null {
  const c = cd as { personal?: { firstName?: string }; billing?: { firstName?: string }; contact?: { firstName?: string } } | null;
  return c?.personal?.firstName ?? c?.billing?.firstName ?? c?.contact?.firstName ?? null;
}

async function chunked<T>(items: string[], size: number, fn: (part: string[]) => Promise<T[]>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await fn(items.slice(i, i + size))));
  return out;
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const dry = request.nextUrl.searchParams.get('dry') === '1';
  if (!REENGAGE_ENABLED && !dry) return NextResponse.json({ success: true, data: { sent: 0, note: 'disabled' } });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const now = new Date();

    // Send log so far (one `from()` per query: builders are not reusable).
    const { data: logRows, error: logError } = await admin
      .from('order_history')
      .select('order_id, created_at')
      .eq('event_type', 'recovery_email_sent')
      .eq('changed_by', REENGAGE_ACTOR)
      .limit(5000);
    if (logError) throw new Error(`send log: ${logError.message}`);
    const log = (logRows ?? []) as Array<{ order_id: string; created_at: string }>;
    const sentTotal = log.length;
    const sentToday = log.filter((r) => now.getTime() - Date.parse(r.created_at) < 24 * 3_600_000).length;
    const budget = reengageBudget(sentToday, sentTotal);
    if (budget === 0 && !dry) {
      return NextResponse.json({ success: true, data: { sent: 0, sentToday, sentTotal, note: 'cap reached' } });
    }

    // Candidates: unpaid eghiseul orders 7–60 days old, newest first.
    const windowFrom = new Date(now.getTime() - REENGAGE_MAX_AGE_MS).toISOString();
    const windowTo = new Date(now.getTime() - REENGAGE_MIN_AGE_MS).toISOString();
    const rows: CandidateRow[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await admin
        .from('orders')
        .select('id, friendly_order_id, order_number, status, platform, is_test, created_at, paid_at, customer_data, services(name, slug)')
        .in('status', [...UNPAID_STATUSES])
        .is('paid_at', null)
        .eq('is_test', false)
        .eq('platform', 'eghiseul')
        .gte('created_at', windowFrom)
        .lte('created_at', windowTo)
        .order('created_at', { ascending: false })
        .range(from, from + 999);
      if (error) throw new Error(`candidate query: ${error.message}`);
      rows.push(...((data ?? []) as CandidateRow[]));
      if (!data || data.length < 1000) break;
    }
    const byId = new Map(rows.map((r) => [r.id, r]));
    const orders: ReengageOrder[] = rows.map((r) => ({
      id: r.id,
      email: contactOf(r.customer_data).email ?? null,
      status: r.status,
      platform: r.platform,
      isTest: !!r.is_test,
      createdAt: r.created_at,
      paidAt: r.paid_at,
      hasProgress: r.status === 'draft' ? hasProgressBeyondContact(r.customer_data) : true,
    }));

    // Context for every address in the window, raw + lower-cased spellings
    // (some addresses are stored with capitals).
    const emails = [
      ...new Set(orders.flatMap((o) => [(o.email ?? '').trim(), normalizeEmail(o.email)]).filter(Boolean)),
    ];
    const historySince = new Date(now.getTime() - REENGAGE_MAX_AGE_MS - REENGAGE_PAID_LOOKBACK_MS).toISOString();
    const loggedIds = [...new Set(log.map((r) => r.order_id))];
    const [related, reengagedOrders, contacts] = await Promise.all([
      chunked(emails, 150, async (part) => {
        const { data, error } = await admin
          .from('orders')
          .select('email:customer_data->contact->>email, created_at, paid_at, phone_contacted_at, manual_recovery_email_at, recovery_email_last_sent_at')
          .in('customer_data->contact->>email', part)
          .gte('created_at', historySince)
          .limit(5000);
        if (error) throw new Error(`related orders: ${error.message}`);
        return (data ?? []) as Array<{
          email: string | null;
          created_at: string;
          paid_at: string | null;
          phone_contacted_at: string | null;
          manual_recovery_email_at: string | null;
          recovery_email_last_sent_at: string | null;
        }>;
      }),
      chunked(loggedIds, 150, async (part) => {
        const { data, error } = await admin.from('orders').select('email:customer_data->contact->>email').in('id', part);
        if (error) throw new Error(`reengaged orders: ${error.message}`);
        return (data ?? []) as Array<{ email: string | null }>;
      }),
      loadContactsByEmail(admin, emails),
    ]);

    const newestOrderByEmail = new Map<string, string>();
    const paidByEmail = new Map<string, string[]>();
    const lastContactByEmail = new Map<string, string>();
    for (const r of related) {
      const e = normalizeEmail(r.email);
      if (!e) continue;
      const prev = newestOrderByEmail.get(e);
      if (!prev || Date.parse(r.created_at) > Date.parse(prev)) newestOrderByEmail.set(e, r.created_at);
      if (r.paid_at) paidByEmail.set(e, [...(paidByEmail.get(e) ?? []), r.paid_at]);
      const contact = newestIso(lastContactByEmail.get(e), r.phone_contacted_at, r.manual_recovery_email_at, r.recovery_email_last_sent_at);
      if (contact) lastContactByEmail.set(e, contact);
    }
    const suppressed = new Set<string>();
    for (const [e, c] of contacts) if (!canReceiveMarketing(c)) suppressed.add(e);
    for (const e of emails) {
      const n = normalizeEmail(e);
      if (TEST_EMAILS.has(n) || isUndeliverable(n) || isSuspiciousEmail(n)) suppressed.add(n);
    }
    const ctx: ReengageContext = {
      now,
      suppressed,
      alreadyReengaged: new Set(reengagedOrders.map((r) => normalizeEmail(r.email)).filter(Boolean)),
      newestOrderByEmail,
      paidByEmail,
      lastContactByEmail,
    };

    if (dry) {
      const reasons: Record<string, number> = {};
      for (const o of orders) {
        const why = reengageReason(o, ctx) ?? 'eligible';
        reasons[why] = (reasons[why] ?? 0) + 1;
      }
      const pool = selectReengage(orders, ctx, Number.MAX_SAFE_INTEGER);
      return NextResponse.json({
        success: true,
        data: {
          dry: true,
          sentToday,
          sentTotal,
          budget,
          candidates: orders.length,
          eligibleAddresses: pool.length,
          reasons,
          next: pool.slice(0, Math.max(budget, 10)).map((o) => ({
            order: byId.get(o.id)?.friendly_order_id ?? o.id,
            status: o.status,
            created: o.createdAt.slice(0, 10),
          })),
        },
      });
    }

    const picked = selectReengage(orders, ctx, budget);
    const result = { sent: 0, skipped: 0, failed: 0 };
    for (const o of picked) {
      const row = byId.get(o.id)!;
      const email = normalizeEmail(o.email);
      const contact = contacts.get(email) ?? null;
      const unsubscribeUrl = contact ? unsubscribeUrlFor(contact) : null;
      const brand = brandForOrder(row);
      const orderNumber = row.friendly_order_id ?? row.order_number ?? '';
      const resumeUrl = withUtm(
        buildResumeUrl({
          id: row.id,
          status: row.status,
          friendly_order_id: row.friendly_order_id,
          serviceSlug: row.services?.slug ?? null,
          email,
          platform: row.platform,
        }),
        'recovery',
        UTM_CAMPAIGN,
      );
      const mail = renderReengageOrderEmail({
        customerFirstName: firstNameOf(row.customer_data),
        serviceName: row.services?.name ?? 'documentul',
        orderNumber,
        startedAt: new Date(row.created_at),
        resumeUrl,
        unsubscribeUrl,
        brand,
      });

      // Claim first: the log row is the "already sent" marker.
      const { data: claim, error: claimError } = await admin
        .from('order_history')
        .insert({
          order_id: row.id,
          event_type: 'recovery_email_sent',
          changed_by: REENGAGE_ACTOR,
          new_value: { flow: 'reengage', utm_campaign: UTM_CAMPAIGN },
          notes: 'Email „Mai ai nevoie?" (B10, comandă neplătită de 7–60 de zile, fără cupon)',
        })
        .select('id')
        .single();
      if (claimError || !claim) {
        console.error(`[reengage-orders] claim failed for ${row.id}:`, claimError?.message);
        result.skipped++;
        continue;
      }

      try {
        const sendRes = await sendEmail({
          to: email,
          from: brand.emailFrom,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          ...(unsubscribeUrl ? { headers: listUnsubscribeHeaders(unsubscribeUrl) } : {}),
          idempotencyKey: `reengage-order-${email}`,
        });
        if (sendRes.skipped) throw new Error(sendRes.reason ?? 'send skipped');
        result.sent++;
      } catch (err) {
        // Release the claim so the next run retries this address.
        await admin.from('order_history').delete().eq('id', claim.id);
        console.error(`[reengage-orders] send failed for ${row.id}:`, err instanceof Error ? err.message : err);
        result.failed++;
      }
      // Resend allows ~2 requests/second.
      await new Promise((r) => setTimeout(r, 600));
    }

    console.log(`[reengage-orders] sent ${result.sent}, skipped ${result.skipped}, failed ${result.failed}`);
    return NextResponse.json({ success: true, data: { ...result, sentToday, sentTotal, budget } });
  } catch (error) {
    console.error('[reengage-orders] error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

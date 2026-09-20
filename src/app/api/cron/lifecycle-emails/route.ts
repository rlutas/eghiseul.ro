/**
 * POST /api/cron/lifecycle-emails — zilnic (vezi vercel.json)
 *
 * Trei emailuri automate post-comandă, fiecare cu propriul comutator în
 * `admin_settings.lifecycle_emails` (`{ reviewRequest, expiryReminder,
 * crossSell }`, toate `false` implicit — se pornesc din /admin/marketing după
 * revizuirea șabloanelor):
 *
 *   review_request   3–10 zile după finalizare, DOAR comenzi „în termen" fără
 *                    incidente (`wasOnTime`) → link de recenzie Google
 *   expiry_reminder  documentul se apropie de / a depășit valabilitatea legală
 *                    (`DOCUMENT_VALIDITY_DAYS`), o dată per comandă; nu pleacă
 *                    dacă clientul a recomandat deja același serviciu
 *   cross_sell       30–60 zile după finalizare, 2 documente înrudite; o dată
 *                    per client la 180 de zile
 *
 * Claim atomic: rândul din `lifecycle_emails` (UNIQUE order_id+kind) se
 * inserează ÎNAINTE de trimitere — o rulare suprapusă primește 23505 și sare.
 * Eșec tranzitoriu (429/5xx/rețea) → rândul se șterge, retry mâine. Eșec
 * permanent (4xx) → rămâne cu `failed_reason`, nu se reîncearcă.
 *
 * Reguli pure: `lib/lifecycle/rules.ts`. Auth: CRON_SECRET (Bearer).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, ResendError } from '@/lib/email/resend';
import { TEST_EMAILS, isUndeliverable } from '@/lib/email/deliverability';
import { listUnsubscribeHeaders } from '@/lib/email/templates/marketing-footer';
import { renderReviewRequestEmail } from '@/lib/email/templates/review-request';
import { renderExpiryReminderEmail, validityLabel } from '@/lib/email/templates/expiry-reminder';
import { renderCrossSellEmail } from '@/lib/email/templates/cross-sell';
import { serviceUrl } from '@/lib/seo/constants';
import { GOOGLE_REVIEW_WRITE_URL } from '@/config/contact';
import { appBaseForOrder, brandForOrder } from '@/lib/brand/for-order';
import { brandSellsService, type Brand } from '@/lib/brand/brands';
import { DOCUMENTERO_SERVICES_MENU } from '@/config/documentero-nav';
import {
  CROSS_SELL_COOLDOWN_DAYS,
  CROSS_SELL_MAP,
  CROSS_SELL_MAX_DAYS,
  CROSS_SELL_MIN_DAYS,
  DOCUMENT_VALIDITY_DAYS,
  EXPIRY_GRACE_DAYS,
  EXPIRY_LEAD_DAYS,
  NEGATIVE_HISTORY_EVENTS,
  REVIEW_MAX_DAYS,
  REVIEW_MIN_DAYS,
  expiryDate,
  isInExpiryWindow,
  wasOnTime,
} from '@/lib/lifecycle/rules';
import {
  canReceiveMarketing,
  ensureContactForOrder,
  loadContactsByEmail,
  unsubscribeUrlFor,
  type MarketingContact,
} from '@/lib/lifecycle/contacts';

export const maxDuration = 300;
const SEND_SPACING_MS = 600;
const MAX_PER_KIND = 150; // sub maxDuration chiar dacă toate trei sunt pornite
const DAY = 86_400_000;

type Kind = 'review_request' | 'expiry_reminder' | 'cross_sell';
const DEFAULT_SETTINGS = { reviewRequest: false, expiryReminder: false, crossSell: false };

interface OrderRow {
  id: string;
  friendly_order_id: string | null;
  order_number: string | null;
  status: string;
  paid_at: string | null;
  completed_at: string | null;
  estimated_completion_date: string | null;
  email_bounced_at: string | null;
  is_test: boolean | null;
  customer_data: Record<string, unknown> | null;
  platform: string | null;
  services: { slug: string; name: string; processing_config: Record<string, unknown> | null } | null;
}

type Outcome = { kind: Kind; orderId: string; status: 'sent' | 'skipped' | 'error'; reason?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function orderEmail(o: OrderRow): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = (o.customer_data ?? {}) as any;
  return String(cd.contact?.email ?? '').trim().toLowerCase();
}
function orderFirstName(o: OrderRow, contact: MarketingContact | null): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = (o.customer_data ?? {}) as any;
  return cd.billing?.firstName ?? cd.personal?.firstName ?? cd.contact?.firstName ?? contact?.first_name ?? null;
}
function utm(url: string, campaign: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}utm_source=email&utm_medium=lifecycle&utm_campaign=${campaign}`;
}
/**
 * Public page of a service on the ORDER's brand. documentero has no
 * `/servicii/` cluster — its services live at their own paths (nav config);
 * a slug it has no page for falls back to its home page.
 */
function servicePathForBrand(brand: Brand, slug: string): string {
  if (brand.id === 'eghiseul') return serviceUrl(slug);
  return DOCUMENTERO_SERVICES_MENU.find((s) => s.orderSlug === slug)?.href ?? '/';
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
  const now = new Date();

  const { data: settingsRow } = await admin.from('admin_settings').select('value').eq('key', 'lifecycle_emails').maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(settingsRow?.value ?? {}) };
  const enabledKinds: Kind[] = [
    ...(settings.reviewRequest ? (['review_request'] as Kind[]) : []),
    ...(settings.expiryReminder ? (['expiry_reminder'] as Kind[]) : []),
    ...(settings.crossSell ? (['cross_sell'] as Kind[]) : []),
  ];
  if (enabledKinds.length === 0) {
    return NextResponse.json({ success: true, data: { reason: 'all disabled', sentCount: 0, processedAt: now.toISOString() } });
  }

  // O singură citire a comenzilor finalizate din fereastra maximă (expirare:
  // 180 zile valabilitate + 30 zile grație), filtrată pe tipuri în memorie.
  const maxValidity = Math.max(...Object.values(DOCUMENT_VALIDITY_DAYS));
  const oldest = new Date(now.getTime() - (maxValidity + EXPIRY_GRACE_DAYS) * DAY).toISOString();
  const { data: ordersRaw, error: ordersError } = await admin
    .from('orders')
    .select(
      'id, friendly_order_id, order_number, status, paid_at, completed_at, estimated_completion_date, email_bounced_at, is_test, customer_data, platform, services(slug, name, processing_config)'
    )
    .eq('status', 'completed')
    .gte('completed_at', oldest)
    .is('email_bounced_at', null)
    .order('completed_at', { ascending: true })
    .limit(2000);
  if (ordersError) {
    console.error('[lifecycle-emails] orders fetch failed:', ordersError);
    return NextResponse.json({ success: false, error: ordersError.message }, { status: 500 });
  }
  const orders: OrderRow[] = (ordersRaw ?? []).filter(
    (o: OrderRow) => !o.is_test && o.completed_at && o.services?.slug && orderEmail(o) && !TEST_EMAILS.has(orderEmail(o)) && !isUndeliverable(orderEmail(o))
  );

  const { data: servicesRaw } = await admin.from('services').select('slug, name, is_active');
  const activeServices = new Map<string, string>();
  for (const s of servicesRaw ?? []) if (s.is_active) activeServices.set(s.slug, s.name);

  const contacts = await loadContactsByEmail(admin, orders.map(orderEmail));
  const results: Outcome[] = [];
  const counters: Record<Kind, number> = { review_request: 0, expiry_reminder: 0, cross_sell: 0 };

  const getContact = async (o: OrderRow): Promise<MarketingContact | null> => {
    const email = orderEmail(o);
    const existing = contacts.get(email);
    if (existing) return existing;
    const created = await ensureContactForOrder(admin, o.id, email);
    if (created) contacts.set(email, created);
    return created;
  };

  // Claim + trimitere + marcare, comun celor trei tipuri.
  const dispatch = async (
    kind: Kind,
    o: OrderRow,
    contact: MarketingContact,
    render: () => { subject: string; html: string; text: string }
  ) => {
    const email = orderEmail(o);
    const { data: claim, error: claimError } = await admin
      .from('lifecycle_emails')
      .insert({ order_id: o.id, kind, recipient_email: email, contact_id: contact.id })
      .select('id')
      .single();
    if (claimError || !claim) {
      results.push({ kind, orderId: o.id, status: 'skipped', reason: claimError?.code === '23505' ? 'already claimed' : claimError?.message });
      return;
    }
    const unsubscribeUrl = unsubscribeUrlFor(contact);
    try {
      const mail = render();
      const res = await sendEmail({
        to: email,
        from: brandForOrder(o).emailFrom,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        idempotencyKey: `lifecycle-${kind}-${o.id}`,
        headers: listUnsubscribeHeaders(unsubscribeUrl),
      });
      if (res.skipped) {
        await admin.from('lifecycle_emails').delete().eq('id', claim.id);
        results.push({ kind, orderId: o.id, status: 'skipped', reason: res.reason });
        return;
      }
      await admin.from('lifecycle_emails').update({ sent_at: new Date().toISOString(), resend_id: res.id }).eq('id', claim.id);
      counters[kind] += 1;
      results.push({ kind, orderId: o.id, status: 'sent' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'send failed';
      const permanent = err instanceof ResendError && err.status >= 400 && err.status < 500 && err.status !== 429;
      if (permanent) {
        await admin.from('lifecycle_emails').update({ failed_reason: message.slice(0, 300) }).eq('id', claim.id);
      } else {
        await admin.from('lifecycle_emails').delete().eq('id', claim.id);
      }
      results.push({ kind, orderId: o.id, status: 'error', reason: message });
    } finally {
      await sleep(SEND_SPACING_MS);
    }
  };

  // ── 1. Recenzie ─────────────────────────────────────────────────────────
  if (settings.reviewRequest) {
    const minT = now.getTime() - REVIEW_MAX_DAYS * DAY;
    const maxT = now.getTime() - REVIEW_MIN_DAYS * DAY;
    const candidates = orders.filter((o) => {
      const t = new Date(o.completed_at!).getTime();
      return t >= minT && t <= maxT;
    });
    const ids = candidates.map((o) => o.id);
    const negative = new Set<string>();
    if (ids.length) {
      const { data: events } = await admin
        .from('order_history')
        .select('order_id, event_type')
        .in('order_id', ids)
        .in('event_type', Array.from(NEGATIVE_HISTORY_EVENTS));
      for (const e of events ?? []) negative.add(e.order_id);
    }
    let n = 0;
    for (const o of candidates) {
      if (n >= MAX_PER_KIND) break;
      const onTime = wasOnTime({
        paidAt: o.paid_at ? new Date(o.paid_at) : null,
        completedAt: new Date(o.completed_at!),
        estimatedCompletionDate: o.estimated_completion_date ? new Date(o.estimated_completion_date) : null,
        estimatedDaysDisplay: (o.services?.processing_config?.estimated_days_display as string | undefined) ?? null,
        hadNegativeEvent: negative.has(o.id),
      });
      if (!onTime) {
        results.push({ kind: 'review_request', orderId: o.id, status: 'skipped', reason: 'not on time' });
        continue;
      }
      // The review link is the COMPANY's Google profile (eDigitalizare SRL): the
      // same profile documentero.ro shows on its landing page, so every brand
      // asks for the review there.
      const brand = brandForOrder(o);
      const contact = await getContact(o);
      if (!canReceiveMarketing(contact)) {
        results.push({ kind: 'review_request', orderId: o.id, status: 'skipped', reason: 'unsubscribed or no contact' });
        continue;
      }
      n += 1;
      await dispatch('review_request', o, contact!, () =>
        renderReviewRequestEmail({
          brand,
          firstName: orderFirstName(o, contact),
          serviceName: o.services!.name,
          friendlyOrderId: o.friendly_order_id ?? o.order_number ?? o.id.slice(0, 8),
          reviewUrl: GOOGLE_REVIEW_WRITE_URL,
          unsubscribeUrl: unsubscribeUrlFor(contact!),
        })
      );
    }
  }

  // ── 2. Expirare ─────────────────────────────────────────────────────────
  if (settings.expiryReminder) {
    const candidates = orders.filter((o) => isInExpiryWindow(new Date(o.completed_at!), o.services!.slug, now));
    // Cine a recomandat deja același serviciu după finalizare nu primește reminder.
    const reordered = new Set<string>();
    if (candidates.length) {
      const earliest = candidates.reduce((min, o) => (o.completed_at! < min ? o.completed_at! : min), candidates[0].completed_at!);
      const { data: later } = await admin
        .from('orders')
        .select('paid_at, customer_data, services(slug)')
        .not('paid_at', 'is', null)
        .gte('paid_at', earliest)
        .limit(5000);
      for (const l of later ?? []) {
        const em = String(l.customer_data?.contact?.email ?? '').trim().toLowerCase();
        if (em && l.services?.slug) reordered.add(`${em}|${l.services.slug}|${l.paid_at}`);
      }
    }
    const hasLaterOrder = (o: OrderRow) => {
      const em = orderEmail(o);
      for (const key of reordered) {
        const [e, slug, paidAt] = key.split('|');
        if (e === em && slug === o.services!.slug && paidAt > o.completed_at!) return true;
      }
      return false;
    };
    let n = 0;
    for (const o of candidates) {
      if (n >= MAX_PER_KIND) break;
      if (hasLaterOrder(o)) {
        results.push({ kind: 'expiry_reminder', orderId: o.id, status: 'skipped', reason: 'reordered already' });
        continue;
      }
      const contact = await getContact(o);
      if (!canReceiveMarketing(contact)) {
        results.push({ kind: 'expiry_reminder', orderId: o.id, status: 'skipped', reason: 'unsubscribed or no contact' });
        continue;
      }
      const slug = o.services!.slug;
      const expiresOn = expiryDate(new Date(o.completed_at!), slug)!;
      const brand = brandForOrder(o);
      n += 1;
      await dispatch('expiry_reminder', o, contact!, () =>
        renderExpiryReminderEmail({
          brand,
          firstName: orderFirstName(o, contact),
          serviceName: o.services!.name,
          friendlyOrderId: o.friendly_order_id ?? o.order_number ?? o.id.slice(0, 8),
          expiresOn,
          alreadyExpired: expiresOn.getTime() < now.getTime(),
          validityLabel: validityLabel(DOCUMENT_VALIDITY_DAYS[slug]),
          reorderUrl: utm(`${appBaseForOrder(o)}${servicePathForBrand(brand, slug)}`, 'expiry'),
          unsubscribeUrl: unsubscribeUrlFor(contact!),
        })
      );
    }
  }

  // ── 3. Cross-sell ───────────────────────────────────────────────────────
  if (settings.crossSell) {
    const minT = now.getTime() - CROSS_SELL_MAX_DAYS * DAY;
    const maxT = now.getTime() - CROSS_SELL_MIN_DAYS * DAY;
    const candidates = orders.filter((o) => {
      const t = new Date(o.completed_at!).getTime();
      return t >= minT && t <= maxT && (CROSS_SELL_MAP[o.services!.slug]?.length ?? 0) > 0;
    });
    const recentlyMailed = new Set<string>();
    if (candidates.length) {
      const { data: recent } = await admin
        .from('lifecycle_emails')
        .select('recipient_email')
        .eq('kind', 'cross_sell')
        .gte('created_at', new Date(now.getTime() - CROSS_SELL_COOLDOWN_DAYS * DAY).toISOString())
        .in('recipient_email', Array.from(new Set(candidates.map(orderEmail))));
      for (const r of recent ?? []) recentlyMailed.add(r.recipient_email);
    }
    let n = 0;
    for (const o of candidates) {
      if (n >= MAX_PER_KIND) break;
      const email = orderEmail(o);
      if (recentlyMailed.has(email)) {
        results.push({ kind: 'cross_sell', orderId: o.id, status: 'skipped', reason: 'cooldown' });
        continue;
      }
      const contact = await getContact(o);
      if (!canReceiveMarketing(contact)) {
        results.push({ kind: 'cross_sell', orderId: o.id, status: 'skipped', reason: 'unsubscribed or no contact' });
        continue;
      }
      const bought = new Set(contact!.services ?? []);
      const brand = brandForOrder(o);
      const suggestions = (CROSS_SELL_MAP[o.services!.slug] ?? [])
        .filter((slug) => activeServices.has(slug) && !bought.has(slug) && brandSellsService(brand, slug))
        .slice(0, 3)
        .map((slug) => ({ slug, name: activeServices.get(slug)!, url: utm(`${appBaseForOrder(o)}${servicePathForBrand(brand, slug)}`, 'cross_sell') }));
      if (suggestions.length === 0) {
        results.push({ kind: 'cross_sell', orderId: o.id, status: 'skipped', reason: 'nothing to suggest' });
        continue;
      }
      recentlyMailed.add(email); // un singur cross-sell per client per rulare
      n += 1;
      await dispatch('cross_sell', o, contact!, () =>
        renderCrossSellEmail({
          brand,
          firstName: orderFirstName(o, contact),
          boughtServiceName: o.services!.name,
          suggestions,
          // documentero has no /servicii/ catalog — its home page lists the services.
          catalogUrl: utm(brand.id === 'eghiseul' ? `${appBaseForOrder(o)}/servicii/` : `${appBaseForOrder(o)}/`, 'cross_sell'),
          unsubscribeUrl: unsubscribeUrlFor(contact!),
        })
      );
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      sentCount: counters.review_request + counters.expiry_reminder + counters.cross_sell,
      sent: counters,
      skippedCount: results.filter((r) => r.status === 'skipped').length,
      errorCount: results.filter((r) => r.status === 'error').length,
      enabledKinds,
      windows: { reviewDays: [REVIEW_MIN_DAYS, REVIEW_MAX_DAYS], expiryLeadDays: EXPIRY_LEAD_DAYS, crossSellDays: [CROSS_SELL_MIN_DAYS, CROSS_SELL_MAX_DAYS] },
      processedAt: now.toISOString(),
      results,
    },
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}

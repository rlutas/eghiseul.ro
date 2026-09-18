/**
 * GET/POST /api/cron/vehicle-reminders — daily.
 *
 * For every vehicle saved in a customer account whose rovinietă / ITP / RCA
 * expires within 14 days (or expired up to 30 days ago) and has not been
 * reminded for THAT date yet: one email. The rovinietă email sends the
 * customer to erovinieta.net, our own platform, with the plate filled in.
 *
 * Gated by `admin_settings.lifecycle_emails.vehicleReminder` (on unless the
 * team switched it off in /admin/marketing). Respects the contact registry's
 * unsubscribe like every other marketing email; a customer with no contact
 * row yet gets one created from the profile email, so the unsubscribe link
 * works from the first message.
 *
 * Both verbs: Vercel cron calls GET; the admin's „rulează acum" uses POST.
 * `?dry=1` lists who is due without sending.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, ResendError } from '@/lib/email/resend';
import { isUndeliverable } from '@/lib/email/deliverability';
import { listUnsubscribeHeaders } from '@/lib/email/templates/marketing-footer';
import { renderVehicleReminderEmail } from '@/lib/email/templates/vehicle-reminder';
import {
  appBase,
  canReceiveMarketing,
  loadContactsByEmail,
  unsubscribeUrlFor,
  type MarketingContact,
} from '@/lib/lifecycle/contacts';
import { remindedColumn, vehicleRemindersDue, type VehicleReminderRow } from '@/lib/vehicles/reminders';

export const maxDuration = 300;
const SEND_SPACING_MS = 600;
const MAX_PER_RUN = 150;

const EROVINIETA_CHECKOUT = 'https://erovinieta.net/checkout';

interface VehicleRow extends VehicleReminderRow {
  id: string;
  user_id: string;
  label: string | null;
  plate_number: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
}

function rovinietaUrl(plate: string): string {
  const params = new URLSearchParams({
    plate: plate.replace(/\s+/g, '').toUpperCase(),
    utm_source: 'eghiseul',
    utm_medium: 'email',
    utm_campaign: 'rovinieta-expiry',
  });
  return `${EROVINIETA_CHECKOUT}?${params.toString()}`;
}

async function run(request: NextRequest) {
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
  // `?dry=1`: compute who is due, send nothing, mark nothing — for checking a
  // deploy or a customer's question without spending an email.
  const dry = request.nextUrl.searchParams.get('dry') === '1';

  const { data: settingsRow } = await admin.from('admin_settings').select('value').eq('key', 'lifecycle_emails').maybeSingle();
  const enabled = settingsRow?.value?.vehicleReminder !== false;
  if (!enabled) {
    return NextResponse.json({ success: true, data: { reason: 'disabled', sentCount: 0, processedAt: now.toISOString() } });
  }

  // Candidates: any expiry inside [today − 30, today + 14]. The pure helper
  // then applies the exact window and the „once per date" rule.
  const from = new Date(now.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  const to = new Date(now.getTime() + 14 * 86_400_000).toISOString().slice(0, 10);
  // Page through EVERY candidate: a fixed „oldest 1000" window fills up with
  // terminal skips (unsubscribed, no email) and hides newer vehicles.
  const PAGE = 500;
  const rows: VehicleRow[] = [];
  for (let from_i = 0; from_i < 20_000; from_i += PAGE) {
    const { data: page, error } = await admin
      .from('user_saved_vehicles')
      .select('id, user_id, label, plate_number, itp_expiry, insurance_expiry, rovinieta_expiry, itp_reminded_for, insurance_reminded_for, rovinieta_reminded_for')
      .or(
        `and(rovinieta_expiry.gte.${from},rovinieta_expiry.lte.${to}),and(itp_expiry.gte.${from},itp_expiry.lte.${to}),and(insurance_expiry.gte.${from},insurance_expiry.lte.${to})`
      )
      .order('id', { ascending: true })
      .range(from_i, from_i + PAGE - 1);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    rows.push(...((page ?? []) as VehicleRow[]));
    if (!page || page.length < PAGE) break;
  }

  const due = rows.flatMap((v) => vehicleRemindersDue(v, now).map((r) => ({ vehicle: v, reminder: r })));
  if (dry) {
    return NextResponse.json({
      success: true,
      data: {
        dry: true,
        candidates: rows.length,
        due: due.map((d) => ({ vehicleId: d.vehicle.id, plate: d.vehicle.plate_number, kind: d.reminder.kind, expiry: d.reminder.expiry, daysLeft: d.reminder.daysLeft })),
        processedAt: now.toISOString(),
      },
    });
  }
  if (due.length === 0) {
    return NextResponse.json({ success: true, data: { sentCount: 0, candidates: rows.length, processedAt: now.toISOString() } });
  }

  const userIds = Array.from(new Set(due.map((d) => d.vehicle.user_id)));
  const { data: profiles } = await admin.from('profiles').select('id, email, first_name').in('id', userIds);
  const profileById = new Map<string, ProfileRow>((profiles ?? []).map((p: ProfileRow) => [p.id, p]));
  const emails = Array.from(profileById.values()).map((p) => p.email ?? '').filter(Boolean);
  const contacts = await loadContactsByEmail(admin, emails);

  const results: Array<{ vehicleId: string; kind: string; status: 'sent' | 'skipped' | 'error'; reason?: string }> = [];
  let sent = 0;

  for (const { vehicle, reminder } of due) {
    if (sent >= MAX_PER_RUN) break;
    const profile = profileById.get(vehicle.user_id);
    const email = (profile?.email ?? '').trim().toLowerCase();
    if (!email || isUndeliverable(email)) {
      results.push({ vehicleId: vehicle.id, kind: reminder.kind, status: 'skipped', reason: 'no deliverable email' });
      continue;
    }
    let contact: MarketingContact | null = contacts.get(email) ?? null;
    if (!contact) {
      // First marketing email to this person: the row exists so the
      // unsubscribe link in it works. Soft opt-in on the account, like the
      // registry does for customers.
      const { data: created } = await admin
        .from('contacts')
        .insert({ email, first_name: profile?.first_name ?? null, sources: ['platforma:cont-masini'], is_customer: false })
        .select('*')
        .maybeSingle();
      contact = (created as MarketingContact | null) ?? null;
      if (contact) contacts.set(email, contact);
    }
    if (!contact || !canReceiveMarketing(contact)) {
      results.push({ vehicleId: vehicle.id, kind: reminder.kind, status: 'skipped', reason: 'unsubscribed or no contact' });
      continue;
    }

    const unsubscribeUrl = unsubscribeUrlFor(contact);
    const actionUrl =
      reminder.kind === 'rovinieta'
        ? rovinietaUrl(vehicle.plate_number)
        : `${appBase()}/account/?tab=vehicles&utm_source=email&utm_medium=lifecycle&utm_campaign=vehicle-${reminder.kind}`;

    try {
      const mail = renderVehicleReminderEmail({
        firstName: profile?.first_name,
        kind: reminder.kind,
        plateNumber: vehicle.plate_number,
        label: vehicle.label,
        expiresOn: reminder.expiresOn,
        daysLeft: reminder.daysLeft,
        actionUrl,
        unsubscribeUrl,
      });
      const res = await sendEmail({
        to: email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        idempotencyKey: `vehicle-${reminder.kind}-${vehicle.id}-${reminder.expiry}`,
        headers: listUnsubscribeHeaders(unsubscribeUrl),
      });
      if (res.skipped) {
        results.push({ vehicleId: vehicle.id, kind: reminder.kind, status: 'skipped', reason: res.reason });
        continue;
      }
      // Marked AFTER the send: a crash before this line means a second email
      // tomorrow, which is the failure we prefer over a reminder never sent.
      const { error: markError } = await admin
        .from('user_saved_vehicles')
        .update({ [remindedColumn(reminder.kind)]: reminder.expiry, updated_at: now.toISOString() })
        .eq('id', vehicle.id);
      sent += 1;
      if (markError) {
        // Sent but not recorded: say so, so the log explains a repeat tomorrow.
        console.error(`[vehicle-reminders] ${vehicle.plate_number} ${reminder.kind}: sent but marker failed:`, markError.message);
        results.push({ vehicleId: vehicle.id, kind: reminder.kind, status: 'error', reason: `sent, marker failed: ${markError.message}`.slice(0, 200) });
      } else {
        results.push({ vehicleId: vehicle.id, kind: reminder.kind, status: 'sent' });
      }
      await new Promise((r) => setTimeout(r, SEND_SPACING_MS));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'send failed';
      if (err instanceof ResendError && err.status === 429) break;
      console.error(`[vehicle-reminders] ${vehicle.plate_number} ${reminder.kind}:`, message);
      results.push({ vehicleId: vehicle.id, kind: reminder.kind, status: 'error', reason: message.slice(0, 200) });
    }
  }

  console.log(`[vehicle-reminders] candidates=${rows.length} due=${due.length} sent=${sent}`);
  return NextResponse.json({ success: true, data: { sentCount: sent, due: due.length, candidates: rows.length, results, processedAt: now.toISOString() } });
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

/**
 * POST/GET /api/cron/outage-alerts
 *
 * Trimite alerta de revenire către cei înscriși pe articolul de outage, în
 * momentul în care serviciul chiar revine.
 *
 * Sursa adevărului e `platform_outages.ended_at` — setat de monitorizarea care
 * verifică portalurile la 15 minute. Nu ghicim și nu ne bazăm pe comunicate:
 * anunțăm doar când sistemul răspunde efectiv.
 *
 * Fereastră de 24h după revenire: dacă cronul a fost oprit o zi, recuperăm;
 * dar nu trimitem „a revenit!" pentru un outage încheiat săptămâna trecută.
 *
 * Autentificare: `CRON_SECRET` în `Authorization: Bearer ...`.
 * Programat la fiecare 15 min în vercel.json (path CU slash final — vezi
 * incidentul din 2026-07-20).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import {
  buildOutageRecoveredSubject,
  buildOutageRecoveredHtml,
  buildOutageRecoveredText,
} from '@/lib/email/templates/outage-recovered';

/** Cât timp după revenire mai are sens să anunțăm. */
const RECOVERY_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Throttle Resend — restul pleacă la rulările următoare. */
const BATCH_LIMIT = 100;

/** Ce comandă poate plasa clientul, per serviciu. */
const SERVICE_CONFIG: Record<string, { label: string; document: string; orderPath: string }> = {
  ancpi: {
    label: 'ANCPI',
    document: 'extras de carte funciară',
    orderPath: '/comanda/extras-carte-funciara/',
  },
  onrc: {
    label: 'ONRC',
    document: 'certificat constatator',
    orderPath: '/comanda/certificat-constatator/',
  },
};

function humanDuration(startIso: string, endIso: string): string | null {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `${hours} ${hours === 1 ? 'oră' : 'ore'}`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'zi' : 'zile'}`;
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = Date.now();
  const windowStart = new Date(now - RECOVERY_WINDOW_MS).toISOString();

  // 1. Ce servicii au revenit recent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outagesTable = (supabase as any).from('platform_outages');
  const { data: recovered, error: outageError } = await outagesTable
    .select('provider, started_at, ended_at')
    .not('ended_at', 'is', null)
    .gte('ended_at', windowStart)
    .order('ended_at', { ascending: false });

  if (outageError) {
    console.error('[outage-alerts] outage fetch failed:', outageError);
    return NextResponse.json({ success: false, error: outageError.message }, { status: 500 });
  }
  if (!recovered?.length) {
    return NextResponse.json({
      success: true,
      data: { sentCount: 0, reason: 'no recent recovery', processedAt: new Date().toISOString() },
    });
  }

  // Un serviciu poate avea mai multe intrări în fereastră (flapping) — ne
  // interesează cea mai recentă revenire per serviciu.
  const latestByService = new Map<string, { started_at: string; ended_at: string }>();
  for (const o of recovered) {
    if (!latestByService.has(o.provider)) {
      latestByService.set(o.provider, { started_at: o.started_at, ended_at: o.ended_at });
    }
  }

  const results: Array<{ service: string; sent: number; skipped: number; errors: number }> = [];

  for (const [service, outage] of latestByService) {
    const config = SERVICE_CONFIG[service];
    if (!config) continue; // serviciu monitorizat, dar fără produs de oferit

    // 2. Abonații neanunțați pentru serviciul ăsta.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const alertsTable = (supabase as any).from('outage_alerts');
    const { data: subscribers, error: subError } = await alertsTable
      .select('id, email')
      .eq('service', service)
      .is('notified_at', null)
      .limit(BATCH_LIMIT);

    if (subError) {
      console.error(`[outage-alerts] subscriber fetch failed for ${service}:`, subError);
      continue;
    }
    if (!subscribers?.length) continue;

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
    const payload = {
      serviceLabel: config.label,
      documentLabel: config.document,
      orderUrl: `${base}${config.orderPath}?utm_source=outage-alert&utm_medium=email&utm_campaign=${service}-recovered`,
      outageDuration: humanDuration(outage.started_at, outage.ended_at),
    };

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const sub of subscribers) {
      try {
        const res = await sendEmail({
          to: sub.email,
          subject: buildOutageRecoveredSubject(payload),
          html: buildOutageRecoveredHtml(payload),
          text: buildOutageRecoveredText(payload),
          // Cheia include ended_at: dacă serviciul pică din nou și revine, e
          // o alertă nouă și legitimă, nu un duplicat al celei vechi.
          idempotencyKey: `outage-${service}-${outage.ended_at}-${sub.id}`,
        });
        if (res.skipped) {
          skipped++;
          continue; // fără stampilă → reîncercăm după ce Resend e configurat
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('outage_alerts')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', sub.id);
        sent++;
      } catch (err) {
        errors++;
        console.error(`[outage-alerts] send failed for ${sub.email}:`, err);
      }
    }

    results.push({ service, sent, skipped, errors });
  }

  return NextResponse.json({
    success: true,
    data: { results, processedAt: new Date().toISOString() },
  });
}

// Vercel Cron invocă prin GET. Fără passthrough, job-ul nu rulează niciodată.
export async function GET(request: NextRequest) {
  return POST(request);
}

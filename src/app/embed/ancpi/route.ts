/**
 * GET /embed/ancpi/ — embeddable live-status widget for the ANCPI outage.
 *
 * Purpose: digital PR. Newsrooms covering the ANCPI ransomware outage can
 * embed this iframe for a live "day N of outage" counter backed by our
 * 15-minute monitoring (the same platform_outages data as /api/status).
 * The embed snippet published in /ancpi-nu-functioneaza/ includes a credit
 * link OUTSIDE the iframe — that link is the backlink; the widget itself
 * drives brand + traffic.
 *
 * Served as a raw HTML document (no React, no site chrome) so it stays a
 * few KB and can't drag the host page down. Framing is allowed only for
 * /embed/* via next.config.ts headers.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Same reference the article uses: ANCPI dates the generalized outage to
// July 14 (we detected the ePay drop on the 13th, 23:02).
const OUTAGE_START_UTC = Date.UTC(2026, 6, 14);

const RO_MONTHS = [
  'ian',
  'feb',
  'mar',
  'apr',
  'mai',
  'iun',
  'iul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

function formatRo(ts: string | Date): string {
  const d = new Date(ts);
  const bucharest = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
  const hh = String(bucharest.getHours()).padStart(2, '0');
  const mm = String(bucharest.getMinutes()).padStart(2, '0');
  return `${bucharest.getDate()} ${RO_MONTHS[bucharest.getMonth()]}, ${hh}:${mm}`;
}

export async function GET() {
  let down = false;
  let lastChecked: string | null = null;
  let endedAt: string | null = null;

  try {
    // `as any`: platform_outages is missing from the generated Database types —
    // same workaround as /api/status and record-outage.ts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const { data } = await supabase
      .from('platform_outages')
      .select('started_at, ended_at, last_checked_at')
      .eq('provider', 'ancpi')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      down = data.ended_at === null;
      lastChecked = data.last_checked_at;
      endedAt = data.ended_at;
    }
  } catch {
    // On DB failure render the widget in "unknown" (up) state rather than 500 —
    // an embedded iframe must never show a raw error page.
  }

  const dayCount = Math.floor((Date.now() - OUTAGE_START_UTC) / 86_400_000) + 1;

  const statusLine = down
    ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#dc2626;margin-right:7px;box-shadow:0 0 0 3px rgba(220,38,38,.15)"></span>ANCPI / e-Terra: <strong style="color:#dc2626">NEFUNCȚIONAL</strong>`
    : `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#16a34a;margin-right:7px;box-shadow:0 0 0 3px rgba(22,163,74,.15)"></span>ANCPI / e-Terra: <strong style="color:#16a34a">FUNCȚIONAL</strong>`;

  const detailLine = down
    ? `Ziua <strong>${dayCount}</strong> de blocaj — sistemele sunt picate din 13 iulie, 23:02`
    : endedAt
      ? `Sistemele au revenit pe ${formatRo(endedAt)}, după un blocaj început pe 13 iulie`
      : `Sistemele răspund normal`;

  const checkedLine = lastChecked
    ? `Ultima verificare: ${formatRo(lastChecked)} · verificăm la fiecare 15 minute`
    : `Verificăm la fiecare 15 minute`;

  const html = `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="300">
<meta name="robots" content="noindex">
<title>Starea sistemelor ANCPI — monitorizare live eGhișeul.ro</title>
</head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#fff">
<div style="border:1px solid #e5e5e5;border-radius:12px;padding:14px 16px;max-width:400px;box-sizing:border-box">
  <div style="font-size:15px;color:#111827;margin-bottom:6px">${statusLine}</div>
  <div style="font-size:13px;color:#374151;line-height:1.45;margin-bottom:4px">${detailLine}</div>
  <div style="font-size:11.5px;color:#6b7280;margin-bottom:8px">${checkedLine}</div>
  <a href="https://eghiseul.ro/ancpi-nu-functioneaza/?utm_source=embed&utm_medium=widget&utm_campaign=ancpi-status" target="_blank" rel="noopener" style="font-size:12px;color:#0C1A2F;font-weight:600;text-decoration:none">Monitorizare live: eGhișeul.ro →</a>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Fresh enough for a live badge, cheap enough for a viral embed.
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

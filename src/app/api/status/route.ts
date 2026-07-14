/**
 * GET /api/status?service=onrc|ancpi — public system status for the "Stare sistem"
 * badge. Reports whether the provider portal is reachable and whether automated
 * issuance (the matching worker) is alive (heartbeat < 2 min). No secrets exposed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WORKER_STALE_MS = 2 * 60 * 1000;

const PROVIDERS = {
  onrc: {
    label: 'Portal ONRC',
    workerName: 'onrc_worker',
    pingUrl: 'https://sso.onrc.ro/realms/onrc/.well-known/openid-configuration',
  },
  ancpi: {
    label: 'Portal ANCPI',
    workerName: 'ancpi_worker',
    pingUrl: 'https://epay.ancpi.ro/epay/LogIn.action',
  },
} as const;

type Provider = keyof typeof PROVIDERS;

async function reachable(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    // `redirect: 'manual'` so a normal login redirect (302) is NOT followed and
    // is still counted as reachable. A real app response is 2xx (login page) or
    // 3xx (redirect to the SSO login). A 4xx means the app context is GONE — e.g.
    // ANCPI returns 404 on every /epay/* path during a maintenance window — so it
    // must count as DOWN. (We still must accept 3xx: using `r.ok` previously
    // false-flagged the 302 login page as "indisponibil".)
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store', redirect: 'manual' });
    clearTimeout(t);
    return r.status >= 200 && r.status < 400;
  } catch {
    return false;
  }
}

/**
 * ANCPI serves a "serviciu indisponibil / activități de mentenanță" page at the
 * portal root during planned maintenance while every /epay/* path 404s. Confirm
 * it so the badge can HARD-flag the portal as down even when the worker process
 * heartbeat is still fresh (the worker stays alive on Railway but every login
 * fails). Only probed when the main ping already failed, to avoid the extra
 * round-trip on the happy path.
 */
async function ancpiInMaintenance(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch('https://epay.ancpi.ro/', { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    const body = await r.text();
    return /mentenan[țt]|serviciu indisponibil/i.test(body);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get('service');
  const provider: Provider = param === 'ancpi' ? 'ancpi' : 'onrc';
  const cfg = PROVIDERS[provider];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const [portalUp, hb, outage] = await Promise.all([
    reachable(cfg.pingUrl),
    supabase.from('system_heartbeats').select('last_seen').eq('name', cfg.workerName).maybeSingle(),
    // Open downtime window recorded from the WORKER's portal probe — the
    // authoritative signal: the worker exercises the real login/order flow,
    // while our Vercel-side ping can get a healthy-looking 302 from a CDN edge
    // even when the portal is effectively down (incident 2026-07-14: badge
    // showed "operațional" during a 14h ANCPI outage the admin page was
    // correctly displaying from this very table).
    supabase.from('platform_outages').select('cause, started_at').eq('provider', provider).is('ended_at', null).maybeSingle(),
  ]);

  const openOutage = (outage?.data ?? null) as { cause?: string; started_at?: string } | null;

  // A confirmed maintenance window is a HARD "down" — it overrides the worker
  // heartbeat. (For a transient ping blip, the fresh heartbeat still vouches for
  // the portal, since the worker can only beat if it logged in.)
  const maintenance =
    openOutage?.cause === 'maintenance' ||
    (provider === 'ancpi' && !portalUp ? await ancpiInMaintenance() : false);

  const lastSeen = hb?.data?.last_seen ? new Date(hb.data.last_seen).getTime() : 0;
  const workerUp = lastSeen > 0 && Date.now() - lastSeen < WORKER_STALE_MS;
  // The worker heartbeat only proves the worker reaches OUR API, not the
  // portal — an open outage window always wins over the optimistic signals.
  const portalReachable = !openOutage && !maintenance && (portalUp || workerUp);
  // Issuance can only really work when the portal is reachable, even if the
  // worker process is alive — so reflect maintenance in the issuance badge too.
  const issuanceUp = workerUp && portalReachable;
  const operational = portalReachable && issuanceUp;

  return NextResponse.json(
    {
      operational,
      services: {
        portal: { up: portalReachable, label: cfg.label },
        issuance: { up: issuanceUp, label: 'Eliberare automată' },
      },
      lastWorkerSeen: lastSeen ? new Date(lastSeen).toISOString() : null,
      outageSince: openOutage?.started_at ?? null,
      updatedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

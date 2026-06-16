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
    // is still counted as reachable. Any HTTP response (2xx/3xx/4xx) means the
    // portal answered — only 5xx or a network/timeout error counts as down.
    // (Previously we used `r.ok`, which false-flagged the 302 login page as
    // "indisponibil".)
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store', redirect: 'manual' });
    clearTimeout(t);
    return r.status > 0 && r.status < 500;
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

  const [portalUp, hb] = await Promise.all([
    reachable(cfg.pingUrl),
    supabase.from('system_heartbeats').select('last_seen').eq('name', cfg.workerName).maybeSingle(),
  ]);

  const lastSeen = hb?.data?.last_seen ? new Date(hb.data.last_seen).getTime() : 0;
  const workerUp = lastSeen > 0 && Date.now() - lastSeen < WORKER_STALE_MS;
  // If the worker is issuing, it is logging into the portal — so the portal is
  // reachable by definition. Avoids the contradictory "portal indisponibil +
  // eliberare operațională" state.
  const portalReachable = portalUp || workerUp;
  const operational = portalReachable && workerUp;

  return NextResponse.json(
    {
      operational,
      services: {
        portal: { up: portalReachable, label: cfg.label },
        issuance: { up: workerUp, label: 'Eliberare automată' },
      },
      lastWorkerSeen: lastSeen ? new Date(lastSeen).toISOString() : null,
      updatedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

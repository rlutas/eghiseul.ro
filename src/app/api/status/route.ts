/**
 * GET /api/status — public system status for the "Stare sistem" page.
 * Reports whether the ONRC portal is reachable and whether automated issuance
 * (the worker) is alive (heartbeat in the last 2 minutes). No secrets exposed.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WORKER_STALE_MS = 2 * 60 * 1000;

async function onrcReachable(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch('https://sso.onrc.ro/realms/onrc/.well-known/openid-configuration', {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const [onrc, hb] = await Promise.all([
    onrcReachable(),
    supabase.from('system_heartbeats').select('last_seen').eq('name', 'onrc_worker').maybeSingle(),
  ]);

  const lastSeen = hb?.data?.last_seen ? new Date(hb.data.last_seen).getTime() : 0;
  const workerUp = lastSeen > 0 && Date.now() - lastSeen < WORKER_STALE_MS;

  // Operational when ONRC is reachable and automated issuance is alive.
  const operational = onrc && workerUp;

  return NextResponse.json(
    {
      operational,
      services: {
        onrc: { up: onrc, label: 'Portal ONRC' },
        issuance: { up: workerUp, label: 'Eliberare automată' },
      },
      lastWorkerSeen: lastSeen ? new Date(lastSeen).toISOString() : null,
      updatedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

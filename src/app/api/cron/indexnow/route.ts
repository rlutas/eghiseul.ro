/**
 * GET/POST /api/cron/indexnow/ — daily. Submits changed URLs to IndexNow.
 *
 * For each host in INDEXNOW_SITES: reads its live sitemap and submits the
 * URLs whose <lastmod> is after the last successful run (stored per host in
 * admin_settings.indexnow_last_run). First run with no stored date: last 48 h.
 *
 *   ?all=1   submit every URL in the sitemap (first submission)
 *   ?dry=1   list what would be submitted, send nothing
 *   ?url=…   submit exactly these URLs (repeatable; must be on a known host)
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}` (Vercel cron sends it).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  INDEXNOW_KEYS,
  INDEXNOW_SITES,
  buildPayloads,
  canonicalHost,
  parseSitemap,
  selectUrls,
  submitIndexNow,
} from '@/lib/seo/indexnow';

export const maxDuration = 60;
const SETTINGS_KEY = 'indexnow_last_run';
const FIRST_RUN_WINDOW_MS = 48 * 3600 * 1000;

type LastRun = Record<string, string>;

async function readLastRun(): Promise<LastRun> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data } = await admin.from('admin_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
  const v = data?.value;
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as LastRun) : {};
}

async function writeLastRun(map: LastRun): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { error } = await admin
    .from('admin_settings')
    .upsert({ key: SETTINGS_KEY, value: map, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) console.error('[indexnow] last-run upsert failed:', error.message);
}

async function handle(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const dry = sp.get('dry') === '1';
  const all = sp.get('all') === '1';
  const explicit = sp.getAll('url');
  const startedAt = new Date().toISOString();
  const lastRun = await readLastRun();
  const results: Array<{ host: string; urls: number; statuses: number[]; sample: string[] }> = [];

  for (const site of INDEXNOW_SITES) {
    const key = INDEXNOW_KEYS[site.host]!;
    let urls: string[];
    if (explicit.length) {
      urls = explicit.filter((u) => {
        try {
          return canonicalHost(new URL(u).hostname) === site.host;
        } catch {
          return false;
        }
      });
    } else {
      const res = await fetch(site.sitemap, { cache: 'no-store' });
      if (!res.ok) {
        results.push({ host: site.host, urls: 0, statuses: [res.status], sample: [] });
        continue;
      }
      const since = lastRun[site.host]
        ? new Date(lastRun[site.host]!)
        : new Date(Date.now() - FIRST_RUN_WINDOW_MS);
      urls = selectUrls(parseSitemap(await res.text()), site.host, { all, since });
    }

    const statuses: number[] = [];
    if (!dry && urls.length) {
      for (const payload of buildPayloads(site.host, key, urls)) {
        statuses.push(await submitIndexNow(payload));
      }
      if (statuses.every((s) => s === 200 || s === 202) && !explicit.length) {
        lastRun[site.host] = startedAt;
      }
    }
    results.push({ host: site.host, urls: urls.length, statuses, sample: urls.slice(0, 20) });
  }

  if (!dry) await writeLastRun(lastRun);
  return NextResponse.json({ success: true, dry, all, results });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

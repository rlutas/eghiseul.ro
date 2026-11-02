import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCjoClient } from '@/lib/supabase/cjo';
import { checkPermission } from '@/lib/admin/permissions';
import { CLIENT_ERROR_KINDS } from '@/lib/client-errors/schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface ErrorRow {
  id: string;
  created_at: string;
  platform: string;
  kind: string;
  code: string | null;
  message: string | null;
  page: string | null;
  step: string | null;
  service_slug: string | null;
  order_ref: string | null;
  user_agent: string | null;
  meta: Record<string, unknown> | null;
}

const KIND_LABEL: Record<string, string> = {
  image_decode: 'Poză nedecodificată',
  image_compress: 'Poză neprocesată',
  upload_failed: 'Încărcare eșuată',
  cnp_invalid: 'CNP invalid',
  ocr_failed: 'Citire act eșuată',
  kyc_failed: 'Verificare act eșuată',
  payment_error: 'Eroare plată',
  other: 'Altele',
};

const PLATFORM_LABEL: Record<string, string> = {
  eghiseul: 'eghiseul',
  documentero: 'documentero',
  cjo: 'CJO',
  ecazier: 'ecazier',
};

const COLUMNS = 'id, created_at, platform, kind, code, message, page, step, service_slug, order_ref, user_agent, meta';
const MAX_ROWS = 5000;

function sinceIsoFor(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dayKey(iso: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest' }).format(new Date(iso));
}

/** „iPhone iOS 15" / „Android 13 Chrome" — enough to spot old devices. */
function shortUa(ua: string | null): string {
  if (!ua) return '—';
  const ios = ua.match(/(iPhone|iPad).*?OS (\d+)[_.](\d+)/);
  if (ios) return `${ios[1]} iOS ${ios[2]}.${ios[3]}`;
  const android = ua.match(/Android (\d+(?:\.\d+)?)/);
  const browser = /SamsungBrowser/.test(ua) ? 'Samsung' : /Firefox/.test(ua) ? 'Firefox' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : '';
  if (android) return `Android ${android[1]} ${browser}`.trim();
  if (/Macintosh/.test(ua)) return `Mac ${browser}`.trim();
  if (/Windows/.test(ua)) return `Windows ${browser}`.trim();
  return browser || ua.slice(0, 30);
}

function metaText(meta: Record<string, unknown> | null): string {
  if (!meta) return '';
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(' · ');
}

export default async function ClientErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; kind?: string; platform?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const allowed =
    (await checkPermission(user.id, 'orders.view')) || (await checkPermission(user.id, 'settings.manage'));
  if (!allowed) redirect('/admin');

  const sp = await searchParams;
  const days = sp.days === '30' ? 30 : 7;
  const kind = sp.kind && (CLIENT_ERROR_KINDS as readonly string[]).includes(sp.kind) ? sp.kind : '';
  const platform = sp.platform && /^[a-z]{2,20}$/.test(sp.platform) ? sp.platform : '';
  const sinceIso = sinceIsoFor(days);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (client: any) => {
    let q = client.from('client_error_log').select(COLUMNS).gte('created_at', sinceIso);
    if (kind) q = q.eq('kind', kind);
    return q.order('created_at', { ascending: false }).limit(MAX_ROWS);
  };

  const notes: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  let rows: ErrorRow[] = [];
  {
    const { data, error } = await query(admin);
    if (error) notes.push(`eghiseul: ${error.message}`);
    rows = rows.concat((data ?? []) as ErrorRow[]);
  }
  const cjo = createCjoClient();
  if (!cjo) {
    notes.push('CJO: conexiunea la baza CJO nu e configurată.');
  } else {
    const { data, error } = await query(cjo);
    if (error) {
      notes.push(
        /client_error_log|does not exist|schema cache|PGRST205/i.test(error.message)
          ? 'CJO: tabela de erori nu există încă — se văd doar erorile eghiseul/documentero.'
          : `CJO: ${error.message}`
      );
    } else {
      rows = rows.concat(((data ?? []) as ErrorRow[]).map((r) => ({ ...r, id: `cjo-${r.id}` })));
    }
  }
  const platforms = Array.from(new Set(rows.map((r) => r.platform))).sort();
  if (platform) rows = rows.filter((r) => r.platform === platform);
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Counts.
  const byKind = new Map<string, number>();
  const byDay = new Map<string, Map<string, number>>();
  const byOrder = new Map<string, { count: number; kinds: Set<string>; platform: string; last: string }>();
  for (const r of rows) {
    byKind.set(r.kind, (byKind.get(r.kind) ?? 0) + 1);
    const d = dayKey(r.created_at);
    const perDay = byDay.get(d) ?? new Map<string, number>();
    perDay.set(r.kind, (perDay.get(r.kind) ?? 0) + 1);
    byDay.set(d, perDay);
    if (r.order_ref) {
      const o = byOrder.get(r.order_ref) ?? { count: 0, kinds: new Set<string>(), platform: r.platform, last: r.created_at };
      o.count += 1;
      o.kinds.add(r.kind);
      if (r.created_at > o.last) o.last = r.created_at;
      byOrder.set(r.order_ref, o);
    }
  }
  const kindsPresent = Array.from(byKind.keys()).sort((a, b) => (byKind.get(b) ?? 0) - (byKind.get(a) ?? 0));
  const dayKeys = Array.from(byDay.keys()).sort().reverse();

  // Link eghiseul/documentero refs to the admin order page (uuid route).
  const localRefs = Array.from(byOrder.entries())
    .filter(([, o]) => o.platform === 'eghiseul' || o.platform === 'documentero')
    .map(([ref]) => ref);
  const orderIdByRef = new Map<string, string>();
  if (localRefs.length) {
    const { data } = await admin
      .from('orders')
      .select('id, friendly_order_id')
      .in('friendly_order_id', localRefs.slice(0, 500));
    for (const o of (data ?? []) as { id: string; friendly_order_id: string }[]) {
      orderIdByRef.set(o.friendly_order_id, o.id);
    }
  }
  const orderLink = (ref: string) => {
    const id = orderIdByRef.get(ref);
    return id ? (
      <Link href={`/admin/orders/${id}`} className="font-mono text-primary-700 underline">
        {ref}
      </Link>
    ) : (
      <span className="font-mono">{ref}</span>
    );
  };

  const href = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ days: String(days), ...(kind ? { kind } : {}), ...(platform ? { platform } : {}), ...patch });
    for (const [k, v] of Array.from(p.entries())) if (!v) p.delete(k);
    return `/admin/erori-clienti?${p.toString()}`;
  };
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? 'border-neutral-900 bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-50'}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Erori clienți</h1>
        <p className="text-sm text-neutral-500">
          Erorile afișate clienților în formular (poză care nu se poate citi, CNP greșit, citire act eșuată,
          încărcare eșuată), înregistrate automat. Fără date personale: nu se salvează CNP-ul, numele sau poza.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={href({ days: '7' })} className={chip(days === 7)}>7 zile</Link>
        <Link href={href({ days: '30' })} className={chip(days === 30)}>30 zile</Link>
        <span className="mx-2 text-neutral-300">|</span>
        <Link href={href({ kind: '' })} className={chip(!kind)}>Toate tipurile</Link>
        {CLIENT_ERROR_KINDS.map((k) => (
          <Link key={k} href={href({ kind: k })} className={chip(kind === k)}>
            {KIND_LABEL[k]}
          </Link>
        ))}
        <span className="mx-2 text-neutral-300">|</span>
        <Link href={href({ platform: '' })} className={chip(!platform)}>Toate site-urile</Link>
        {platforms.map((p) => (
          <Link key={p} href={href({ platform: p })} className={chip(platform === p)}>
            {PLATFORM_LABEL[p] ?? p}
          </Link>
        ))}
      </div>

      {notes.length > 0 && (
        <div className="rounded-lg border bg-neutral-50 p-3 text-xs text-neutral-600">
          {notes.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-neutral-500">Total {days} zile</div>
          <div className="text-3xl font-bold tabular-nums">{rows.length}</div>
          <div className="text-xs text-neutral-500">{byOrder.size} comenzi distincte</div>
        </div>
        {kindsPresent.slice(0, 3).map((k) => (
          <div key={k} className="rounded-lg border bg-white p-4">
            <div className="text-sm text-neutral-500">{KIND_LABEL[k] ?? k}</div>
            <div className="text-3xl font-bold tabular-nums">{byKind.get(k)}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-2 font-medium">Pe zile</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ziua</TableHead>
              {kindsPresent.map((k) => (
                <TableHead key={k} className="text-right">{KIND_LABEL[k] ?? k}</TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dayKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={kindsPresent.length + 2} className="py-6 text-center text-neutral-500">
                  Nicio eroare înregistrată în perioada aleasă.
                </TableCell>
              </TableRow>
            )}
            {dayKeys.map((d) => {
              const perDay = byDay.get(d)!;
              const total = Array.from(perDay.values()).reduce((s, n) => s + n, 0);
              return (
                <TableRow key={d}>
                  <TableCell>{d.split('-').reverse().join('.')}</TableCell>
                  {kindsPresent.map((k) => (
                    <TableCell key={k} className="text-right tabular-nums">{perDay.get(k) ?? ''}</TableCell>
                  ))}
                  <TableCell className="text-right font-medium tabular-nums">{total}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {byOrder.size > 0 && (
        <div className="rounded-lg border bg-white">
          <div className="border-b px-4 py-2 font-medium">Pe comenzi</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comanda</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Tipuri</TableHead>
                <TableHead className="text-right">Erori</TableHead>
                <TableHead>Ultima</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(byOrder.entries())
                .sort((a, b) => b[1].last.localeCompare(a[1].last))
                .slice(0, 200)
                .map(([ref, o]) => (
                  <TableRow key={ref}>
                    <TableCell>{orderLink(ref)}</TableCell>
                    <TableCell>{PLATFORM_LABEL[o.platform] ?? o.platform}</TableCell>
                    <TableCell className="text-sm">{Array.from(o.kinds).map((k) => KIND_LABEL[k] ?? k).join(', ')}</TableCell>
                    <TableCell className="text-right tabular-nums">{o.count}</TableCell>
                    <TableCell>{fmt(o.last)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-2 font-medium">
          Ultimele erori {rows.length > 300 ? '(primele 300)' : ''}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Când</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Mesaj arătat clientului</TableHead>
              <TableHead>Pas / serviciu</TableHead>
              <TableHead>Comanda</TableHead>
              <TableHead>Dispozitiv</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 300).map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{fmt(r.created_at)}</TableCell>
                <TableCell>{PLATFORM_LABEL[r.platform] ?? r.platform}</TableCell>
                <TableCell>
                  <Badge variant="outline">{KIND_LABEL[r.kind] ?? r.kind}</Badge>
                  {r.code && <div className="mt-1 font-mono text-xs text-neutral-500">{r.code}</div>}
                </TableCell>
                <TableCell className="max-w-md text-sm">
                  {r.message}
                  {r.meta && <div className="mt-1 text-xs text-neutral-500">{metaText(r.meta)}</div>}
                </TableCell>
                <TableCell className="text-xs">
                  {r.step ?? '—'}
                  {r.service_slug && <div className="text-neutral-500">{r.service_slug}</div>}
                </TableCell>
                <TableCell className="text-sm">{r.order_ref ? orderLink(r.order_ref) : '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{shortUa(r.user_agent)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

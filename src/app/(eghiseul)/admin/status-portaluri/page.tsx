import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkPermission } from '@/lib/admin/permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface Outage {
  id: string;
  provider: 'onrc' | 'ancpi';
  cause: 'maintenance' | 'unreachable';
  started_at: string;
  ended_at: string | null;
  last_checked_at: string;
  detail: string | null;
}

const PROVIDER_LABEL: Record<Outage['provider'], string> = {
  onrc: 'Portal ONRC',
  ancpi: 'Portal ANCPI',
};

const CAUSE_LABEL: Record<Outage['cause'], string> = {
  maintenance: 'Mentenanță',
  unreachable: 'Indisponibil',
};

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Human-readable duration between two timestamps (ongoing → up to last check). */
function duration(startIso: string, endIso: string | null, lastCheckIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso ?? lastCheckIso).getTime();
  const mins = Math.max(0, Math.round((end - start) / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m ? `${h}h ${m}min` : `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}z ${h % 24}h`;
}

export default async function AdminPortalStatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!(await checkPermission(user.id, 'orders.view'))) redirect('/admin');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data } = await admin
    .from('platform_outages')
    .select('id, provider, cause, started_at, ended_at, last_checked_at, detail')
    .order('started_at', { ascending: false })
    .limit(200);
  const outages: Outage[] = data ?? [];

  const ongoing = outages.filter((o) => !o.ended_at);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stare portaluri</h1>
        <p className="text-sm text-neutral-500">
          Istoricul perioadelor de indisponibilitate ANCPI / ONRC, înregistrate automat de workeri la
          fiecare verificare (~60s).
        </p>
      </div>

      {ongoing.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="font-medium text-red-800">Indisponibil acum</div>
          <ul className="mt-1 text-sm text-red-700">
            {ongoing.map((o) => (
              <li key={o.id}>
                {PROVIDER_LABEL[o.provider]} — {CAUSE_LABEL[o.cause]}, din {fmt(o.started_at)} (
                {duration(o.started_at, null, o.last_checked_at)})
              </li>
            ))}
          </ul>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Portal</TableHead>
            <TableHead>Cauză</TableHead>
            <TableHead>Început</TableHead>
            <TableHead>Sfârșit</TableHead>
            <TableHead>Durată</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outages.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-neutral-500 py-8">
                Niciun downtime înregistrat încă.
              </TableCell>
            </TableRow>
          )}
          {outages.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{PROVIDER_LABEL[o.provider]}</TableCell>
              <TableCell>
                <Badge
                  className={
                    o.cause === 'maintenance'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-700'
                  }
                >
                  {CAUSE_LABEL[o.cause]}
                </Badge>
              </TableCell>
              <TableCell>{fmt(o.started_at)}</TableCell>
              <TableCell>
                {o.ended_at ? (
                  fmt(o.ended_at)
                ) : (
                  <span className="text-red-600 font-medium">în curs</span>
                )}
              </TableCell>
              <TableCell>{duration(o.started_at, o.ended_at, o.last_checked_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

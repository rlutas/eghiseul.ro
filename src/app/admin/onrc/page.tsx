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

interface OnrcJob {
  id: string;
  order_id: string;
  status: 'PENDING' | 'PROCESSING' | 'AWAITING_DOCUMENT' | 'NEEDS_OPERATOR' | 'DONE' | 'FAILED';
  document_type: string;
  cui: string;
  company_name: string | null;
  registration_number: string | null;
  onrc_request_id: string | null;
  onrc_draft_id: string | null;
  document_url: string | null;
  error_message: string | null;
  retry_count: number;
  awaiting_since: string | null;
  created_at: string;
  orders: { friendly_order_id: string | null } | { friendly_order_id: string | null }[] | null;
}

const STATUS_STYLE: Record<OnrcJob['status'], string> = {
  PENDING: 'bg-neutral-100 text-neutral-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  AWAITING_DOCUMENT: 'bg-indigo-100 text-indigo-700',
  NEEDS_OPERATOR: 'bg-amber-100 text-amber-800',
  DONE: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<OnrcJob['status'], string> = {
  PENDING: 'În așteptare',
  PROCESSING: 'Se procesează',
  AWAITING_DOCUMENT: 'Așteaptă documentul',
  NEEDS_OPERATOR: 'Necesită operator',
  DONE: 'Eliberat',
  FAILED: 'Eșuat',
};

function friendly(orders: OnrcJob['orders']): string {
  const o = Array.isArray(orders) ? orders[0] : orders;
  return o?.friendly_order_id ?? '—';
}

export default async function AdminOnrcPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!(await checkPermission(user.id, 'orders.view'))) redirect('/admin');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data } = await admin
    .from('onrc_jobs')
    .select('id, order_id, status, document_type, cui, company_name, registration_number, onrc_request_id, onrc_draft_id, document_url, error_message, retry_count, awaiting_since, created_at, orders(friendly_order_id)')
    .order('created_at', { ascending: false })
    .limit(200);
  const jobs: OnrcJob[] = data ?? [];

  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Cozi ONRC</h1>
        <p className="text-sm text-neutral-600">
          Job-uri de automatizare ONRC (certificat constatator). Worker-ul extern le procesează automat.
          Vezi <code className="text-xs">docs/technical/specs/onrc-automation-plan.md</code>.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Safeguards automate: <strong>FAILED</strong> (neplătit) se reîncearcă automat (max 4, backoff);
          job blocat în <strong>Se procesează</strong> &gt;10 min se recuperează; <strong>Așteaptă documentul</strong>
          &gt;2h → <strong>Necesită operator</strong> + email de înștiințare la client. Cele
          <strong> Necesită operator</strong> / <strong>Eșuat</strong> de mai jos cer intervenție manuală.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['PENDING', 'PROCESSING', 'AWAITING_DOCUMENT', 'NEEDS_OPERATOR', 'DONE', 'FAILED'] as const).map((s) => (
          <span key={s} className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s]}`}>
            {STATUS_LABEL[s]}: {counts[s] ?? 0}
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comandă</TableHead>
              <TableHead>Firmă (CUI)</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Eliberat</TableHead>
              <TableHead>Nr. înreg. / Id cerere</TableHead>
              <TableHead>Încercări</TableHead>
              <TableHead>Eroare</TableHead>
              <TableHead>Creat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-neutral-500 py-8">
                  Niciun job ONRC încă. Se creează automat la plata comenzilor de constatator.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{friendly(job.orders)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{job.company_name ?? '—'}</div>
                    <div className="text-xs text-neutral-500">{job.cui}</div>
                  </TableCell>
                  <TableCell className="text-xs">{job.document_type}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_STYLE[job.status]} border-0`}>{STATUS_LABEL[job.status]}</Badge>
                    {job.status === 'AWAITING_DOCUMENT' && job.awaiting_since && (
                      <div className="mt-0.5 text-[10px] text-neutral-500">
                        din {new Date(job.awaiting_since).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {job.document_url ? (
                      <span className="font-semibold text-green-700">✓ Da</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{job.registration_number ?? '—'}</div>
                    {job.onrc_draft_id ? (
                      <a
                        href={`https://myportal.onrc.ro/request?id=${job.onrc_draft_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 underline"
                        title="Deschide cererea pe portalul ONRC"
                      >
                        {job.onrc_request_id ?? 'cerere ONRC'} ↗
                      </a>
                    ) : (
                      <div className="text-neutral-500">{job.onrc_request_id ?? ''}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{job.retry_count}</TableCell>
                  <TableCell className="text-xs text-red-600 max-w-[240px] truncate" title={job.error_message ?? ''}>
                    {job.error_message ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                    {new Date(job.created_at).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

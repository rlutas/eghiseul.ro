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
import { RefreshButton } from '@/components/admin/refresh-button';
import { OnrcManualUpload } from './OnrcManualUpload';

export const dynamic = 'force-dynamic';

interface OnrcJob {
  id: string;
  order_id: string;
  status: 'PENDING' | 'PROCESSING' | 'AWAITING_DOCUMENT' | 'NEEDS_OPERATOR' | 'DONE' | 'FAILED';
  document_type: string;
  cui: string | null;
  company_name: string | null;
  detail: Record<string, unknown> | null;
  registration_number: string | null;
  onrc_request_id: string | null;
  onrc_draft_id: string | null;
  onrc_calc_note: string | null;
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

const EVENT_LABEL: Record<string, string> = {
  claimed_submit: 'Preluat (depunere)',
  claimed_retrieve: 'Verificare document',
  submitted: 'Depus + plătit',
  awaiting: 'Așteaptă document',
  done: 'Eliberat',
  failed: 'Eșuat',
  needs_operator: 'Necesită operator',
  retry: 'Reîncercare',
  reaper: 'Recuperat (crash)',
  stuck: 'Blocat',
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

// constatator subtype label (detail.documentType: firma | istoric | pf).
const SUBTYPE_LABEL: Record<string, string> = {
  firma: 'Pe firmă',
  istoric: 'Cu istoric',
  pf: 'Persoană fizică',
};
function subtypeOf(detail: OnrcJob['detail']): string {
  const d = String(detail?.documentType ?? '');
  return SUBTYPE_LABEL[d] ?? (d || '—');
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
    .select('id, order_id, status, document_type, cui, company_name, detail, registration_number, onrc_request_id, onrc_draft_id, onrc_calc_note, document_url, error_message, retry_count, awaiting_since, created_at, orders(friendly_order_id)')
    .order('created_at', { ascending: false })
    .limit(200);
  const jobs: OnrcJob[] = data ?? [];

  // Chronological activity log per job (newest first) — "ce a făcut botul".
  const jobIds = jobs.map((j) => j.id);
   
  const eventsByJob: Record<string, { type: string; message: string | null; created_at: string }[]> = {};
  if (jobIds.length > 0) {
    const { data: events } = await admin
      .from('onrc_job_events')
      .select('job_id, type, message, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })
      .limit(800);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const e of (events ?? []) as any[]) {
      (eventsByJob[e.job_id] ??= []).push({ type: e.type, message: e.message, created_at: e.created_at });
    }
  }

  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
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
      <RefreshButton />
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
              <TableHead>Subiect (firmă / persoană)</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acțiune manuală</TableHead>
              <TableHead>Eliberat</TableHead>
              <TableHead>Nr. înreg. / Id cerere</TableHead>
              <TableHead>Notă calcul (contabilitate)</TableHead>
              <TableHead>Jurnal (ce a făcut botul)</TableHead>
              <TableHead>Încercări</TableHead>
              <TableHead>Eroare</TableHead>
              <TableHead>Creat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-neutral-500 py-8">
                  Niciun job ONRC încă. Se creează automat la plata comenzilor de constatator.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{friendly(job.orders)}</TableCell>
                  <TableCell>
                    {String(job.detail?.documentType ?? '') === 'pf' ? (
                      <>
                        <div className="text-sm">{String(job.detail?.requesterName ?? '—')}</div>
                        <div className="text-xs text-neutral-500">CNP {String(job.detail?.requesterCnp ?? '—')}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm">{job.company_name ?? '—'}</div>
                        <div className="text-xs text-neutral-500">{job.cui ?? '—'}</div>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{subtypeOf(job.detail)}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_STYLE[job.status]} border-0`}>{STATUS_LABEL[job.status]}</Badge>
                    {job.status === 'AWAITING_DOCUMENT' && job.awaiting_since && (
                      <div className="mt-0.5 text-[10px] text-neutral-500">
                        din {new Date(job.awaiting_since).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {(job.status === 'NEEDS_OPERATOR' || job.status === 'FAILED') ? (
                      <OnrcManualUpload orderId={job.order_id} />
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
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
                  <TableCell className="text-xs">
                    {job.onrc_calc_note ? (
                      <span className="font-mono font-semibold text-neutral-800">{job.onrc_calc_note}</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs max-w-[280px]">
                    {(eventsByJob[job.id] ?? []).length === 0 ? (
                      <span className="text-neutral-400">—</span>
                    ) : (
                      <ul className="space-y-0.5">
                        {(eventsByJob[job.id] ?? []).slice(0, 5).map((e, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-neutral-400 whitespace-nowrap">
                              {new Date(e.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' })}
                            </span>
                            <span className="text-neutral-700">
                              <span className="font-medium">{EVENT_LABEL[e.type] ?? e.type}</span>
                              {e.message ? ` — ${e.message}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{job.retry_count}</TableCell>
                  <TableCell className="text-xs text-red-600 max-w-[240px] truncate" title={job.error_message ?? ''}>
                    {job.error_message ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                    {new Date(job.created_at).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Bucharest' })}
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

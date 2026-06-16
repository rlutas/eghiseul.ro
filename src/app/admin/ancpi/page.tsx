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
import { AncpiManualUpload } from './AncpiManualUpload';
import { AncpiCopyLog } from './AncpiCopyLog';

export const dynamic = 'force-dynamic';

type AncpiStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CHECKPOINT'
  | 'AWAITING_DOCUMENT'
  | 'NEEDS_OPERATOR'
  | 'DONE'
  | 'FAILED';

interface Imobil {
  judet?: string;
  uat?: string;
  identificator?: string;
  identificatorType?: string;
}

interface AncpiJob {
  id: string;
  order_id: string;
  status: AncpiStatus;
  service_type: string;
  prod_id: string | null;
  detail: { imobile?: Imobil[] } | null;
  registration_number: string | null;
  ancpi_order_id: string | null;
  document_url: string | null;
  chitanta_url: string | null;
  error_message: string | null;
  retry_count: number;
  awaiting_since: string | null;
  created_at: string;
  orders: { friendly_order_id: string | null } | { friendly_order_id: string | null }[] | null;
}

const STATUS_STYLE: Record<AncpiStatus, string> = {
  PENDING: 'bg-neutral-100 text-neutral-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  CHECKPOINT: 'bg-blue-100 text-blue-700',
  AWAITING_DOCUMENT: 'bg-indigo-100 text-indigo-700',
  NEEDS_OPERATOR: 'bg-amber-100 text-amber-800',
  DONE: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<AncpiStatus, string> = {
  PENDING: 'În așteptare',
  PROCESSING: 'Se procesează',
  CHECKPOINT: 'Comandă plasată',
  AWAITING_DOCUMENT: 'Așteaptă documentul',
  NEEDS_OPERATOR: 'Necesită operator',
  DONE: 'Eliberat',
  FAILED: 'Eșuat',
};

const EVENT_LABEL: Record<string, string> = {
  claimed_submit: 'Preluat (plasare)',
  claimed_retrieve: 'Verificare document',
  placed: 'Comandă plasată + plătită',
  awaiting: 'Așteaptă document',
  done: 'Eliberat',
  failed: 'Eșuat',
  needs_operator: 'Necesită operator',
  retry: 'Reîncercare',
  reaper: 'Recuperat (crash)',
  stuck: 'Blocat',
};

const SERVICE_LABEL: Record<string, string> = {
  EXTRAS_CF: 'Extras CF',
  EXTRAS_PLAN_CADASTRAL: 'Plan cadastral',
  IDENTIFICARE_PROPRIETAR: 'Identificare (proprietar)',
  IDENTIFICARE_ADRESA: 'Identificare (adresă)',
};

function friendly(orders: AncpiJob['orders']): string {
  const o = Array.isArray(orders) ? orders[0] : orders;
  return o?.friendly_order_id ?? '—';
}

export default async function AdminAncpiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!(await checkPermission(user.id, 'orders.view'))) redirect('/admin');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data } = await admin
    .from('ancpi_jobs')
    .select(
      'id, order_id, status, service_type, prod_id, detail, registration_number, ancpi_order_id, document_url, chitanta_url, error_message, retry_count, awaiting_since, created_at, orders(friendly_order_id)'
    )
    .order('created_at', { ascending: false })
    .limit(200);
  const jobs: AncpiJob[] = data ?? [];

  const jobIds = jobs.map((j) => j.id);
  const eventsByJob: Record<string, { type: string; message: string | null; created_at: string }[]> = {};
  if (jobIds.length > 0) {
    const { data: events } = await admin
      .from('ancpi_job_events')
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Cozi ANCPI</h1>
        <p className="text-sm text-neutral-600">
          Job-uri de automatizare ANCPI (extras carte funciară). Worker-ul extern le procesează automat.
          Vezi <code className="text-xs">docs/technical/specs/ancpi-automation-plan.md</code>.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Safeguards automate: <strong>FAILED</strong> (fără comandă plasată) se reîncearcă automat (max 4, backoff);
          job blocat în <strong>Se procesează</strong> &gt;10 min se recuperează; <strong>Așteaptă documentul</strong>
          &gt;2h → <strong>Necesită operator</strong> + email la client. Cele
          <strong> Necesită operator</strong> / <strong>Eșuat</strong> de mai jos cer intervenție manuală
          (CF colectivă, plan cadastral, identificare).
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
              <TableHead>Imobil (județ / UAT / nr.)</TableHead>
              <TableHead>Serviciu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acțiune manuală</TableHead>
              <TableHead>Eliberat</TableHead>
              <TableHead>Nr. înreg. / Comandă ePay</TableHead>
              <TableHead>Jurnal (ce a făcut workerul)</TableHead>
              <TableHead>Încercări</TableHead>
              <TableHead>Eroare</TableHead>
              <TableHead>Creat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-neutral-500 py-8">
                  Niciun job ANCPI încă. Se creează automat la plata comenzilor de extras carte funciară.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => {
                const im = job.detail?.imobile?.[0];
                const logText = [
                  `Comandă: ${friendly(job.orders)}`,
                  `Job: ${job.id}`,
                  `Status: ${job.status}`,
                  `Serviciu: ${job.service_type}`,
                  `Imobil: ${[im?.judet, im?.uat].filter(Boolean).join(' / ')} — ${im?.identificatorType ?? 'CF'} ${im?.identificator ?? ''}`,
                  job.ancpi_order_id ? `Comandă ePay: ${job.ancpi_order_id}` : null,
                  job.registration_number ? `Nr. înreg.: ${job.registration_number}` : null,
                  `Încercări: ${job.retry_count}`,
                  job.error_message ? `EROARE: ${job.error_message}` : null,
                  '--- Jurnal ---',
                  ...(eventsByJob[job.id] ?? []).map(
                    (e) => `${new Date(e.created_at).toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}  ${EVENT_LABEL[e.type] ?? e.type}${e.message ? ` — ${e.message}` : ''}`
                  ),
                ].filter(Boolean).join('\n');
                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{friendly(job.orders)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{[im?.judet, im?.uat].filter(Boolean).join(' / ') || '—'}</div>
                      <div className="text-xs text-neutral-500">
                        {im?.identificatorType ?? 'CF'} {im?.identificator ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{SERVICE_LABEL[job.service_type] ?? job.service_type}</TableCell>
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
                        <AncpiManualUpload orderId={job.order_id} />
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
                      <div className="text-neutral-500">{job.ancpi_order_id ?? ''}</div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[280px] align-top">
                      <div className="mb-1"><AncpiCopyLog text={logText} /></div>
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
                    <TableCell className="text-xs text-red-600 max-w-[320px] align-top">
                      {job.error_message ? (
                        <div className="whitespace-pre-wrap break-words">{job.error_message}</div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                      {new Date(job.created_at).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Bucharest' })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

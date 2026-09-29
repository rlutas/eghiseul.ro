import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, MessageSquareWarning } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { formatRoDate } from '@/lib/knowledge/parse';
import { getDownloadUrl } from '@/lib/aws/s3';
import {
  listReports,
  REPORT_KIND_LABEL,
  REPORT_SITE_LABEL,
  REPORT_STATUS_LABEL,
  type KnowledgeReport,
} from '@/lib/knowledge/reports';
import { ReportActions } from './report-actions';

export const dynamic = 'force-dynamic';

const STATUS_ORDER: KnowledgeReport['status'][] = ['nou', 'in_lucru', 'rezolvat'];
const STATUS_CLASS: Record<KnowledgeReport['status'], string> = {
  nou: 'bg-red-100 text-red-800',
  in_lucru: 'bg-amber-100 text-amber-800',
  rezolvat: 'bg-green-100 text-green-800',
};
const KIND_CLASS: Record<KnowledgeReport['kind'], string> = {
  problema: 'bg-red-50 text-red-700 border-red-200',
  sugestie: 'bg-blue-50 text-blue-700 border-blue-200',
  'intrebare-fara-raspuns': 'bg-amber-50 text-amber-800 border-amber-200',
};

/**
 * Rapoartele din Ghid, grupate pe status: ce a raportat echipa și
 * colaboratorul (probleme, sugestii) + întrebările la care chatbotul n-a
 * găsit răspuns. Raul le mută în lucru / rezolvat, cu notă.
 */
export default async function GhidRapoartePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/ghid/rapoarte');
  try {
    await requireAdmin(user.id);
  } catch {
    redirect('/admin');
  }

  const reports = await listReports();
  // Capturile de ecran: link semnat pe o oră, doar pentru cine deschide pagina.
  const shotUrls = new Map<string, string>();
  await Promise.all(
    reports.flatMap((r) =>
      (r.context?.attachments ?? []).map(async (a) => {
        try {
          shotUrls.set(a.key, await getDownloadUrl(a.key, 3600));
        } catch (e) {
          console.error('[ghid/rapoarte] signed url failed:', a.key, e);
        }
      })
    )
  );
  const byStatus = new Map<KnowledgeReport['status'], KnowledgeReport[]>();
  for (const s of STATUS_ORDER) byStatus.set(s, []);
  for (const r of reports) byStatus.get(r.status)?.push(r);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/ghid" className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Ghid &amp; noutăți
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquareWarning className="h-6 w-6" />
          Rapoarte din Ghid
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Problemele și sugestiile trimise de echipă și de colaborator din Ghid, plus întrebările la care chatbotul nu
          a găsit răspuns în documentație. Rezolvi în platformă sau în ghid, apoi marchezi rezolvat.
        </p>
      </div>

      {STATUS_ORDER.map((status) => {
        const list = byStatus.get(status) ?? [];
        const shown = status === 'rezolvat' ? list.slice(0, 30) : list;
        return (
          <section key={status} className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[status]}`}>{REPORT_STATUS_LABEL[status]}</span>
              <span className="text-sm text-muted-foreground">{list.length}</span>
            </h2>
            {shown.length === 0 && <p className="text-sm text-muted-foreground">Nimic aici.</p>}
            {shown.map((r) => (
              <article key={r.id} className="rounded-lg border bg-white p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                  <span className={`rounded border px-2 py-0.5 ${KIND_CLASS[r.kind]}`}>{REPORT_KIND_LABEL[r.kind]}</span>
                  <span>{r.audience === 'collaborator' ? 'colaborator (topograf)' : 'echipă'}</span>
                  {r.reporter_email && <span>· {r.reporter_email}</span>}
                  <span>· {formatRoDate(r.created_at.slice(0, 10))}</span>
                  {r.context?.orderNumber && <span className="font-mono">· {r.context.orderNumber}</span>}
                  {r.context?.page && <span className="truncate max-w-[40ch]">· {r.context.page}</span>}
                </div>
                {!!r.context?.sites?.length && (
                  <div className="flex flex-wrap gap-1">
                    {r.context.sites.map((s) => (
                      <span key={s} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                        {REPORT_SITE_LABEL[s] ?? s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                {!!r.context?.attachments?.length && (
                  <div className="flex flex-wrap gap-2">
                    {r.context.attachments.map((a) => {
                      const url = shotUrls.get(a.key);
                      return url ? (
                        <a key={a.key} href={url} target="_blank" rel="noopener" className="block h-24 w-32 overflow-hidden rounded border hover:ring-2 hover:ring-amber-400" title={a.name}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL */}
                          <img src={url} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
                        </a>
                      ) : (
                        <span key={a.key} className="rounded border px-2 py-1 text-xs text-neutral-500">{a.name} (indisponibilă)</span>
                      );
                    })}
                  </div>
                )}
                {(r.context?.question || r.context?.answer) && (
                  <details className="text-xs text-neutral-700">
                    <summary className="cursor-pointer select-none">Întrebarea și răspunsul chatbotului</summary>
                    {r.context.question && (
                      <p className="mt-1">
                        <span className="font-semibold">Î:</span> {r.context.question}
                      </p>
                    )}
                    {r.context.answer && (
                      <p className="mt-1 whitespace-pre-wrap">
                        <span className="font-semibold">R:</span> {r.context.answer}
                      </p>
                    )}
                  </details>
                )}
                {r.resolution_note && (
                  <p className="text-xs text-green-800 bg-green-50 rounded px-2 py-1 whitespace-pre-wrap">Rezolvare: {r.resolution_note}</p>
                )}
                <ReportActions id={r.id} status={r.status} note={r.resolution_note} />
              </article>
            ))}
            {status === 'rezolvat' && list.length > 30 && (
              <p className="text-xs text-muted-foreground">Sunt afișate ultimele 30 din {list.length}.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

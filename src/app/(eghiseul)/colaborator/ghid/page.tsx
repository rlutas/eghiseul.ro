import Link from 'next/link';
import { Suspense } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { loadCollaboratorDocs } from '@/lib/knowledge/docs';
import { requireCollaboratorOrAdmin } from '@/lib/knowledge/collaborator-access';
import { GhidAsk } from '@/components/knowledge/ghid-ask';

export const dynamic = 'force-dynamic';

/**
 * Ghidul colaboratorului (topograful nu are acces la /admin/ghid): doar
 * documentele echipei marcate `<!-- audienta: colaborator -->`.
 */
export default async function ColaboratorGhidPage() {
  await requireCollaboratorOrAdmin();
  const docs = await loadCollaboratorDocs();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Ghid
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cum funcționează serviciile pe care le lucrezi, ce apeși în portal și ce vede clientul.
          Aceleași pagini le citește și echipa, deci sunt mereu la zi.
        </p>
      </div>
      <Suspense fallback={null}>
        <GhidAsk audience="collaborator" page="/colaborator/ghid" />
      </Suspense>
      <ul className="space-y-2">
        {docs.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/colaborator/ghid/${d.slug}/`}
              className="flex items-start gap-3 rounded-lg border bg-white p-4 hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
            >
              <FileText className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
              <span className="text-sm font-semibold leading-tight">{d.title}</span>
            </Link>
          </li>
        ))}
        {docs.length === 0 && <li className="text-sm text-muted-foreground">Niciun ghid publicat încă.</li>}
      </ul>
    </div>
  );
}

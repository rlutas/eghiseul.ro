import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { resolveCollaboratorDoc } from '@/lib/knowledge/docs';
import { renderMarkdown } from '@/lib/knowledge/render';
import { extractTitle } from '@/lib/knowledge/parse';
import { requireCollaboratorOrAdmin } from '@/lib/knowledge/collaborator-access';

export const dynamic = 'force-dynamic';

/**
 * Un ghid din portalul colaboratorului. Servește DOAR documentele marcate
 * pentru colaborator (restul dau 404, chiar dacă există în docs/); linkurile
 * dintre documente rămân în portal (`/colaborator/ghid/...`).
 */
export default async function ColaboratorGhidDocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  await requireCollaboratorOrAdmin();
  const { slug } = await params;
  const doc = await resolveCollaboratorDoc(slug);
  if (!doc) notFound();

  const title = extractTitle(doc.content) ?? doc.relPath;
  const html = renderMarkdown(doc.content, doc.relPath, '/colaborator/ghid');

  return (
    <div className="space-y-4 max-w-4xl">
      <Link href="/colaborator/ghid" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Ghid
      </Link>
      <article
        aria-label={title}
        className="prose prose-sm sm:prose-base max-w-none bg-white rounded-lg border p-6 sm:p-8 break-words prose-headings:scroll-mt-4 prose-table:text-xs prose-a:text-primary-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { resolveDocFromSlugParts } from '@/lib/knowledge/docs';
import { renderMarkdown } from '@/lib/knowledge/render';
import { extractTitle } from '@/lib/knowledge/parse';

export const dynamic = 'force-dynamic';

/**
 * Viewer pentru orice document markdown din `docs/` — `/admin/ghid/<cale>/`.
 * Linkurile dintre documente sunt rescrise ca să rămână în admin.
 */
export default async function GhidDocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/ghid');
  try {
    await requireAdmin(user.id);
  } catch {
    redirect('/admin');
  }

  const { slug } = await params;
  const doc = await resolveDocFromSlugParts(slug);
  if (!doc) notFound();

  const title = extractTitle(doc.content) ?? doc.relPath;
  const html = renderMarkdown(doc.content, doc.relPath);
  const crumbs = doc.relPath.replace(/\.md$/, '').split('/');

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/ghid" className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Ghid &amp; noutăți
        </Link>
        <span>/</span>
        <span className="font-mono text-xs">{crumbs.join(' / ')}</span>
      </div>
      <article
        className="prose prose-sm sm:prose-base max-w-none bg-white rounded-lg border p-6 sm:p-8 break-words prose-headings:scroll-mt-4 prose-table:text-xs prose-a:text-primary-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p className="text-xs text-muted-foreground">
        Sursă: <span className="font-mono">docs/{doc.relPath}</span>. Titlu: {title}.
      </p>
    </div>
  );
}

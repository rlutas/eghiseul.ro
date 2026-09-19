import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, FileText, Folder } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { listDirectory, resolveDocFromSlugParts } from '@/lib/knowledge/docs';
import { renderMarkdown } from '@/lib/knowledge/render';
import { extractTitle, normalizeDocSlug } from '@/lib/knowledge/parse';
import { folderLabel } from '@/lib/knowledge/search';

export const dynamic = 'force-dynamic';

/**
 * Viewer pentru orice document markdown din `docs/` — `/admin/ghid/<cale>/`.
 * Linkurile dintre documente sunt rescrise ca să rămână în admin. Când calea
 * e un folder, sub README (dacă există) apare lista fișierelor din el, ca
 * echipa să poată răsfoi toată documentația, nu doar ce e linkat.
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
  const normalized = normalizeDocSlug(slug);
  if (normalized === null) notFound();

  const [doc, dir] = await Promise.all([resolveDocFromSlugParts(slug), listDirectory(normalized)]);
  if (!doc && !dir) notFound();

  const title = doc ? extractTitle(doc.content) ?? doc.relPath : folderLabel(normalized.split('/').pop() ?? normalized);
  const html = doc ? renderMarkdown(doc.content, doc.relPath) : null;
  const crumbs = normalized.split('/');

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/ghid" className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Ghid &amp; noutăți
        </Link>
        {crumbs.map((c, i) => {
          const href = `/admin/ghid/${crumbs.slice(0, i + 1).join('/')}/`;
          const last = i === crumbs.length - 1;
          return (
            <span key={href} className="flex items-center gap-2">
              <span>/</span>
              {last ? (
                <span className="font-mono text-xs">{c}</span>
              ) : (
                <Link href={href} className="font-mono text-xs hover:underline">
                  {c}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      {html ? (
        <article
          className="prose prose-sm sm:prose-base max-w-none bg-white rounded-lg border p-6 sm:p-8 break-words prose-headings:scroll-mt-4 prose-table:text-xs prose-a:text-primary-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Folder className="h-6 w-6" />
          {title}
        </h1>
      )}

      {dir && (dir.subdirs.length > 0 || dir.files.length > 0) && (
        <section className="bg-white rounded-lg border p-4 sm:p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-700">
            În acest folder ({dir.files.length} documente
            {dir.subdirs.length ? `, ${dir.subdirs.length} subfoldere` : ''})
          </h2>
          {dir.subdirs.length > 0 && (
            <ul className="text-sm space-y-1">
              {dir.subdirs.map((s) => (
                <li key={s.slug} className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-neutral-400 shrink-0" />
                  <Link href={`/admin/ghid/${s.slug}/`} className="text-primary-700 hover:underline">
                    {folderLabel(s.name)}
                  </Link>
                  <span className="text-xs text-neutral-400 font-mono">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
          {dir.files.length > 0 && (
            <ul className="text-sm space-y-1">
              {dir.files.map((f) => (
                <li key={f.slug} className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                  <Link href={`/admin/ghid/${f.slug}/`} className="text-primary-700 hover:underline">
                    {f.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {doc && (
        <p className="text-xs text-muted-foreground">
          Sursă: <span className="font-mono">docs/{doc.relPath}</span>
        </p>
      )}
    </div>
  );
}

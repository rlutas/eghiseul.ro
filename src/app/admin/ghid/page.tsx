import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, GitCommitHorizontal, Newspaper, Sparkles, Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  CURATED_GUIDES,
  loadAllTeamDocs,
  loadChangelog,
  loadPlatformVersion,
} from '@/lib/knowledge/docs';
import { renderInline, renderMarkdown } from '@/lib/knowledge/render';
import { formatRoDate, type ChangelogKind } from '@/lib/knowledge/parse';
import { MarkGhidSeen } from './mark-seen';

export const dynamic = 'force-dynamic';

/**
 * Knowledge Center pentru echipă (14.09.2026, cerere Raul): tot ce s-a livrat,
 * pe zile, plus procedurile — citite direct din `docs/`, deci mereu în pas cu
 * ce e deployat. Înlocuiește mesajele pe WhatsApp la fiecare livrare.
 */

const KIND_LABEL: Record<ChangelogKind, { label: string; className: string }> = {
  feature: { label: 'Funcție nouă', className: 'bg-violet-100 text-violet-900 border-violet-200' },
  fix: { label: 'Reparat', className: 'bg-red-100 text-red-900 border-red-200' },
  change: { label: 'Schimbare', className: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  refactor: { label: 'Îmbunătățire', className: 'bg-sky-100 text-sky-900 border-sky-200' },
  discovery: { label: 'Analiză', className: 'bg-amber-100 text-amber-900 border-amber-200' },
  other: { label: 'Livrare', className: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
};

const RECENT_LIMIT = 40;

export default async function GhidPage() {
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

  const [entries, version, allDocs] = await Promise.all([
    loadChangelog({ limit: RECENT_LIMIT }),
    loadPlatformVersion(),
    loadAllTeamDocs(),
  ]);

  // Grupăm pe zi — mai multe livrări în aceeași zi stau sub o singură dată.
  const byDate = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  const curatedSlugs = new Set(CURATED_GUIDES.map((g) => g.slug));
  const otherDocs = allDocs.filter((d) => !curatedSlugs.has(d.slug) && !/\/README$/.test(d.slug) && d.slug !== 'admin');

  return (
    <div className="space-y-8">
      <MarkGhidSeen latestDate={version.latestDate} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Ghid &amp; noutăți
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Tot ce s-a livrat pe platformă, pe zile, și procedurile de lucru ale echipei. Se
            citește direct din documentația proiectului, deci e mereu la zi cu ce e în producție.
          </p>
        </div>
        <Card className="min-w-[260px]">
          <CardContent className="pt-4 pb-4 text-sm space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <GitCommitHorizontal className="h-4 w-4" />
              Versiune platformă: <span className="font-mono">{version.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {version.releases} livrări documentate
              {version.latestDate ? ` · ultima pe ${formatRoDate(version.latestDate)}` : ''}
            </p>
            {version.commitSha && (
              <p className="text-xs text-muted-foreground font-mono truncate" title={version.commitMessage ?? ''}>
                build {version.commitSha}
                {version.commitMessage ? ` · ${version.commitMessage.split('\n')[0]}` : ''}
              </p>
            )}
            {version.buildTime && (
              <p className="text-xs text-muted-foreground">
                deploy {new Date(version.buildTime).toLocaleString('ro-RO')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Noutăți */}
        <section className="space-y-6 min-w-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Ce s-a livrat
          </h2>
          {Array.from(byDate.entries()).map(([date, list]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 sticky top-0 bg-gray-50 py-1">
                {formatRoDate(date)}
              </h3>
              {list.map((e, i) => {
                const kind = KIND_LABEL[e.kind];
                const href = e.detailFile
                  ? `/admin/ghid/changelog/${e.detailFile.replace(/\.md$/, '')}/`
                  : null;
                return (
                  <Card key={`${date}-${i}`} className="overflow-hidden">
                    <CardContent className="pt-4 pb-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className={`shrink-0 ${kind.className}`}>
                          {kind.label}
                        </Badge>
                        {href && (
                          <Link href={href} className="ml-auto text-xs text-primary-700 hover:underline shrink-0">
                            Detalii →
                          </Link>
                        )}
                      </div>
                      {e.teamMd ? (
                        <>
                          <div
                            className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(e.teamMd, `changelog/${e.detailFile}`),
                            }}
                          />
                          <details className="text-xs text-neutral-600">
                            <summary className="cursor-pointer select-none">Rezumat tehnic</summary>
                            <div
                              className="prose prose-xs max-w-none mt-2 break-words"
                              dangerouslySetInnerHTML={{
                                __html: renderInline(e.summaryMd, 'changelog/README.md'),
                              }}
                            />
                          </details>
                        </>
                      ) : (
                        <div
                          className="prose prose-sm max-w-none break-words prose-p:my-1"
                          dangerouslySetInnerHTML={{
                            __html: renderInline(e.summaryMd, 'changelog/README.md'),
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Sunt afișate ultimele {RECENT_LIMIT} livrări.{' '}
            <Link href="/admin/ghid/changelog/" className="underline">
              Vezi tot jurnalul
            </Link>
            .
          </p>
        </section>

        {/* Ghiduri */}
        <aside className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Proceduri pentru echipă
            </h2>
            <div className="space-y-2">
              {CURATED_GUIDES.map((g) => (
                <Link
                  key={g.slug}
                  href={`/admin/ghid/${g.slug}/`}
                  className="block rounded-lg border bg-white p-3 hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
                >
                  <p className="text-sm font-semibold leading-tight">{g.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{g.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {otherDocs.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-neutral-700">
                <Wrench className="h-4 w-4" />
                Toată documentația de admin
              </h2>
              <ul className="text-sm space-y-1">
                {otherDocs.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/admin/ghid/${d.slug}/`} className="text-primary-700 hover:underline">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

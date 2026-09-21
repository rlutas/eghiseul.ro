import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { BookOpen, FileText, FolderOpen, MessageSquareWarning, Newspaper, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { Badge } from '@/components/ui/badge';
import {
  CURATED_GUIDES,
  loadAllTeamDocs,
  loadChangelog,
  loadPlatformVersion,
  loadTopFolders,
} from '@/lib/knowledge/docs';
import { renderInline, renderMarkdown } from '@/lib/knowledge/render';
import { formatRoDate, type ChangelogKind } from '@/lib/knowledge/parse';
import { CATEGORIES, CATEGORY_LABEL, isCategoryId, type CategoryId } from '@/lib/knowledge/categories';
import { countOpenReports } from '@/lib/knowledge/reports';
import { GhidAsk } from '@/components/knowledge/ghid-ask';
import { MarkGhidSeen } from './mark-seen';

export const dynamic = 'force-dynamic';

/**
 * Knowledge Center pentru echipă (14.09.2026; refăcut 21.09 la cererea lui
 * Raul: „mai ușor”). O singură casetă sus — caută sau întreabă chatbotul —
 * apoi trei taburi: Proceduri (implicit, cele curatoriate în grilă),
 * Noutăți (changelog-ul, pe zile, cu filtru pe categorie) și Toată
 * documentația (foldere). Totul citit din `docs/`, deci în pas cu deploy-ul.
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
type Tab = 'proceduri' | 'noutati' | 'documentatie';
const TABS: Array<{ id: Tab; label: string; icon: typeof Sparkles }> = [
  { id: 'proceduri', label: 'Proceduri', icon: Sparkles },
  { id: 'noutati', label: 'Noutăți', icon: Newspaper },
  { id: 'documentatie', label: 'Toată documentația', icon: FolderOpen },
];

function tabHref(tab: Tab, cat?: CategoryId | null): string {
  const qs = new URLSearchParams();
  if (tab !== 'proceduri') qs.set('tab', tab);
  if (tab === 'noutati' && cat) qs.set('cat', cat);
  const s = qs.toString();
  return s ? `/admin/ghid/?${s}` : '/admin/ghid/';
}

export default async function GhidPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === 'noutati' || sp.tab === 'documentatie' ? sp.tab : 'proceduri';
  const activeCat: CategoryId | null = isCategoryId(sp.cat) ? sp.cat : null;

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

  const [allEntries, version, allDocs, folders, openReports] = await Promise.all([
    loadChangelog(),
    loadPlatformVersion(),
    loadAllTeamDocs(),
    loadTopFolders(),
    countOpenReports().catch(() => 0),
  ]);

  const curatedSlugs = new Set(CURATED_GUIDES.map((g) => g.slug));
  const otherDocs = allDocs.filter((d) => !curatedSlugs.has(d.slug) && !/\/README$/.test(d.slug) && d.slug !== 'admin');
  const totalDocs = folders.reduce((s, f) => s + f.count, 0);

  // Noutăți: filtrul pe categorie se aplică pe tot jurnalul; fără filtru, ultimele RECENT_LIMIT.
  const catCounts = new Map<CategoryId, number>();
  for (const e of allEntries) catCounts.set(e.category, (catCounts.get(e.category) ?? 0) + 1);
  const entries = (activeCat ? allEntries.filter((e) => e.category === activeCat) : allEntries).slice(0, activeCat ? 200 : RECENT_LIMIT);
  const byDate = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }
  const latestThree = allEntries.slice(0, 3);

  return (
    <div className="space-y-6 max-w-5xl">
      <MarkGhidSeen latestDate={version.latestDate} />

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Ghid &amp; noutăți
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Cum funcționează platforma și ce s-a schimbat. Scris o dată, la zi cu ce e în producție.</p>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5 sm:text-right">
          <p>
            Versiune <span className="font-mono">{version.label}</span>
            {version.commitSha ? <span className="font-mono"> · build {version.commitSha}</span> : null}
          </p>
          <p>
            <Link href="/admin/ghid/rapoarte/" className="inline-flex items-center gap-1 text-primary-700 hover:underline">
              <MessageSquareWarning className="h-3.5 w-3.5" />
              Rapoarte din Ghid{openReports > 0 ? ` (${openReports} deschise)` : ''}
            </Link>
          </p>
        </div>
      </header>

      <Suspense fallback={null}>
        <GhidAsk audience="team" page="/admin/ghid" />
      </Suspense>

      <nav className="flex flex-wrap items-center gap-1 border-b" aria-label="Secțiuni">
        {TABS.map((t) => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm ${
                active ? 'border-slate-900 font-semibold text-slate-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.id === 'noutati' && <span className="text-xs font-normal text-neutral-400">{allEntries.length}</span>}
              {t.id === 'documentatie' && <span className="text-xs font-normal text-neutral-400">{totalDocs}</span>}
            </Link>
          );
        })}
      </nav>

      {tab === 'proceduri' && (
        <section className="space-y-6">
          {CATEGORIES.filter((c) => CURATED_GUIDES.some((g) => g.category === c.id)).map((c) => (
            <div key={c.id} className="space-y-2">
              <h2 className="text-sm font-semibold text-neutral-700">{c.label}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {CURATED_GUIDES.filter((g) => g.category === c.id).map((g) => (
                  <Link
                    key={g.slug}
                    href={`/admin/ghid/${g.slug}/`}
                    className="block rounded-lg border bg-white p-4 hover:border-slate-900 transition-colors"
                  >
                    <p className="text-sm font-semibold leading-tight">{g.title}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{g.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {latestThree.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-neutral-700 flex items-baseline gap-2">
                Ultimele noutăți
                <Link href={tabHref('noutati')} className="text-xs font-normal text-primary-700 hover:underline">
                  toate
                </Link>
              </h2>
              <ul className="rounded-lg border bg-white divide-y">
                {latestThree.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                    <span className="w-16 shrink-0 text-xs text-neutral-500 pt-0.5">{formatRoDate(e.date)}</span>
                    <span className="min-w-0 flex-1">
                      {e.detailFile ? (
                        <Link href={`/admin/ghid/changelog/${e.detailFile.replace(/\.md$/, '')}/`} className="hover:underline">
                          {e.detailTitle ?? stripTitle(e.summaryMd)}
                        </Link>
                      ) : (
                        stripTitle(e.summaryMd)
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {otherDocs.length > 0 && (
            <details className="rounded-lg border bg-white px-4 py-3">
              <summary className="cursor-pointer select-none text-sm font-semibold text-neutral-700">
                Alte documente de admin ({otherDocs.length})
              </summary>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2 text-sm">
                {otherDocs.map((d) => (
                  <li key={d.slug} className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                    <Link href={`/admin/ghid/${d.slug}/`} className="text-primary-700 hover:underline">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {tab === 'noutati' && (
        <section className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={tabHref('noutati')}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeCat ? 'bg-white text-neutral-700 hover:bg-neutral-100' : 'bg-slate-900 text-white border-slate-900'
              }`}
            >
              Toate · {allEntries.length}
            </Link>
            {[...CATEGORIES.map((c) => c.id), 'altele' as CategoryId]
              .filter((id) => (catCounts.get(id) ?? 0) > 0)
              .map((id) => (
                <Link
                  key={id}
                  href={tabHref('noutati', id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    activeCat === id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {CATEGORY_LABEL[id]} · {catCounts.get(id)}
                </Link>
              ))}
          </div>

          {Array.from(byDate.entries()).map(([date, list]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 sticky top-0 bg-gray-50 py-1">{formatRoDate(date)}</h3>
              {list.map((e, i) => {
                const kind = KIND_LABEL[e.kind];
                const href = e.detailFile ? `/admin/ghid/changelog/${e.detailFile.replace(/\.md$/, '')}/` : null;
                return (
                  <article key={`${date}-${i}`} className="rounded-lg border bg-white p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={`shrink-0 ${kind.className}`}>
                        {kind.label}
                      </Badge>
                      <Link href={tabHref('noutati', e.category)} className="text-[11px] text-neutral-500 hover:underline self-center">
                        {CATEGORY_LABEL[e.category]}
                      </Link>
                      {href && (
                        <Link href={href} className="ml-auto text-xs text-primary-700 hover:underline shrink-0">
                          Detalii
                        </Link>
                      )}
                    </div>
                    {e.teamMd ? (
                      <>
                        <div
                          className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(e.teamMd, `changelog/${e.detailFile}`) }}
                        />
                        <details className="text-xs text-neutral-600">
                          <summary className="cursor-pointer select-none">Rezumat tehnic</summary>
                          <div
                            className="prose prose-xs max-w-none mt-2 break-words"
                            dangerouslySetInnerHTML={{ __html: renderInline(e.summaryMd, 'changelog/README.md') }}
                          />
                        </details>
                      </>
                    ) : (
                      <div
                        className="prose prose-sm max-w-none break-words prose-p:my-1"
                        dangerouslySetInnerHTML={{ __html: renderInline(e.summaryMd, 'changelog/README.md') }}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {activeCat
              ? `${entries.length} livrări în categoria „${CATEGORY_LABEL[activeCat]}”.`
              : `Ultimele ${Math.min(RECENT_LIMIT, allEntries.length)} din ${allEntries.length} livrări. Alege o categorie ca să vezi tot istoricul ei.`}{' '}
            <Link href="/admin/ghid/changelog/" className="underline">
              Vezi tot jurnalul
            </Link>
            .
          </p>
        </section>
      )}

      {tab === 'documentatie' && (
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Toate folderele din documentația proiectului, inclusiv specificațiile tehnice. Pentru procedurile echipei folosește tabul „Proceduri”.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((f) => (
              <li key={f.name}>
                <Link href={`/admin/ghid/${f.slug}/`} className="flex items-center justify-between gap-2 rounded-lg border bg-white px-4 py-3 text-sm hover:border-slate-900">
                  <span className="inline-flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-neutral-400" />
                    {f.label}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">{f.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Titlul din rândul de changelog: textul bold de la început, fără markdown. */
function stripTitle(summaryMd: string): string {
  const m = summaryMd.match(/\*\*(.+?)\*\*/);
  const t = m ? m[1] : summaryMd;
  return t.replace(/`/g, '').replace(/\s+/g, ' ').trim().slice(0, 140);
}

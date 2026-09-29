'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { AlertTriangle, ArrowRight, FileText, ImagePlus, Loader2, MessageSquareWarning, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  REPORT_SHOT_MAX,
  REPORT_SHOT_MAX_BYTES,
  REPORT_SHOT_TYPES,
  REPORT_SITE_LABEL,
  REPORT_SITES,
  type ReportSite,
} from '@/lib/knowledge/report-meta';

type Audience = 'team' | 'collaborator';

interface Shot {
  id: string;
  name: string;
  preview: string;
  key?: string;
  mimeType: string;
  size: number;
  error?: string;
}

interface SearchHit {
  slug: string;
  title: string;
  relPath: string;
  snippetHtml: string;
}
interface Source {
  slug: string;
  title: string;
  href: string;
}
interface Exchange {
  question: string;
  text: string;
  html?: string;
  sources?: Source[];
  documented?: boolean;
  done: boolean;
  error?: string;
}

const FOLDER: Record<string, string> = {
  admin: 'Proceduri',
  changelog: 'Noutăți',
  'registru-central': 'Registru Barou',
  technical: 'Tehnic',
  seo: 'SEO',
};

/**
 * O singură casetă pentru tot: cât timp scrii, apar paginile din ghid care
 * se potrivesc (căutare lexicală, instant); Enter trimite întrebarea la
 * chatbot, iar răspunsul se scrie pe măsură ce vine, cu sursele la final.
 * Același component în admin (`team`) și în portalul topografului
 * (`collaborator`); diferă rutele și unde duc linkurile.
 */
export function GhidAsk({ audience, page }: { audience: Audience; page: string }) {
  const params = useSearchParams();
  const as = params.get('as');
  const qs = as ? `?as=${encodeURIComponent(as)}` : '';
  const apiBase = audience === 'collaborator' ? '/api/collaborator/knowledge' : '/api/admin/knowledge';
  const guideBase = audience === 'collaborator' ? '/colaborator/ghid' : '/admin/ghid';

  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [allDocs, setAllDocs] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{ open: boolean; kind: 'problema' | 'sugestie'; question?: string; answer?: string }>({ open: false, kind: 'problema' });
  const [reportMsg, setReportMsg] = useState('');
  const [reportOrder, setReportOrder] = useState('');
  const [reportSites, setReportSites] = useState<ReportSite[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);
  const shotInputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Căutare instant, cu întârziere mică ca să nu lovim serverul la fiecare literă.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const query = q.trim();
    if (query.length < 2) {
      setHits(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        const scope = allDocs && audience === 'team' ? '&scope=all' : '';
        const sep = qs ? '&' : '?';
        const res = await fetch(`${apiBase}/search${qs}${sep}q=${encodeURIComponent(query)}${scope}`);
        const json = await res.json();
        setHits(json.success ? (json.data.results as SearchHit[]).slice(0, 8) : []);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, allDocs, apiBase, audience, qs]);

  async function ask() {
    const question = q.trim();
    if (question.length < 3 || busy) return;
    setQ('');
    setHits(null);
    const history = exchanges
      .filter((e) => e.done && !e.error)
      .flatMap((e) => [
        { role: 'user' as const, content: e.question },
        { role: 'assistant' as const, content: e.text },
      ])
      .slice(-6);
    setExchanges((prev) => [...prev, { question, text: '', done: false }]);
    setBusy(true);
    const patch = (fn: (e: Exchange) => Exchange) =>
      setExchanges((prev) => prev.map((e, i) => (i === prev.length - 1 ? fn(e) : e)));
    try {
      const res = await fetch(`${apiBase}/chat${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        patch((e) => ({ ...e, done: true, error: json.error || 'Chatbotul nu a răspuns.' }));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const ev = JSON.parse(line) as
            | { t: 'delta'; text: string }
            | { t: 'done'; result: { answerMd: string; answerHtml: string; sources: Source[]; documented: boolean } }
            | { t: 'error'; message: string };
          if (ev.t === 'delta') patch((e) => ({ ...e, text: e.text + ev.text }));
          else if (ev.t === 'done')
            patch((e) => ({ ...e, text: ev.result.answerMd, html: ev.result.answerHtml, sources: ev.result.sources, documented: ev.result.documented, done: true }));
          else patch((e) => ({ ...e, done: true, error: ev.message }));
        }
      }
      patch((e) => (e.done ? e : { ...e, done: true }));
    } catch {
      patch((e) => ({ ...e, done: true, error: 'Nu am putut trimite întrebarea. Verifică internetul și încearcă din nou.' }));
    } finally {
      setBusy(false);
    }
  }

  function openReport(kind: 'problema' | 'sugestie', ctx?: { question: string; answer: string }) {
    setReport({ open: true, kind, question: ctx?.question, answer: ctx?.answer });
    setReportMsg(ctx ? `Răspunsul la „${ctx.question}” nu m-a ajutat: ` : '');
  }

  function resetReport() {
    setReport({ open: false, kind: 'problema' });
    setReportMsg('');
    setReportOrder('');
    setReportSites([]);
    shots.forEach((s) => URL.revokeObjectURL(s.preview));
    setShots([]);
  }

  function toggleSite(site: ReportSite) {
    setReportSites((cur) => (cur.includes(site) ? cur.filter((s) => s !== site) : [...cur, site]));
  }

  /** Urcă o captură direct în S3 (URL semnat), ca raportul să poarte doar cheia. */
  async function addShots(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;
    const room = REPORT_SHOT_MAX - shots.length;
    if (room <= 0) {
      toast.error(`Cel mult ${REPORT_SHOT_MAX} poze la un raport.`);
      return;
    }
    for (const file of images.slice(0, room)) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const shot: Shot = { id, name: file.name || 'captura.png', preview: URL.createObjectURL(file), mimeType: file.type, size: file.size };
      if (!REPORT_SHOT_TYPES.includes(file.type)) shot.error = 'Doar PNG, JPG sau WEBP';
      else if (file.size === 0) shot.error = 'Fișier gol';
      else if (file.size > REPORT_SHOT_MAX_BYTES) shot.error = 'Peste 8 MB';
      setShots((cur) => [...cur, shot]);
      if (shot.error) continue;
      try {
        const res = await fetch(`${apiBase}/reports/upload${qs}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType: file.type, size: file.size, name: shot.name }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Poza nu s-a putut încărca.');
        const put = await fetch(json.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if (!put.ok) throw new Error('Poza nu s-a putut încărca.');
        setShots((cur) => cur.map((s) => (s.id === id ? { ...s, key: json.data.key } : s)));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Poza nu s-a putut încărca.';
        setShots((cur) => cur.map((s) => (s.id === id ? { ...s, error: msg } : s)));
      }
    }
  }

  function removeShot(id: string) {
    setShots((cur) => {
      const s = cur.find((x) => x.id === id);
      if (s) URL.revokeObjectURL(s.preview);
      return cur.filter((x) => x.id !== id);
    });
  }

  const shotsUploading = shots.some((s) => !s.key && !s.error);

  async function sendReport() {
    const message = reportMsg.trim();
    if (message.length < 5 || sending || shotsUploading) return;
    setSending(true);
    try {
      const res = await fetch(`${apiBase}/reports${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: report.kind,
          message,
          context: {
            page,
            question: report.question,
            answer: report.answer,
            orderNumber: reportOrder || undefined,
            sites: reportSites.length ? reportSites : undefined,
            attachments: shots
              .filter((s) => s.key)
              .map((s) => ({ key: s.key, name: s.name, mimeType: s.mimeType, size: s.size })),
          },
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Raportul nu s-a putut trimite.');
        return;
      }
      toast.success('Trimis. Raul îl vede în Rapoarte din Ghid.');
      resetReport();
    } catch {
      toast.error('Raportul nu s-a putut trimite.');
    } finally {
      setSending(false);
    }
  }

  const showHits = hits !== null && q.trim().length >= 2;

  return (
    <section className="space-y-3">
      <div className="rounded-xl border-2 border-slate-900 bg-white shadow-sm">
        <form
          className="flex items-center gap-2 px-3"
          onSubmit={(e) => {
            e.preventDefault();
            void ask();
          }}
        >
          <Search className="h-5 w-5 shrink-0 text-neutral-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setQ('');
                setHits(null);
              }
            }}
            placeholder={
              audience === 'collaborator'
                ? 'Caută în ghid sau întreabă: „ce apăs când nu găsesc imobilul?”'
                : 'Caută în ghid sau întreabă: „ce fac cu o comandă în așteptare plată?”'
            }
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
            autoComplete="off"
            aria-label="Caută în ghid sau întreabă"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setHits(null);
                inputRef.current?.focus();
              }}
              className="rounded p-1 text-neutral-400 hover:text-neutral-700"
              aria-label="Șterge"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button type="submit" size="sm" disabled={busy || q.trim().length < 3} className="h-9 shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Întreabă'}
          </Button>
        </form>

        {showHits && (
          <div className="border-t">
            <div className="flex items-center justify-between px-4 py-1.5 text-[11px] text-neutral-500">
              <span>{searching ? 'caut…' : hits.length ? `Pagini din ghid care se potrivesc (Enter = întreabă chatbotul)` : 'Nicio pagină cu cuvintele astea. Enter = întreabă chatbotul.'}</span>
              {audience === 'team' && (
                <label className="flex items-center gap-1 select-none">
                  <input type="checkbox" checked={allDocs} onChange={(e) => setAllDocs(e.target.checked)} className="h-3 w-3 accent-slate-900" />
                  și documentația tehnică
                </label>
              )}
            </div>
            {hits.length > 0 && (
              <ul className="divide-y border-t">
                {hits.map((h) => (
                  <li key={h.relPath}>
                    <Link href={`${guideBase}/${h.slug}/`} className="flex items-start gap-3 px-4 py-2.5 hover:bg-primary-50/40">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-tight">
                          {h.title}
                          <span className="ml-2 text-[11px] font-normal text-neutral-500">{FOLDER[h.relPath.split('/')[0]] ?? h.relPath.split('/')[0]}</span>
                        </span>
                        <span
                          className="block truncate text-xs text-neutral-600 [&_mark]:bg-yellow-200 [&_mark]:rounded-sm [&_mark]:px-0.5"
                          dangerouslySetInnerHTML={{ __html: h.snippetHtml }}
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-neutral-500">
        <span>Răspunsurile vin din procedurile scrise, cu link la pagina sursă. Ce nu e documentat ajunge automat la Raul.</span>
        <button type="button" onClick={() => openReport('problema')} className="inline-flex items-center gap-1 text-neutral-700 underline hover:text-neutral-900">
          <MessageSquareWarning className="h-3.5 w-3.5" />
          Raportează o problemă
        </button>
      </div>

      {exchanges.length > 0 && (
        <div className="space-y-3">
          {exchanges.map((e, i) => (
            <div key={i} className="rounded-xl border bg-white">
              <p className="border-b px-4 py-2 text-sm font-medium text-neutral-800">{e.question}</p>
              <div className="px-4 py-3">
                {e.error ? (
                  <p className="text-sm text-red-700">{e.error}</p>
                ) : (
                  <div
                    className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-a:text-primary-700"
                    dangerouslySetInnerHTML={{ __html: e.html ?? (marked.parse(e.text || (e.done ? '' : '…'), { async: false }) as string) }}
                  />
                )}
                {!e.done && !e.error && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> se scrie…
                  </p>
                )}
                {e.done && !e.error && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2 text-xs text-neutral-600">
                    {e.documented === false && (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Nu e documentat: întrebarea a ajuns la Raul.
                      </span>
                    )}
                    {e.sources && e.sources.length > 0 && (
                      <span className="inline-flex flex-wrap items-center gap-2">
                        {e.sources.map((s) => (
                          <Link key={s.slug} href={s.href} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 hover:bg-neutral-50">
                            <FileText className="h-3 w-3" />
                            {s.title}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ))}
                      </span>
                    )}
                    <button type="button" className="ml-auto underline hover:text-neutral-900" onClick={() => openReport('problema', { question: e.question, answer: e.text })}>
                      Nu m-a ajutat
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {report.open && (
        <div
          className={`rounded-xl border px-4 py-3 space-y-2 ${dragOver ? 'border-amber-500 bg-amber-100/70' : 'border-amber-300 bg-amber-50/60'}`}
          onDragOver={(e) => {
            if (!e.dataTransfer.types.includes('Files')) return;
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            if (!e.dataTransfer.files.length) return;
            e.preventDefault();
            setDragOver(false);
            void addShots(Array.from(e.dataTransfer.files));
          }}
        >
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-amber-700" />
            <p className="text-sm font-semibold">Raportează</p>
            <select
              value={report.kind}
              onChange={(e) => setReport((r) => ({ ...r, kind: e.target.value as 'problema' | 'sugestie' }))}
              className="h-7 rounded border bg-white px-2 text-xs"
            >
              <option value="problema">o problemă</option>
              <option value="sugestie">o sugestie</option>
            </select>
            <button type="button" className="ml-auto text-neutral-500 hover:text-neutral-900" onClick={resetReport} aria-label="Închide">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Textarea
            value={reportMsg}
            onChange={(e) => setReportMsg(e.target.value)}
            onPaste={(e) => {
              const files = Array.from(e.clipboardData.files);
              if (files.some((f) => f.type.startsWith('image/'))) {
                e.preventDefault();
                void addShots(files);
              }
            }}
            placeholder="Ce nu merge sau ce lipsește? Ce ai apăsat, ce te așteptai, ce s-a întâmplat… Poți lipi aici o captură de ecran (Ctrl+V / Cmd+V)."
            rows={3}
            className="bg-white"
            autoFocus
          />
          {/* Topograful lucrează doar pe eghiseul.ro, deci alegerea site-ului e doar pentru echipă. */}
          {audience === 'team' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-neutral-600">Pe ce site?</span>
            {REPORT_SITES.map((site) => {
              const on = reportSites.includes(site);
              return (
                <button
                  key={site}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSite(site)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${on ? 'border-amber-600 bg-amber-600 text-white' : 'border-neutral-300 bg-white text-neutral-700 hover:border-amber-500'}`}
                >
                  {REPORT_SITE_LABEL[site]}
                </button>
              );
            })}
          </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {shots.map((s) => (
              <div key={s.id} className="relative h-16 w-16 overflow-hidden rounded border bg-white" title={s.error || s.name}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={s.preview} alt={s.name} className={`h-full w-full object-cover ${s.error ? 'opacity-40' : ''}`} />
                {!s.key && !s.error && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </span>
                )}
                {s.error && (
                  <span className="absolute inset-x-0 bottom-0 bg-red-600 px-0.5 text-center text-[9px] leading-tight text-white">{s.error}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeShot(s.id)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-neutral-700 hover:text-neutral-900"
                  aria-label="Scoate poza"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {shots.length < REPORT_SHOT_MAX && (
              <button
                type="button"
                onClick={() => shotInputRef.current?.click()}
                className="inline-flex h-8 items-center gap-1 rounded border border-dashed border-neutral-400 bg-white px-2 text-xs text-neutral-700 hover:border-amber-500"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Adaugă poză
              </button>
            )}
            <span className="text-[11px] text-neutral-500">sau lipește (Ctrl+V) / trage poza aici</span>
            <input
              ref={shotInputRef}
              type="file"
              accept={REPORT_SHOT_TYPES.join(',')}
              multiple
              className="hidden"
              onChange={(e) => {
                void addShots(Array.from(e.target.files ?? []));
                e.target.value = '';
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={reportOrder}
              onChange={(e) => setReportOrder(e.target.value)}
              placeholder="Nr. comandă (opțional), ex. E-260921-ABCDE"
              className="h-8 w-72 rounded border bg-white px-2 text-xs"
            />
            <Button size="sm" className="ml-auto h-8 text-xs" onClick={() => void sendReport()} disabled={sending || shotsUploading || reportMsg.trim().length < 5}>
              {sending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              Trimite lui Raul
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

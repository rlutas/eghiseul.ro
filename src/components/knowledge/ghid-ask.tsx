'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { AlertTriangle, ArrowRight, FileText, Loader2, MessageSquareWarning, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Audience = 'team' | 'collaborator';

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
  const [sending, setSending] = useState(false);
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

  async function sendReport() {
    const message = reportMsg.trim();
    if (message.length < 5 || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${apiBase}/reports${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: report.kind, message, context: { page, question: report.question, answer: report.answer, orderNumber: reportOrder || undefined } }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Raportul nu s-a putut trimite.');
        return;
      }
      toast.success('Trimis. Raul îl vede în Rapoarte din Ghid.');
      setReport({ open: false, kind: 'problema' });
      setReportMsg('');
      setReportOrder('');
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
        <div className="rounded-xl border border-amber-300 bg-amber-50/60 px-4 py-3 space-y-2">
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
            <button type="button" className="ml-auto text-neutral-500 hover:text-neutral-900" onClick={() => setReport({ open: false, kind: 'problema' })} aria-label="Închide">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Textarea
            value={reportMsg}
            onChange={(e) => setReportMsg(e.target.value)}
            placeholder="Ce nu merge sau ce lipsește? Ce ai apăsat, ce te așteptai, ce s-a întâmplat…"
            rows={3}
            className="bg-white"
            autoFocus
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={reportOrder}
              onChange={(e) => setReportOrder(e.target.value)}
              placeholder="Nr. comandă (opțional), ex. E-260921-ABCDE"
              className="h-8 w-72 rounded border bg-white px-2 text-xs"
            />
            <Button size="sm" className="ml-auto h-8 text-xs" onClick={() => void sendReport()} disabled={sending || reportMsg.trim().length < 5}>
              {sending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              Trimite lui Raul
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Bot, Loader2, MessageSquareWarning, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Audience = 'team' | 'collaborator';

interface Source {
  slug: string;
  title: string;
  href: string;
}
interface Turn {
  role: 'user' | 'assistant';
  content: string;
  html?: string;
  sources?: Source[];
  documented?: boolean;
  error?: boolean;
}

/**
 * Chatbotul din Ghid + raportarea de probleme. Același component în admin și
 * în portalul colaboratorului; diferă doar `audience` (ce corpus citește
 * chatbotul, unde duc linkurile) și rutele API.
 */
export function GhidChat({ audience, page }: { audience: Audience; page: string }) {
  const params = useSearchParams();
  const as = params.get('as');
  const apiBase = audience === 'collaborator' ? '/api/collaborator/knowledge' : '/api/admin/knowledge';
  const qs = as ? `?as=${encodeURIComponent(as)}` : '';

  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{ open: boolean; question?: string; answer?: string; kind: 'problema' | 'sugestie' }>({
    open: false,
    kind: 'problema',
  });
  const [reportMsg, setReportMsg] = useState('');
  const [reportOrder, setReportOrder] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function ask() {
    const question = q.trim();
    if (question.length < 3 || busy) return;
    setQ('');
    const history = turns.filter((t) => !t.error).map((t) => ({ role: t.role, content: t.content }));
    setTurns((prev) => [...prev, { role: 'user', content: question }]);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/chat${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: history.slice(-6) }),
      });
      const json = await res.json();
      if (!json.success) {
        setTurns((prev) => [...prev, { role: 'assistant', content: json.error || 'Eroare.', error: true }]);
        return;
      }
      const d = json.data as { answerMd: string; answerHtml: string; sources: Source[]; documented: boolean };
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: d.answerMd, html: d.answerHtml, sources: d.sources, documented: d.documented },
      ]);
    } catch {
      setTurns((prev) => [...prev, { role: 'assistant', content: 'Nu am putut trimite întrebarea. Verifică internetul și încearcă din nou.', error: true }]);
    } finally {
      setBusy(false);
    }
  }

  async function sendReport() {
    const message = reportMsg.trim();
    if (message.length < 5 || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${apiBase}/reports${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: report.kind,
          message,
          context: { page, question: report.question, answer: report.answer, orderNumber: reportOrder || undefined },
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Raportul nu s-a putut trimite.');
        return;
      }
      toast.success('Mulțumim, raportul a ajuns la Raul.');
      setReport({ open: false, kind: 'problema' });
      setReportMsg('');
      setReportOrder('');
    } catch {
      toast.error('Raportul nu s-a putut trimite.');
    } finally {
      setSending(false);
    }
  }

  function openReport(kind: 'problema' | 'sugestie', ctx?: { question: string; answer: string }) {
    setReport({ open: true, kind, question: ctx?.question, answer: ctx?.answer });
    setReportMsg(ctx ? `Răspunsul la „${ctx.question}” nu m-a ajutat: ` : '');
  }

  return (
    <section className="rounded-lg border bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <Bot className="h-5 w-5 text-primary-700" />
        <h2 className="text-base font-semibold">Întreabă ghidul</h2>
        <p className="text-xs text-muted-foreground">
          Răspunde din procedurile scrise, cu link la pagina sursă. Ce nu e documentat ajunge automat la Raul.
        </p>
        <Button size="sm" variant="outline" className="ml-auto h-8 text-xs" onClick={() => openReport('problema')}>
          <MessageSquareWarning className="mr-1 h-3.5 w-3.5" />
          Raportează o problemă
        </Button>
      </div>

      <div className="max-h-[28rem] overflow-y-auto px-4 py-3 space-y-3">
        {turns.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Exemple: „ce fac cu o comandă în Așteptare plată?”, „cât durează certificatul de naștere la București?”,
            „clientul are permis din străinătate, ce preț?”.
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                t.role === 'user'
                  ? 'max-w-[85%] rounded-lg bg-slate-900 px-3 py-2 text-sm text-white whitespace-pre-wrap'
                  : `max-w-[95%] rounded-lg border px-3 py-2 text-sm ${t.error ? 'border-red-300 bg-red-50' : 'bg-neutral-50'}`
              }
            >
              {t.role === 'assistant' && t.html ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0" dangerouslySetInnerHTML={{ __html: t.html }} />
              ) : (
                t.content
              )}
              {t.role === 'assistant' && !t.error && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                  {t.documented === false && (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Nu e documentat: întrebarea a ajuns la Raul.
                    </span>
                  )}
                  {t.sources && t.sources.length > 0 && (
                    <span>
                      Surse:{' '}
                      {t.sources.map((s, j) => (
                        <a key={s.slug} href={s.href} className="text-primary-700 underline">
                          {s.title}
                          {j < t.sources!.length - 1 ? ', ' : ''}
                        </a>
                      ))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="underline hover:text-neutral-900"
                    onClick={() => openReport('problema', { question: turns[i - 1]?.content ?? '', answer: t.content })}
                  >
                    Nu m-a ajutat
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> caut în ghiduri…
          </div>
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <Textarea
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void ask();
            }
          }}
          placeholder="Scrie întrebarea…"
          rows={2}
          className="min-h-[2.5rem] resize-none bg-white"
        />
        <Button type="submit" size="sm" disabled={busy || q.trim().length < 3} className="h-10">
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {report.open && (
        <div className="border-t bg-amber-50/60 px-4 py-3 space-y-2">
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
            placeholder="Ce nu merge sau ce lipsește? Cu cât mai concret (ce ai apăsat, ce te așteptai, ce s-a întâmplat)…"
            rows={3}
            className="bg-white"
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

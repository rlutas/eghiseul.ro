'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Result {
  slug: string;
  title: string;
  relPath: string;
  snippetHtml: string;
}

/**
 * Căutare în toată documentația. Interogarea stă în `?q=` ca linkul să se
 * poată trimite unui coleg; rezultatele vin de la /api/admin/knowledge/search
 * cu fragment și termenii marcați.
 */
export function GhidSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('q') ?? '';
  const [q, setQ] = useState(initial);
  // Implicit căutăm în ghidurile echipei (admin/, changelog/, registru);
  // bifa extinde la toată documentația, inclusiv specificațiile tehnice.
  const [allDocs, setAllDocs] = useState(params.get('scope') === 'all');
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const query = q.trim();
    if (query.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/knowledge/search?q=${encodeURIComponent(query)}${allDocs ? '&scope=all' : ''}`
        );
        const json = await res.json();
        setResults(json.success ? (json.data.results as Result[]) : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, allDocs]);

  // `?q=` (+ `scope=all`) în URL, fără reîncărcare — link partajabil.
  useEffect(() => {
    const query = q.trim();
    const current = params.get('q') ?? '';
    const currentAll = params.get('scope') === 'all';
    if (query === current && allDocs === currentAll) return;
    const qs = new URLSearchParams();
    if (query) qs.set('q', query);
    if (allDocs) qs.set('scope', 'all');
    const url = qs.size ? `/admin/ghid/?${qs.toString()}` : '/admin/ghid/';
    router.replace(url, { scroll: false });
  }, [q, allDocs, params, router]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Caută în ghidurile echipei: „transfer bancar”, „AWB”, „storno”, „cazier auto”…"
          className="pl-9 pr-9 h-11 text-base bg-white"
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-700"
            aria-label="Șterge căutarea"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
        )}
      </div>

      <label className="flex items-center gap-2 text-xs text-neutral-600 select-none">
        <input
          type="checkbox"
          checked={allDocs}
          onChange={(e) => setAllDocs(e.target.checked)}
          className="h-3.5 w-3.5 accent-slate-900"
        />
        Caută și în documentația tehnică (specificații, arhivă, SEO)
      </label>

      {results !== null && (
        <div className="rounded-lg border bg-white divide-y">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Nimic pentru „{q.trim()}”. Încearcă alt cuvânt sau mai puține cuvinte.
            </p>
          ) : (
            <>
              <p className="px-4 py-2 text-xs text-muted-foreground">
                {results.length} {results.length === 1 ? 'rezultat' : 'rezultate'}
                {results.length >= 30 ? ' (primele 30)' : ''}
              </p>
              {results.map((r) => (
                <Link
                  key={r.relPath}
                  href={`/admin/ghid/${r.slug}/`}
                  className="block px-4 py-3 hover:bg-primary-50/40"
                >
                  <p className="text-sm font-semibold leading-tight">{r.title}</p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">docs/{r.relPath}</p>
                  <p
                    className="text-xs text-neutral-700 mt-1 leading-snug [&_mark]:bg-yellow-200 [&_mark]:rounded-sm [&_mark]:px-0.5"
                    dangerouslySetInnerHTML={{ __html: r.snippetHtml }}
                  />
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

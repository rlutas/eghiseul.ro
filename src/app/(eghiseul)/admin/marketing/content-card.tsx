'use client';

/**
 * Card „Ce pagini aduc comenzi" din /admin/marketing — articole, calculatoare
 * și unelte, cu comenzile începute și plătite care au pornit de pe ele.
 * Sursa: GET /api/admin/marketing/content.
 */

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, RefreshCw } from 'lucide-react';
import { PLACEMENT_LABEL, type ContentKind } from '@/lib/analytics/content-attribution';

interface Row {
  page: string;
  kind: ContentKind;
  started: number;
  paid: number;
  revenueRon: number;
  clickStarted: number;
  clickPaid: number;
  placements: Record<string, number>;
  services: Record<string, number>;
}
interface ContentData {
  days: number;
  ordersWithAttribution: number;
  started: number;
  paid: number;
  rows: Row[];
}

const ron = (n: number) => `${n.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`;
const top = (m: Record<string, number>, labels?: Record<string, string>) =>
  Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${labels?.[k] ?? k} ${v}`)
    .join(' · ');

export function ContentAttributionCard() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/marketing/content?days=${days}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error ?? 'Nu am putut încărca datele.');
    } catch {
      setError('Nu am putut încărca datele.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Ce pagini aduc comenzi (blog, calculatoare)</h2>
          </div>
          <div className="flex items-center gap-1">
            {([7, 30, 90] as const).map((d) => (
              <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)}>
                {d} zile
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={load} disabled={loading} aria-label="Reîncarcă">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Comenzile începute în interval, după pagina de conținut de pe care au pornit. <strong>Click</strong> = omul a
          apăsat pe un card de serviciu din pagină (măsurat din 14.10.2026). <strong>Aterizare</strong> = vizita a
          început pe pagină, dar n-a apăsat pe card (a ajuns la comandă pe alt drum). Comenzile fără legătură cu
          blogul sau calculatoarele nu apar aici; le vezi în tabelul pe canale de mai sus.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {data && (
          <p className="text-sm text-slate-700">
            Din conținut: <strong>{data.started}</strong> comenzi începute, <strong>{data.paid}</strong> plătite, în
            ultimele {data.days} zile.
          </p>
        )}

        {data && data.rows.length === 0 && !loading && (
          <p className="text-sm text-slate-500">Nicio comandă pornită de pe blog sau calculatoare în acest interval.</p>
        )}

        {data && data.rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-3 py-2">Pagină</th>
                  <th className="px-3 py-2">Tip</th>
                  <th className="px-3 py-2 text-right">Începute</th>
                  <th className="px-3 py-2 text-right">Plătite</th>
                  <th className="px-3 py-2 text-right">Venit</th>
                  <th className="px-3 py-2 text-right">Din click pe card</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <Fragment key={r.page}>
                    <tr className="border-b last:border-0 align-top">
                      <td className="px-3 py-2">
                        <a
                          href={r.page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-slate-900 underline-offset-2 hover:underline"
                        >
                          {r.page}
                        </a>
                        {r.clickStarted > 0 && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            {top(r.placements, PLACEMENT_LABEL)}
                            {Object.keys(r.services).length > 0 && <> · servicii: {top(r.services)}</>}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{r.kind}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{r.started}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">{r.paid}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{ron(r.revenueRon)}</td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {r.clickStarted} începute / {r.clickPaid} plătite
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

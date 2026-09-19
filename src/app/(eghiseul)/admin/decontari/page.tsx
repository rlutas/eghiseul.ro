'use client';

/**
 * /admin/decontari — Stripe payout reconciliation (Decontări).
 *
 * Lists payouts from the SHARED Stripe account (eghiseul.ro + CJO) with
 * match status (câte tranzacții au factură Oblio). Sync button pulls the
 * last 30/90 days from Stripe. Month filter + monthly CSV export for
 * accounting. Detail per payout: /admin/decontari/[payoutId].
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Banknote, RefreshCw, Download, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Payout {
  id: string;
  amount_bani: number;
  currency: string;
  status: string;
  arrival_date: string | null;
  tx_count: number;
  matched_count: number;
  synced_at: string;
}

const ron = (bani: number) =>
  (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Plătit', cls: 'bg-green-100 text-green-800' },
  in_transit: { label: 'În tranzit', cls: 'bg-amber-100 text-amber-800' },
  pending: { label: 'În așteptare', cls: 'bg-neutral-100 text-neutral-700' },
  failed: { label: 'Eșuat', cls: 'bg-red-100 text-red-800' },
  canceled: { label: 'Anulat', cls: 'bg-neutral-200 text-neutral-600' },
};

export default function DecontariPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [month, setMonth] = useState(''); // YYYY-MM

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = month ? `?month=${month}` : '';
      const res = await fetch(`/api/admin/decontari${qs}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPayouts(json.data.payouts);
    } catch (err) {
      toast.error(`Eroare la încărcare: ${err instanceof Error ? err.message : err}`);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const sync = async (sinceDays: number) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/decontari/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sinceDays }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const { payoutsSynced, txSynced, errors } = json.data;
      toast.success(`Sincronizat: ${payoutsSynced} decontări, ${txSynced} tranzacții`);
      if (errors?.length) toast.warning(`${errors.length} avertismente — vezi consola`, { duration: 8000 });
      if (errors?.length) console.warn('[decontari] sync warnings:', errors);
      await load();
    } catch (err) {
      toast.error(`Sync eșuat: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary-600" /> Decontări Stripe
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Payout-uri din contul comun (eghiseul.ro + cazierjudiciaronline.com), cu facturile Oblio atașate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/decontari/banca">Extras bancă</Link>
          </Button>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 rounded-md border border-neutral-300 px-2 text-sm"
          />
          {month && (
            <Button asChild variant="outline" size="sm">
              <a href={`/api/admin/decontari/export?month=${month}`}>
                <Download className="h-4 w-4 mr-1" /> Export lună
              </a>
            </Button>
          )}
          <Button onClick={() => sync(30)} disabled={syncing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizez…' : 'Sincronizează'}
          </Button>
          <Button onClick={() => sync(90)} disabled={syncing} size="sm" variant="outline" title="Backfill 90 zile">
            90z
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-neutral-500">Se încarcă…</p>
          ) : payouts.length === 0 ? (
            <div className="p-10 text-center text-neutral-500">
              <p className="mb-3">Nicio decontare sincronizată încă.</p>
              <Button onClick={() => sync(90)} disabled={syncing}>
                <RefreshCw className="h-4 w-4 mr-2" /> Sincronizează ultimele 90 de zile
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left text-neutral-600">
                  <th className="px-4 py-3 font-medium">Data sosirii</th>
                  <th className="px-4 py-3 font-medium">Payout</th>
                  <th className="px-4 py-3 font-medium text-right">Sumă netă</th>
                  <th className="px-4 py-3 font-medium text-center">Tranzacții</th>
                  <th className="px-4 py-3 font-medium text-center">Facturate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const st = STATUS_LABEL[p.status] ?? { label: p.status, cls: 'bg-neutral-100 text-neutral-700' };
                  const fullyMatched = p.tx_count > 0 && p.matched_count >= p.tx_count;
                  return (
                    <tr key={p.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                      <td className="px-4 py-3 whitespace-nowrap">{p.arrival_date ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-500">{p.id.slice(0, 18)}…</td>
                      <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                        {ron(p.amount_bani)} RON
                      </td>
                      <td className="px-4 py-3 text-center">{p.tx_count}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={fullyMatched ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {!fullyMatched && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {p.matched_count}/{p.tx_count}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={st.cls}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/decontari/${p.id}`}
                          className="inline-flex items-center text-primary-700 hover:underline font-medium"
                        >
                          Detalii <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

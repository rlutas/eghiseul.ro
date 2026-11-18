'use client';

/**
 * Card „Conversii Google Ads de încărcat" din /admin/marketing — comenzile
 * plătite venite dintr-un clic pe reclamă, pe care eticheta Google nu le-a
 * raportat (clientul nu a acceptat cookie-urile de marketing).
 * Sursa: GET /api/admin/marketing/offline-conversions.
 */

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, Upload } from 'lucide-react';

const SITES = [
  { id: 'constatator', label: 'certificat-constatator-express.ro' },
  { id: 'cazierfiscal', label: 'cazierfiscal.com' },
  { id: 'eghiseul', label: 'eghiseul.ro' },
  { id: 'documentero', label: 'documentero.ro' },
];

interface Row {
  orderNumber: string;
  clickParam: string;
  conversionTime: string;
  value: string;
  tagAlreadySent: boolean;
}
interface Data {
  paidOrders: number;
  fromGoogleAds: number;
  notYetAtGoogle: number;
  rows: Row[];
}

export function OfflineConversionsCard() {
  const [platform, setPlatform] = useState('constatator');
  const [name, setName] = useState('Purchase offline');
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/marketing/offline-conversions?platform=${platform}&days=30`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Eroare');
      setData(json.data as Data);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Nu am putut încărca datele');
    } finally {
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => {
    load();
  }, [load]);

  const download = () => {
    const p = new URLSearchParams({ platform, days: '30', format: 'csv', name });
    window.location.href = `/api/admin/marketing/offline-conversions?${p}`;
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Upload className="h-5 w-5" />
            Conversii Google Ads de încărcat (30 de zile)
          </h2>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reîncarcă
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Comenzi plătite venite dintr-un clic pe reclamă. Cele marcate „neraportată” nu au ajuns la Google,
          pentru că clientul nu a acceptat cookie-urile de marketing. Folosește tabelul ca să vezi câte
          vânzări a adus de fapt reclama. Fișierul le trece pe cele neraportate cu acordul „Denied”: Google
          cere, la conectarea datelor offline, confirmarea că datele respectă politica de consimțământ din
          UE, deci încărcarea lor rămâne decizia lui Raul.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Site</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="h-9 rounded-md border border-input bg-white px-2 text-sm"
            >
              {SITES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Numele acțiunii de conversie din Google Ads</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-56 rounded-md border border-input bg-white px-2 text-sm"
            />
          </label>
          <Button size="sm" onClick={download} disabled={!data || data.notYetAtGoogle === 0}>
            <Download className="mr-1 h-4 w-4" />
            Descarcă fișierul ({data?.notYetAtGoogle ?? 0})
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {data && (
          <>
            <p className="text-sm text-slate-700">
              {data.paidOrders} comenzi plătite · {data.fromGoogleAds} din reclamă Google ·{' '}
              <span className="font-semibold">{data.notYetAtGoogle} neraportate</span>
            </p>
            {data.rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-1.5 pr-3 font-medium">Comandă</th>
                      <th className="py-1.5 pr-3 font-medium">Plătită la</th>
                      <th className="py-1.5 pr-3 font-medium">Valoare</th>
                      <th className="py-1.5 pr-3 font-medium">Tip clic</th>
                      <th className="py-1.5 font-medium">La Google</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.orderNumber} className="border-b last:border-b-0">
                        <td className="py-1.5 pr-3 font-mono text-xs">{r.orderNumber}</td>
                        <td className="py-1.5 pr-3">{r.conversionTime}</td>
                        <td className="py-1.5 pr-3">{r.value} lei</td>
                        <td className="py-1.5 pr-3">{r.clickParam}</td>
                        <td className="py-1.5">
                          {r.tagAlreadySent ? 'raportată de etichetă' : <span className="font-semibold">neraportată</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

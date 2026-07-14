'use client';

/**
 * /admin/decontari/banca — extras de cont BT: upload CSV, categorii automate
 * (Stripe, traduceri, ONRC, furnizori externi, salarii, comisioane…),
 * match automat payout↔bancă, semnal „factură furnizor de listat" pentru
 * plățile externe (Vercel, Google — nu apar în SPV).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Landmark, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Entry {
  reference: string;
  tx_date: string;
  tx_type: string | null;
  description: string | null;
  debit_bani: number;
  credit_bani: number;
  category: string;
  counterparty: string | null;
  needs_invoice: boolean;
  matched_payout_id: string | null;
}

const ron = (bani: number) =>
  (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CATEGORY_LABEL: Record<string, { label: string; cls: string }> = {
  stripe_payout: { label: 'Decontare Stripe', cls: 'bg-blue-100 text-blue-800' },
  traduceri: { label: 'Traduceri', cls: 'bg-purple-100 text-purple-800' },
  taxe_onrc: { label: 'Taxe ONRC', cls: 'bg-amber-100 text-amber-800' },
  furnizor_extern: { label: 'Furnizor extern', cls: 'bg-red-100 text-red-800' },
  curierat: { label: 'Curierat', cls: 'bg-teal-100 text-teal-800' },
  salarii: { label: 'Salarii', cls: 'bg-green-100 text-green-800' },
  taxe_anaf: { label: 'ANAF/Trezorerie', cls: 'bg-orange-100 text-orange-800' },
  aport: { label: 'Aport propriu', cls: 'bg-neutral-200 text-neutral-700' },
  taxe_ancpi: { label: 'Taxe ANCPI', cls: 'bg-amber-100 text-amber-800' },
  combustibil: { label: 'Combustibil', cls: 'bg-neutral-100 text-neutral-600' },
  leasing_auto: { label: 'Leasing/asigurări auto', cls: 'bg-neutral-100 text-neutral-600' },
  telecom: { label: 'Telecom', cls: 'bg-neutral-100 text-neutral-600' },
  comisioane_banca: { label: 'Comisioane bancă', cls: 'bg-neutral-100 text-neutral-600' },
  altele: { label: 'Altele', cls: 'bg-neutral-100 text-neutral-600' },
};

export default function BancaPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [month, setMonth] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const qs = month ? `?month=${month}` : '';
    const res = await fetch(`/api/admin/decontari/banca${qs}`);
    const json = await res.json();
    if (json.success) setEntries(json.data.entries);
    else toast.error(json.error);
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/decontari/bank-import', { method: 'POST', body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const { imported, payoutsMatched, unmatchedStripeCredits } = json.data;
      toast.success(`Import: ${imported} mișcări · ${payoutsMatched} decontări confirmate în bancă`);
      if (unmatchedStripeCredits > 0) toast.warning(`${unmatchedStripeCredits} încasări Stripe fără payout pereche (probabil în afara ferestrei sincronizate)`);
      await load();
    } catch (err) {
      toast.error(`Import eșuat: ${err instanceof Error ? err.message : err}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const summary = new Map<string, { count: number; debit: number; credit: number }>();
  for (const e of entries) {
    const s = summary.get(e.category) ?? { count: 0, debit: 0, credit: 0 };
    s.count++; s.debit += e.debit_bani; s.credit += e.credit_bani;
    summary.set(e.category, s);
  }
  const needInvoice = entries.filter((e) => e.needs_invoice);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/decontari" className="inline-flex items-center text-sm text-neutral-600 hover:text-secondary-900 mb-1">
            <ArrowLeft className="h-4 w-4 mr-1" /> Decontări
          </Link>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary-600" /> Extras bancă (BT)
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 rounded-md border border-neutral-300 px-2 text-sm" />
          {/* hidden input + ref.click() — pattern macOS */}
          <input ref={fileRef} type="file" accept=".csv,.CSV,text/csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} size="sm">
            <Upload className="h-4 w-4 mr-1" /> {uploading ? 'Import…' : 'Importă extras CSV'}
          </Button>
        </div>
      </div>

      {/* Furnizori externi — facturi de listat pentru contabil */}
      {needInvoice.length > 0 && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <p className="font-semibold text-red-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Furnizori externi — facturi de descărcat/listat pentru contabil (nu apar în SPV)
            </p>
            <ul className="text-sm space-y-1">
              {needInvoice.map((e) => (
                <li key={e.reference} className="flex justify-between gap-3">
                  <span>{e.tx_date} · {e.counterparty ?? e.description?.slice(0, 60)}</span>
                  <span className="font-medium whitespace-nowrap">{ron(e.debit_bani)} RON</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sumar categorii */}
      {summary.size > 0 && (
        <Card>
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...summary.entries()].sort((a, b) => (b[1].debit + b[1].credit) - (a[1].debit + a[1].credit)).map(([cat, s]) => {
              const c = CATEGORY_LABEL[cat] ?? CATEGORY_LABEL.altele;
              return (
                <div key={cat} className="rounded-lg border border-neutral-200 p-3">
                  <Badge className={c.cls}>{c.label}</Badge>
                  <p className="text-xs text-neutral-500 mt-1.5">{s.count} mișcări</p>
                  {s.credit > 0 && <p className="text-sm font-semibold text-green-700">+{ron(s.credit)}</p>}
                  {s.debit > 0 && <p className="text-sm font-semibold text-red-700">−{ron(s.debit)}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <p className="p-10 text-center text-neutral-500">Niciun extras importat{month ? ' pentru luna selectată' : ''}. Exportă CSV-ul „Lista de tranzacții” din BT24 și importă-l aici.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left text-neutral-600">
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Categorie</th>
                  <th className="px-3 py-2 font-medium">Detalii</th>
                  <th className="px-3 py-2 font-medium text-right">Debit</th>
                  <th className="px-3 py-2 font-medium text-right">Credit</th>
                  <th className="px-3 py-2 font-medium text-center">Payout</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const c = CATEGORY_LABEL[e.category] ?? CATEGORY_LABEL.altele;
                  return (
                    <tr key={e.reference} className="border-b last:border-b-0 hover:bg-neutral-50">
                      <td className="px-3 py-2 whitespace-nowrap">{e.tx_date}</td>
                      <td className="px-3 py-2"><Badge className={c.cls}>{c.label}</Badge></td>
                      <td className="px-3 py-2 max-w-[380px] truncate" title={e.description ?? ''}>
                        {e.counterparty ?? e.description?.slice(0, 80) ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-red-700 whitespace-nowrap">{e.debit_bani ? ron(e.debit_bani) : ''}</td>
                      <td className="px-3 py-2 text-right text-green-700 whitespace-nowrap">{e.credit_bani ? ron(e.credit_bani) : ''}</td>
                      <td className="px-3 py-2 text-center">
                        {e.category === 'stripe_payout' ? (
                          e.matched_payout_id ? (
                            <Link href={`/admin/decontari/${e.matched_payout_id}`} title={e.matched_payout_id}>
                              <CheckCircle className="h-4 w-4 text-green-600 inline" />
                            </Link>
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500 inline" />
                          )
                        ) : null}
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

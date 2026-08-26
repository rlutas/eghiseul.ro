'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePreviewAs, withPreview } from '@/lib/collaborator/preview';
import Link from 'next/link';
import { Wallet, ClipboardList, Scale } from 'lucide-react';
import { findStatusLabel } from '@/lib/admin/status-options';

interface EarningOrder {
  id: string;
  friendlyOrderId: string;
  service: string;
  locality: string;
  status: string;
  paidAt: string | null;
  clientTotal: number;
  ocpiCost: number;
  isTest: boolean;
}

interface Breakdown {
  collectedWithVat: number;
  netOfVat: number;
  vat: number;
  ocpiCosts: number;
  grossProfit: number;
  profitTax: number;
  netProfit: number;
  dividendTax: number;
  distributable: number;
  sharePerSide: number;
}

interface EarningsData {
  month: string | null;
  orders: EarningOrder[];
  summary: { count: number; totalCollected: number };
  breakdown: Breakdown;
  lastSettlement: {
    settledOn: string;
    cutoffFriendlyOrderId: string;
    sharePerSideRon: number;
  } | null;
}

/** Last 12 months as YYYY-MM options, newest first. */
function monthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < 12; i++) {
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const value = `${y}-${String(m).padStart(2, '0')}`;
    const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('ro-RO', {
      month: 'long',
      year: 'numeric',
    });
    out.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    d.setUTCMonth(d.getUTCMonth() - 1);
  }
  return out;
}

const lei = (n: number) => `${n.toFixed(2)} RON`;

export default function CollaboratorDecontPage() {
  const previewAs = usePreviewAs();
  const months = useMemo(monthOptions, []);
  const [month, setMonth] = useState(months[0]!.value);
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !previewAs && window.location.search.includes('as=')) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(withPreview(`/api/collaborator/earnings?month=${month}`, previewAs));
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Eroare');
        setData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Eroare la încărcare');
      } finally {
        setLoading(false);
      }
    })();
  }, [month, previewAs]);

  const summary = data?.summary ?? { count: 0, totalCollected: 0 };
  const b = data?.breakdown ?? null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Decont</h1>
          <p className="text-sm text-slate-500">
            Împărțeala 50/50 pe profit: încasări minus TVA, minus taxele OCPI, minus impozitele
            firmei — jumătate ție, jumătate eGhiseul.
          </p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="all">Toată perioada (de la 07.07.2026)</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase text-slate-400">
            <ClipboardList className="h-4 w-4" /> Comenzi plătite
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '…' : summary.count}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase text-slate-400">
            <Wallet className="h-4 w-4" /> Încasat servicii (TVA incl.)
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? '…' : lei(summary.totalCollected)}
          </p>
        </div>
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase text-primary-700">
            <Scale className="h-4 w-4" /> Partea ta (50% din net)
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {loading || !b ? '…' : lei(b.sharePerSide)}
          </p>
        </div>
      </div>

      {/* Calculul complet — aceeași metodologie ca decontul oficial (26.08),
          transparentă pas cu pas, ca cifrele să nu poată diverge. */}
      {!loading && b && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Calculul împărțelii 50/50</h2>
          <dl className="divide-y divide-slate-100 text-sm">
            {([
              ['Încasat de la clienți (cu TVA)', b.collectedWithVat, ''],
              [`− TVA 21%`, -b.vat, ''],
              ['= Net fără TVA', b.netOfVat, 'font-medium'],
              ['− Taxe OCPI plătite', -b.ocpiCosts, ''],
              ['= Profit brut', b.grossProfit, 'font-medium'],
              ['− Impozit pe profit 16%', -b.profitTax, ''],
              ['− Impozit pe dividende 16%', -b.dividendTax, ''],
              ['= Net de distribuit', b.distributable, 'font-semibold'],
            ] as [string, number, string][]).map(([label, value, cls]) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <dt className={`text-slate-600 ${cls}`}>{label}</dt>
                <dd className={`tabular-nums text-slate-900 ${cls}`}>
                  {value < 0 ? `−${lei(Math.abs(value))}` : lei(value)}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between bg-primary-50 px-2 py-2">
              <dt className="font-bold text-secondary-900">Partea ta (50%)</dt>
              <dd className="tabular-nums font-bold text-secondary-900">{lei(b.sharePerSide)}</dd>
            </div>
          </dl>
          {data?.lastSettlement && (
            <p className="mt-3 text-xs text-slate-400">
              Ultimul decont închis: {data.lastSettlement.settledOn}, până la comanda{' '}
              {data.lastSettlement.cutoffFriendlyOrderId} inclusiv —{' '}
              {lei(data.lastSettlement.sharePerSideRon)} de fiecare parte.
            </p>
          )}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (data?.orders.length ?? 0) === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Nicio comandă plătită în perioada selectată.
        </div>
      )}

      {!loading && (data?.orders.length ?? 0) > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Comandă</th>
                <th className="px-4 py-3">Serviciu</th>
                <th className="px-4 py-3">Localitate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plătită la</th>
                <th className="px-4 py-3 text-right">Încasat client (TVA incl.)</th>
                <th className="px-4 py-3 text-right">Taxă OCPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data!.orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={withPreview(`/colaborator/orders/${o.id}`, previewAs)} className="font-medium text-primary-700 hover:underline">
                      {o.friendlyOrderId}
                    </Link>
                    {o.isTest && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] uppercase text-amber-700">test</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.service}</td>
                  <td className="px-4 py-3 text-slate-700">{o.locality}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {findStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {o.paidAt ? new Date(o.paidAt).toLocaleDateString('ro-RO') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {o.isTest ? '—' : lei(o.clientTotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {o.isTest ? '—' : o.ocpiCost > 0 ? lei(o.ocpiCost) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Comenzile plătite din serviciile tale (luna plății), fără anulate, rambursate sau de test.
        Taxa OCPI apare pe comandă după ce o raportezi la depunere sau la livrarea directă —
        comenzile încă nelucrate nu au taxa înregistrată, deci profitul perioadei mai scade puțin
        pe măsură ce le lucrezi. Impozitele (16% profit + 16% dividende) sunt cotele legale 2026.
      </p>
    </div>
  );
}
